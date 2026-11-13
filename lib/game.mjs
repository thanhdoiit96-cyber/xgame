import { normalizeWord, wordPools } from "./word-bank.mjs";

export const roomTtl = 2 * 60 * 60 * 1000;
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const activePhases = ["clue", "vote", "rescue"];

function randomIndex(length) {
  return Math.floor(Math.random() * length);
}

export function roomCode() {
  return Array.from(crypto.getRandomValues(new Uint8Array(5)), n => alphabet[n & 31]).join("");
}

/** @returns {never} */
function fault(message, status = 409) {
  throw Object.assign(new Error(message), { status });
}

function clean(value, max) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

function addPlayer(room, rawName) {
  if (room.players.length >= 5) fault("Phòng đã đủ 5 người.");
  const name = clean(rawName, 20);
  if (!name) fault("Bạn cần nhập biệt danh.", 400);
  if (room.players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
    fault("Biệt danh này đã có người dùng.");
  }
  const color = [0, 1, 2, 3, 4].find(index => !room.players.some(player => player.color === index));
  const player = { id: crypto.randomUUID(), token: crypto.randomUUID(), name, color, score: 0 };
  room.players.push(player);
  return player;
}

export function createRoom(code, name) {
  const room = { code, host: null, phase: "lobby", players: [], round: 0, usedPairs: [], deadline: null, difficulty: "mixed" };
  const player = addPlayer(room, name);
  room.host = player.id;
  return { room, token: player.token };
}

function votesSummary(room) {
  const counts = Object.fromEntries(room.roster.map(({ id }) => [id, 0]));
  Object.values(room.votes).forEach(id => counts[id]++);
  const max = Math.max(...Object.values(counts));
  const leaders = room.roster.filter(({ id }) => max > 0 && counts[id] === max);
  return {
    counts,
    caught: leaders.length === 1 && leaders[0].id === room.odd,
    tied: leaders.length > 1,
    noVotes: max === 0,
  };
}

function finish(room, outcome = "none") {
  room.phase = "result";
  room.deadline = null;
  if (!room.clueStage) return;
  room.rescueOutcome = outcome;
  const { caught, noVotes } = votesSummary(room);
  const groupWins = caught && outcome !== "correct";
  room.gains = {};
  for (const player of room.players) {
    const points = noVotes ? 0
      : groupWins ? (room.votes[player.id] === room.odd ? 2 : 0)
      : player.id === room.odd ? 3 : 0;
    room.gains[player.id] = points;
    player.score = (player.score ?? 0) + points;
  }
}

export function advance(room, now) {
  if (room.phase === "clue") {
    const current = room.clueStage
      ? room.clues.filter(entry => entry.stage === room.clueStage)
      : room.clues;
    if (now >= room.deadline || current.length === room.players.length) {
      if (room.clueStage === 1) {
        room.clueStage = 2;
        room.deadline = now + 40_000;
      } else {
        room.phase = "vote";
        room.deadline = now + 35_000;
      }
      return true;
    }
  }
  if (room.phase === "vote" && (now >= room.deadline || Object.keys(room.votes).length === room.players.length)) {
    if (room.clueStage && votesSummary(room).caught) {
      room.phase = "rescue";
      room.deadline = now + 20_000;
    } else {
      finish(room);
    }
    return true;
  }
  if (room.phase === "rescue" && now >= room.deadline) {
    finish(room, "timeout");
    return true;
  }
  return false;
}

export function identify(room, token) {
  const player = room.players.find(candidate => candidate.token === token);
  if (!player) fault("Bạn cần vào lại phòng này.", 401);
  return player;
}

function selectPair(room) {
  const pool = wordPools[room.difficulty ?? "mixed"];
  const used = new Set(room.usedPairs);
  let available = pool.filter(pair => !used.has(pair.key));
  if (!available.length) {
    const keys = new Set(pool.map(pair => pair.key));
    room.usedPairs = room.usedPairs.filter(key => typeof key === "string" && !keys.has(key));
    available = pool;
  }
  const lastWords = new Set(room.words ?? []);
  const fresh = available.filter(pair => pair.words.every(word => !lastWords.has(word)));
  if (fresh.length) available = fresh;
  const pair = available[randomIndex(available.length)];
  room.usedPairs.push(pair.key);
  return pair;
}

function startRound(room, now) {
  const pair = selectPair(room);
  room.words = [...pair.words];
  if (randomIndex(2)) room.words.reverse();
  room.topic = pair.topic;
  room.oddTurns ??= {};
  const eligible = room.players.filter(player => player.id !== room.odd);
  const weights = eligible.map(player => 1 / (1 + (room.oddTurns[player.id] ?? 0)));
  let draw = Math.random() * weights.reduce((sum, weight) => sum + weight, 0);
  room.odd = eligible.find((_, index) => (draw -= weights[index]) < 0)?.id ?? eligible.at(-1).id;
  room.oddTurns[room.odd] = (room.oddTurns[room.odd] ?? 0) + 1;
  room.roster = room.players.map(({ id, name, color }) => ({ id, name, color }));
  room.round += 1;
  room.clues = [];
  room.votes = {};
  room.clueStage = 1;
  room.phase = "clue";
  room.deadline = now + 45_000;
  delete room.rescueOutcome;
  delete room.guess;
  delete room.gains;
  delete room.notice;
}

function saveClue(room, player, body) {
  const clue = clean(body.clue, 70);
  const normalized = normalizeWord(clue);
  if (!normalized) fault("Hãy viết một gợi ý có chữ hoặc số.", 400);
  if (room.clueStage && body.stage !== room.clueStage) fault("Lượt gợi ý đã thay đổi. Hãy thử lại.");
  const limit = room.clueStage === 1 ? 3 : 12;
  if (room.clueStage && normalized.split(" ").length > limit) fault(`Lượt này chỉ được dùng tối đa ${limit} từ.`, 400);
  const previous = room.clues.filter(entry => entry.id === player.id);
  if (previous.some(entry => entry.stage === room.clueStage)) fault("Bạn đã gửi gợi ý lượt này.");
  if (previous.some(entry => normalizeWord(entry.clue) === normalized)) fault("Hãy thử một gợi ý khác với lượt đầu.");
  const secret = normalizeWord(room.words[player.id === room.odd ? 1 : 0]);
  if ((` ${normalized} `).includes(` ${secret} `) ||
      (secret.includes(" ") && normalized.replaceAll(" ", "").includes(secret.replaceAll(" ", "")))) {
    fault("Gợi ý đang chứa từ khóa của bạn.");
  }
  room.clues.push({ id: player.id, clue, stage: room.clueStage });
}

export function act(room, action, body, token, now) {
  if (action === "join") {
    if (!["lobby", "result"].includes(room.phase)) fault("Ván đang diễn ra. Bạn có thể vào khi ván kết thúc.");
    return { player: addPlayer(room, body.name) };
  }
  const player = identify(room, token);
  if (action === "leave") {
    room.players = room.players.filter(candidate => candidate.id !== player.id);
    if (room.oddTurns) delete room.oddTurns[player.id];
    if (room.host === player.id) room.host = room.players[0]?.id ?? null;
    if (activePhases.includes(room.phase)) {
      room.phase = "lobby";
      room.deadline = null;
      room.notice = `${player.name} đã rời phòng. Ván vừa rồi đã dừng.`;
    }
    return { left: true };
  }
  if (action === "start" || action === "settings") {
    if (room.host !== player.id) fault("Chỉ chủ phòng có thể thực hiện thao tác này.", 403);
    if (!["lobby", "result"].includes(room.phase)) fault("Hãy chờ ván hiện tại kết thúc.");
    if (action === "settings") {
      if (body.difficulty !== "mixed" && body.difficulty !== "hard") fault("Độ khó không hợp lệ.", 400);
      room.difficulty = body.difficulty;
    } else {
      if (room.players.length < 3) fault("Cần 3–5 người để bắt đầu ván.");
      startRound(room, now);
    }
    return { player };
  }
  if (body.round !== room.round) fault("Ván đã thay đổi. Hãy thử lại.");
  if (action === "clue" && room.phase === "clue") {
    saveClue(room, player, body);
    return { player };
  }
  if (action === "vote" && room.phase === "vote") {
    if (room.votes[player.id]) fault("Bạn đã chốt phiếu.");
    if (body.target === player.id || !room.players.some(candidate => candidate.id === body.target)) {
      fault("Hãy chọn một người khác trong phòng.", 400);
    }
    room.votes[player.id] = body.target;
    return { player };
  }
  if (action === "guess" && room.phase === "rescue") {
    if (player.id !== room.odd) fault("Chỉ người lạc quẻ mới được đoán.", 403);
    const guess = clean(body.guess, 70);
    if (!normalizeWord(guess)) fault("Hãy nhập một từ khóa để đoán.", 400);
    room.guess = guess;
    finish(room, normalizeWord(guess) === normalizeWord(room.words[0]) ? "correct" : "incorrect");
    return { player };
  }
  fault("Thao tác này đã hết lượt hoặc chưa đến lượt.");
}

export function snapshot(room, player, now) {
  const visible = {
    code: room.code, host: room.host, phase: room.phase, round: room.round, self: player.id,
    players: room.players.map(({ id, name, color, score }) => ({ id, name, color, score: score ?? 0 })),
    deadline: room.deadline, now, notice: room.notice, difficulty: room.difficulty ?? "mixed",
  };
  if (activePhases.includes(room.phase)) {
    visible.word = room.words[player.id === room.odd ? 1 : 0];
    visible.twoClues = Boolean(room.clueStage);
    const sealed = room.phase === "clue" && room.clueStage;
    visible.clues = sealed ? room.clues.filter(entry => entry.stage < room.clueStage) : room.clues;
    visible.voteCount = Object.keys(room.votes).length;
    visible.votedFor = room.votes[player.id];
    if (room.phase === "clue" && room.clueStage) {
      const current = room.clues.filter(entry => entry.stage === room.clueStage);
      visible.clueStage = room.clueStage;
      visible.clueCount = current.length;
      visible.sentClue = current.some(entry => entry.id === player.id);
    }
    if (room.phase === "rescue") visible.rescue = { canGuess: player.id === room.odd, name: room.roster.find(({ id }) => id === room.odd).name };
  }
  if (room.phase === "result") {
    const summary = votesSummary(room);
    visible.result = {
      ...summary, odd: room.roster.find(({ id }) => id === room.odd),
      words: room.words, roster: room.roster, topic: room.topic,
      groupWins: summary.caught && room.rescueOutcome !== "correct",
      outcome: room.rescueOutcome, guess: room.guess, gains: room.gains,
    };
  }
  return visible;
}
