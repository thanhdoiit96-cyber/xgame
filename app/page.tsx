"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type Player = { id: string; name: string; color: number; score?: number };
type Difficulty = "mixed" | "hard";
type Clue = { id: string; clue: string; stage?: number };
type Result = {
  odd: Player; words: [string, string]; roster: Player[]; counts: Record<string, number>;
  groupWins: boolean; tied: boolean; noVotes: boolean; topic?: string;
  outcome?: "none" | "correct" | "incorrect" | "timeout"; guess?: string; gains?: Record<string, number>;
};
type Room = {
  code: string; host: string; self: string; round: number; now: number;
  phase: "lobby" | "clue" | "vote" | "rescue" | "result";
  players: Player[]; deadline: number | null; notice?: string; word?: string;
  difficulty: Difficulty; clues?: Clue[]; twoClues?: boolean; clueStage?: number; clueCount?: number; sentClue?: boolean;
  voteCount?: number; votedFor?: string; result?: Result; rescue?: { canGuess: boolean; name: string }; locked?: boolean; lockCode?: string;
};
type Session = { code: string; token: string };
type RoomList = { code: string; playerCount: number; slots: number; hostName: string; phase: string; locked: boolean; lockCode?: string; status: "playing" | "waiting" };
type Reply = { room?: Room; rooms?: RoomList[]; token?: string; left?: boolean; error?: string };
type IconName = "bolt" | "help" | "plus" | "enter" | "users" | "clock" | "eye" | "copy" | "arrow" | "check" | "chat" | "vote" | "trophy" | "lock";
const paths: Record<IconName, ReactNode> = {
  bolt: <path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3h.01"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  enter: <path d="M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5M3 12h12m-4-4 4 4-4 4"/>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m1-15a3 3 0 0 1 0 6m2 3a4 4 0 0 1 3 4v2"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2"/></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  chat: <path d="M21 11a8 8 0 0 1-8 8H9l-5 3v-6a8 8 0 0 1 7-13h2a8 8 0 0 1 8 8Z"/>,
  vote: <path d="m9 3-4 5 7 6 5-6-6-5Zm-5 9-2 4v4h20v-4l-2-4m-14 4h12"/>,
  trophy: <path d="M8 3h8v7a4 4 0 0 1-8 0zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 3v5m-4 1h8"/>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const steps = [
  { icon: "eye", title: "Nhận từ bí mật", detail: "Cả nhóm nhận từ giống nhau, riêng một người nhận từ khác." },
  { icon: "chat", title: "Thả hai gợi ý kín", detail: "Viết tối đa 3 từ ở lượt đầu và một câu ngắn ở lượt sau. Gợi ý chỉ hiện khi lượt kết thúc." },
  { icon: "vote", title: "Bỏ phiếu và lật kèo", detail: "Bỏ phiếu tìm người lạc quẻ. Nếu bị bắt, người đó còn một lần đoán từ của cả nhóm." },
] satisfies { icon: IconName; title: string; detail: string }[];

const difficulties = [
  { key: "mixed", label: "Tiêu chuẩn", description: "Hai từ cùng chủ đề, khác nhau đủ để gợi ý." },
  { key: "hard", label: "Đấu trí", description: "Hai từ thuộc nhóm hẹp hơn hoặc chỉ khác sắc thái." },
] satisfies { key: Difficulty; label: string; description: string }[];

const avatars = ["◉", "✿", "◆", "✦", "☻"];
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
const normalizeRoomCode = (value: string) => value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, "").slice(0, 5);
const codeInput = normalizeRoomCode;

async function api(body?: Record<string, unknown>, session?: Session): Promise<Reply> {
  const url = session && !body ? `/api/rooms?code=${session.code}` : "/api/rooms";
  const headers: Record<string, string> = {};
  if (session) headers.Authorization = `Bearer ${session.token}`;
  if (body) headers["Content-Type"] = "application/json";
  const response = await fetch(url, { method: body ? "POST" : "GET", headers, body: body && JSON.stringify(body), cache: "no-store" });
  if (!(response.headers.get("content-type") ?? "").includes("application/json")) throw new Error("Máy chủ chưa phản hồi. Hãy thử lại.");
  const reply: Reply = await response.json();
  if (!response.ok) throw Object.assign(new Error(reply.error ?? "Có lỗi kết nối."), { status: response.status });
  return reply;
}

function Avatar({ player }: { player: Player }) {
  return <span aria-hidden="true" className={`avatar color-${player.color}`}>{avatars[player.color]}</span>;
}

function HeroArt() {
  return <div className="hero-art" aria-hidden="true">
    <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
    <span className="spark spark-a">✦</span><span className="spark spark-b">✧</span>
    <span className="spark spark-c">✦</span><span className="spark spark-d">·</span>
    <div className="game-card card-back"><span>✦</span><b>✧</b><small>✦</small></div>
    <div className="game-card card-right"><span>✷</span><b>✷</b><small>✷</small></div>
    <div className="game-card card-front"><span>✦</span><b>?</b><small>✦</small></div>
    <div className="art-eyes"><i/><i/></div>
  </div>;
}

export default function Game() {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [roomKey, setRoomKey] = useState("");
  const [joinKey, setJoinKey] = useState("");
  const [lockCreate, setLockCreate] = useState(false);
  const [lockJoin, setLockJoin] = useState(false);
  const [lockDraft, setLockDraft] = useState("");
  const [session, setSession] = useState<Session>();
  const [room, setRoom] = useState<Room>();
  const [availableRooms, setAvailableRooms] = useState<RoomList[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [clue, setClue] = useState("");
  const [target, setTarget] = useState("");
  const [guess, setGuess] = useState("");
  const [wordOpen, setWordOpen] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [copied, setCopied] = useState("");
  const [invite, setInvite] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const generation = useRef(0);
  const lastSync = useRef(0);

  function apply(next: Room) {
    lastSync.current = Date.now() - next.now;
    setRoom(next);
  }

  useEffect(() => {
    const invited = codeInput(new URLSearchParams(location.search).get("room") ?? "");
    if (invited.length === 5) { setCode(invited); setTab("join"); }
    try {
      setName(localStorage.getItem("alq-name") ?? "");
      const saved = JSON.parse(sessionStorage.getItem("alq-session") ?? "null") as Session | null;
      if (saved?.token && (!invited || saved.code === invited)) setSession(saved);
    } catch {}
  }, []);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const reply = await api({ action: "list" });
        setAvailableRooms(reply.rooms ?? []);
      } catch {
        setAvailableRooms([]);
      }
    }
    fetchRooms();
    const timer = setInterval(fetchRooms, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      const current = generation.current;
      try {
        const reply = await api(undefined, session);
        if (!stop && current === generation.current && reply.room) {
          apply(reply.room);
          setOffline(false);
        }
      } catch (failure) {
        if (!stop && current === generation.current) {
          const e = failure as Error & { status?: number };
          if (e.status === 401 || e.status === 404) {
            sessionStorage.removeItem("alq-session");
            setRoom(undefined);
            setSession(undefined);
            setError(e.message);
            return;
          }
          setOffline(true);
        }
      }
      if (!stop) timer = setTimeout(poll, 1600);
    }
    poll();
    return () => { stop = true; clearTimeout(timer); };
  }, [session]);

  useEffect(() => {
    setWordOpen(false);
    setTarget("");
    setGuess("");
  }, [room?.round, room?.code]);

  useEffect(() => {
    if (room?.lockCode) setLockDraft(room.lockCode);
    else if (!room?.locked) setLockDraft("");
  }, [room?.code, room?.locked, room?.lockCode]);

  useEffect(() => { setClue(""); }, [room?.round, room?.code, room?.clueStage]);

  useEffect(() => {
    if (!room?.deadline) return;
    const deadline = room.deadline;
    const tick = () => setSeconds(Math.max(0, Math.ceil((deadline - Date.now() + lastSync.current) / 1000)));
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [room?.deadline]);

  async function send(action: string, data: Record<string, unknown> = {}) {
    if (pending) return;
    setPending(true);
    setError("");
    generation.current++;
    try {
      const reply = await api({ action, code: session?.code ?? code, round: room?.round, ...data }, session);
      generation.current++;
      if (reply.room) apply(reply.room);
      if (reply.token && reply.room) {
        const next = { token: reply.token, code: reply.room.code };
        sessionStorage.setItem("alq-session", JSON.stringify(next));
        localStorage.setItem("alq-name", name.trim());
        setSession(next);
        history.replaceState(null, "", location.pathname);
      }
      if (reply.left) {
        sessionStorage.removeItem("alq-session");
        setRoom(undefined);
        setSession(undefined);
        setCode("");
        setTab("create");
      }
      setOffline(false);
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextKey = tab === "create" ? roomKey : joinKey;
    send(tab, { name, key: nextKey });
  }

  function generateRoomLock() {
    const next = String(Math.floor(100000 + Math.random() * 900000));
    setRoomKey(next);
    setLockDraft(next);
    return next;
  }

  async function copyLink() {
    if (!room) return;
    const url = new URL(location.pathname, location.origin);
    url.searchParams.set("room", room.code);
    try {
      await navigator.clipboard.writeText(url.href);
      setInvite("");
      setCopied("Đã sao chép");
      setTimeout(() => setCopied(""), 2200);
    } catch {
      setInvite(url.href);
    }
  }

  const host = room?.host === room?.self;
  const player = (id: string) => room?.players.find(person => person.id === id);
  const sentClue = room?.sentClue ?? room?.clues?.some(entry => entry.id === room.self);
  const active = room?.phase === "clue" || room?.phase === "vote" || room?.phase === "rescue";
  const result = room?.result;
  const phaseTitle = {
    lobby: "Tập hợp cả hội", clue: "Thả gợi ý", vote: "Ai đáng nghi nhất?",
    rescue: "Cơ hội lật kèo", result: "Lộ diện rồi!",
  };
  const ranking = room && [...room.players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const setup = room && ["lobby", "result"].includes(room.phase);

  return <>
    <header className="top"><div className="wrap nav">
      <a className="brand" href="/" aria-label="Ai Lạc Quẻ, trang chủ"><span><Icon name="bolt" size={18}/></span> Ai Lạc Quẻ<span className="brand-q">?</span></a>
      <button className="plain help" onClick={() => dialog.current?.showModal()}><Icon name="help" size={18}/> Luật chơi</button>
    </div></header>

    <main className={`wrap ${room ? "playing" : "home"}`}>
      {!room && <>
        <section className="entry" aria-label="Tạo hoặc vào phòng">
          <div className="intro">
            <div className="pills"><span><Icon name="users" size={17}/>3–5 người</span><span><Icon name="clock" size={17}/>2–3 phút / ván</span></div>
            <h1>Ai Lạc <em>Quẻ?</em></h1>
            <p className="tagline">Cả nhóm có chung một từ bí mật. Ai đó lại nhận được một từ khác. Bạn có tìm ra người lạc quẻ?</p>
            <HeroArt/>
          </div>
          <form className="panel room-form" onSubmit={submit}>
            <div className="switch" aria-label="Chế độ phòng">
              <button type="button" className={tab === "create" ? "selected" : ""} aria-pressed={tab === "create"} onClick={() => {setTab("create"); setError("");}}><Icon name="plus" size={18}/> Tạo phòng</button>
              <button type="button" className={tab === "join" ? "selected" : ""} aria-pressed={tab === "join"} onClick={() => {setTab("join"); setError("");}}><Icon name="enter" size={18}/> Vào phòng</button>
            </div>
            <h2>{tab === "create" ? "Rủ hội vào chơi" : "Vào phòng của bạn bè"}</h2>
            <p className="muted">{tab === "create" ? "Tạo phòng rồi gửi link hoặc mã cho bạn bè." : "Nhập mã 5 ký tự mà chủ phòng gửi cho bạn."}</p>
            <label htmlFor="name">Biệt danh</label>
            <input id="name" value={name} onChange={e => setName(e.target.value)} maxLength={20} placeholder="Ví dụ: Mèo Mướp" autoComplete="off" required/>
            {tab === "join" && <>
              <label htmlFor="code">Mã phòng</label>
              <input id="code" className="code-input" value={code} onChange={e => setCode(codeInput(e.target.value))} placeholder="Ví dụ: K7V2M" minLength={5} maxLength={5} autoCapitalize="characters" autoComplete="off" required/>
              <button type="button" className={`secondary toggle-lock ${lockJoin ? "selected" : ""}`} onClick={() => setLockJoin(v => !v)}>
                <Icon name={lockJoin ? "lock" : "enter"} size={16}/> {lockJoin ? "Vào phòng có khóa" : "Tôi muốn vào phòng có khóa"}
              </button>
              {lockJoin && <>
                <label htmlFor="joinKey">Mã khóa phòng</label>
                <input id="joinKey" value={joinKey} onChange={e => setJoinKey(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} inputMode="numeric" placeholder="Ví dụ: 482913" autoComplete="off"/>
              </>}
              <div className="room-list">
                <div className="people-title"><h2>Phòng đang mở</h2><span>{availableRooms.length}</span></div>
                {availableRooms.length ? availableRooms.map(item => (
                  <button key={item.code} type="button" className={`room-item ${item.locked ? "locked" : "open"}`} onClick={() => { setCode(item.code); setJoinKey(item.lockCode || ""); setLockJoin(Boolean(item.lockCode)); }}>
                    <div className="room-item-main">
                      <div>
                        <strong>{item.code}</strong>
                        <small>{item.hostName}</small>
                      </div>
                      <span className={`status-badge ${item.status === "playing" ? "warn" : "success"}`}>{item.status === "playing" ? "Đang chơi" : "Chờ người"}</span>
                    </div>
                    <span className="room-item-meta">{item.playerCount}/5 · {item.slots} chỗ còn{item.lockCode ? ` · Khóa ${item.lockCode}` : ""}</span>
                  </button>
                )) : <p className="muted">Chưa có phòng nào đang mở. Hãy tạo phòng mới.</p>}
              </div>
            </>}
            {tab === "create" && <>
              <button type="button" className={`secondary toggle-lock ${lockCreate ? "selected" : ""}`} onClick={() => {
                setLockCreate(v => !v);
                if (!lockCreate) generateRoomLock();
              }}>
                <Icon name={lockCreate ? "lock" : "plus"} size={16}/> {lockCreate ? "Đã bật khóa phòng" : "Tạo phòng có khóa"}
              </button>
              {lockCreate && <>
                <label htmlFor="roomKey">Mã khóa phòng</label>
                <div className="lock-input-row">
                  <input id="roomKey" value={roomKey} onChange={e => setRoomKey(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} inputMode="numeric" placeholder="123456" autoComplete="off" readOnly={false} />
                  <button type="button" className="secondary" onClick={generateRoomLock}>Tạo mới</button>
                </div>
              </>}
            </>}
            {error && <p className="alert" role="alert">{error}</p>}
            {offline && <p className="alert" role="status">Đang kết nối lại phòng…</p>}
            <button className="primary" disabled={pending || Boolean(session) || !name.trim() || (tab === "join" && code.length !== 5) || (tab === "join" && lockJoin && joinKey.length !== 6)}>{pending || session ? "Đang kết nối…" : tab === "create" ? "Tạo phòng ngay" : "Vào phòng"}<Icon name="arrow" size={18}/></button>
            <div className="form-note">Vào game bằng biệt danh</div>
          </form>
        </section>
        <section className="how" aria-label="Cách chơi"><h2>Cách chơi</h2><div className="steps">
          {steps.map((step, i) => <article key={step.title}><span className={`step-icon color-${i}`}><Icon name={step.icon} size={23}/></span><div><h3>{step.title}</h3><p>{step.detail}</p></div></article>)}
        </div></section>
      </>}

      {room && <>
        <div className="room-top">
          <div><span className="eyeline">{room.round ? `VÁN ${room.round}` : "PHÒNG CHỜ"}</span><h1>{phaseTitle[room.phase]}</h1></div>
          <button className="plain leave" disabled={pending} onClick={() => send("leave")}><Icon name="enter" size={18}/> Rời phòng</button>
        </div>
        {error && <p className="alert" role="alert">{error}</p>}
        {offline && <p className="alert" role="status">Mất kết nối tạm thời. Đang kết nối lại…</p>}
        {room.notice && <p className="alert" role="status">{room.notice}</p>}
        <div className="room-grid">
          <section className="panel match" aria-label="Ván chơi">
            {room.phase === "lobby" && <>
              <span className="step-icon color-0"><Icon name="users" size={24}/></span>
              <h2>{room.players.length < 3 ? "Đang chờ bạn bè" : "Đủ người chơi rồi!"}</h2>
              <p className="muted">{room.players.length < 3 ? "Cần ít nhất 3 người. Gửi link mời để mọi người vào phòng." : host ? "Bạn có thể bắt đầu ngay hoặc chờ thêm người." : "Chờ chủ phòng bắt đầu ván."}</p>
              {host && <button className="primary" onClick={() => send("start")} disabled={pending || room.players.length < 3}>Bắt đầu ván<Icon name="arrow" size={18}/></button>}
            </>}

            {active && <>
              <div className="round-top"><span className="eyeline">{room.phase === "clue" ? (room.clueStage ? `GỢI Ý ${room.clueStage}/2` : "GỬI GỢI Ý") : room.phase === "vote" ? "BỎ PHIẾU" : "LẬT KÈO"}</span><span className="timer"><Icon name="clock" size={17}/>{formatTime(seconds)}</span></div>
              <button className={`secret ${wordOpen ? "revealed" : ""}`} onClick={() => setWordOpen(!wordOpen)} aria-expanded={wordOpen}>
                <Icon name={wordOpen ? "eye" : "lock"} size={22}/><span>{wordOpen ? room.word : "Xem từ bí mật của bạn"}</span>
              </button>
              {room.phase === "clue" && <>
                <h2>{room.clueStage === 1 ? "Gợi ý bằng tối đa 3 từ" : room.clueStage === 2 ? "Thêm một gợi ý cụ thể" : "Gợi ý của bạn"}</h2>
                <p className="muted">{sentClue ? "Đã gửi. Gợi ý sẽ hiện khi lượt này kết thúc." : room.clueStage === 2 ? "Dựa vào lượt đầu, viết một câu ngắn tối đa 12 từ." : "Gợi ý về từ bí mật của bạn. Giữ kín đủ để người lạc quẻ khó đoán."}</p>
                {room.clueStage && <p className="submitted" role="status">{room.clueCount}/{room.players.length} người đã gửi</p>}
                {!sentClue && <form onSubmit={e => { e.preventDefault(); send("clue", { clue, stage: room.clueStage }); }}>
                  <label className="sr-only" htmlFor="clue">Gợi ý của bạn</label>
                  <input id="clue" autoComplete="off" value={clue} onChange={e => setClue(e.target.value)} maxLength={70} placeholder={room.clueStage === 1 ? "Ví dụ: Giòn, thơm" : "Ví dụ: Hay gọi lúc trời nóng"} required/>
                  <button className="primary" disabled={pending || !clue.trim() || seconds === 0}>Gửi gợi ý<Icon name="arrow" size={18}/></button>
                </form>}
              </>}
              {room.phase === "vote" && <>
                <h2>Chọn người lạc quẻ</h2>
                <p className="muted">{room.votedFor ? `Bạn đã chọn ${player(room.votedFor)?.name}. Đã có ${room.voteCount}/${room.players.length} phiếu.` : "Đọc các gợi ý và chọn một người. Phiếu đã chốt sẽ được giữ nguyên."}</p>
                <div className="choices">
                  {room.players.filter(person => person.id !== room.self).map(person =>
                    <button className={`choice ${(room.votedFor ?? target) === person.id ? "picked" : ""}`} key={person.id} disabled={Boolean(room.votedFor)} onClick={() => setTarget(person.id)} aria-pressed={(room.votedFor ?? target) === person.id}>
                      <Avatar player={person}/><span>{person.name}</span>{(room.votedFor ?? target) === person.id && <Icon name="check" size={17}/>}
                    </button>
                  )}
                </div>
                {!room.votedFor && <button className="primary" disabled={pending || !target || seconds === 0} onClick={() => send("vote", { target })}>Chốt phiếu<Icon name="check" size={18}/></button>}
              </>}
              {room.rescue && <>
                <h2>{room.rescue.canGuess ? "Bạn có một lần đoán!" : `${room.rescue.name} đang đoán từ`}</h2>
                <p className="muted">{room.rescue.canGuess ? "Xem lại các gợi ý và nhập từ của cả nhóm. Đoán đúng sẽ thắng ván." : "Cả nhóm đã bắt đúng người. Nếu họ đoán đúng từ của nhóm, họ sẽ lật kèo."}</p>
                {room.rescue.canGuess && <form onSubmit={e => { e.preventDefault(); send("guess", { guess }); }}>
                  <label htmlFor="guess" className="sr-only">Từ của cả nhóm</label>
                  <input id="guess" value={guess} onChange={e => setGuess(e.target.value)} maxLength={70} autoComplete="off" placeholder="Nhập từ của cả nhóm" required/>
                  <button className="primary" disabled={pending || !guess.trim() || seconds === 0}>Chốt đáp án<Icon name="arrow" size={18}/></button>
                </form>}
              </>}
              {(room.phase !== "clue" || room.clueStage !== 1) &&
                (room.twoClues ? [1, 2].map(stage => {
                  if (room.phase === "clue" && stage >= (room.clueStage ?? 0)) return null;
                  const clues = room.clues?.filter(entry => entry.stage === stage) ?? [];
                  return <div className="clues" key={stage}><h3>Gợi ý lượt {stage}</h3>
                    {clues.length ? clues.map(entry => <div key={entry.id}><b>{player(entry.id)?.name}</b><span>{entry.clue}</span></div>) : <p className="muted">Không có gợi ý trong lượt này.</p>}
                  </div>;
                }) : <div className="clues"><h3>Gợi ý đã mở</h3>
                  {room.clues?.length ? room.clues.map(entry => <div key={entry.id}><b>{player(entry.id)?.name}</b><span>{entry.clue}</span></div>) : <p className="muted">Chưa có gợi ý.</p>}
                </div>)}
            </>}

            {result && <>
              <span className={`step-icon color-${result.groupWins ? 0 : 2}`}><Icon name="trophy" size={24}/></span>
              <h2>{result.noVotes ? "Ván không tính điểm" : result.outcome === "correct" ? "Lật kèo thành công!" : result.groupWins ? "Cả nhóm thắng!" : "Người lạc quẻ thoát!"}</h2>
              <p className="muted"><strong>{result.odd.name}</strong> là người lạc quẻ.{result.tied ? " Hai hoặc nhiều người cùng dẫn đầu phiếu." : result.noVotes ? " Không có phiếu nào được chốt." : result.outcome === "timeout" ? " Đã hết giờ đoán từ." : ""}</p>
              {result.guess && <p className="guess-result">Từ đã đoán <strong>{result.guess}</strong> · {result.outcome === "correct" ? "Chính xác" : "Chưa đúng"}</p>}
              {result.topic && <p className="submitted">Chủ đề · {result.topic}</p>}
              <div className="words"><div><span>Từ của cả nhóm</span><b>{result.words[0]}</b></div><div><span>Từ của người lạc quẻ</span><b>{result.words[1]}</b></div></div>
              <div className="clues"><h3>Kết quả bỏ phiếu</h3>{result.roster.map(person => <div key={person.id}><b>{person.name}</b><span>{result.counts[person.id]} phiếu{Boolean(result.gains?.[person.id]) && <strong className="gain">+{result.gains?.[person.id]} điểm</strong>}</span></div>)}</div>
              {host ? <button className="primary" onClick={() => send("start")} disabled={pending || room.players.length < 3}>Chơi ván mới<Icon name="arrow" size={18}/></button> : <p className="muted replay-note">Chờ chủ phòng mở ván mới.</p>}
              {host && room.players.length < 3 && <p className="muted replay-note">Mời thêm bạn để đủ 3 người.</p>}
            </>}
          </section>
          <aside className="panel people" aria-label="Người chơi">
            <div className="people-title"><h2>Người chơi</h2><span>{room.players.length}/5</span></div>
            <ul>{ranking?.map(person => <li key={person.id}><Avatar player={person}/><span>{person.name}{person.id === room.self && <small> (bạn)</small>}{person.id === room.host && <small className="host-label">Chủ phòng</small>}</span><span className="score" aria-label={`${person.score ?? 0} điểm`}>{person.score ?? 0} đ</span></li>)}</ul>
            {setup && <div className="difficulty">
              <h3>Độ khó ván tới</h3>
              {host ? <div className="switch" aria-label="Độ khó ván tới">
                {difficulties.map(option => <button type="button" key={option.key} className={room.difficulty === option.key ? "selected" : ""} aria-pressed={room.difficulty === option.key} disabled={pending} onClick={() => send("settings", { difficulty: option.key })}>{option.label}</button>)}
              </div> : <strong>{difficulties.find(option => option.key === room.difficulty)?.label}</strong>}
              <p className="muted">{difficulties.find(option => option.key === room.difficulty)?.description}</p>
              {host && <div className="lock-settings">
                <h3>Khóa phòng</h3>
                <button type="button" className={`secondary ${room.locked ? "selected" : ""}`} onClick={() => send("settings", { lock: room.locked ? "" : (lockDraft || String(Math.floor(100000 + Math.random() * 900000))) })} disabled={pending}>
                  <Icon name={room.locked ? "lock" : "plus"} size={16}/>{room.locked ? "Tắt khóa" : "Bật khóa"}
                </button>
                {room.locked && <div className="lock-input-row">
                  <input value={lockDraft} onChange={e => setLockDraft(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} inputMode="numeric" placeholder="123456"/>
                  <button type="button" className="secondary" onClick={() => send("settings", { lock: lockDraft || "" })} disabled={pending || lockDraft.length !== 6}>Lưu</button>
                </div>}
              </div>}
            </div>}
            <div className="invite">
              <span>Mã phòng</span><strong>{room.code}</strong>
              <button className="secondary" onClick={copyLink}><Icon name={copied ? "check" : "copy"} size={17}/> {copied || "Sao chép link mời"}</button>
              {invite && <input aria-label="Link mời" readOnly value={invite} onFocus={e => e.currentTarget.select()}/>}
            </div>
          </aside>
        </div>
      </>}
    </main>
    <footer className="wrap footer"><span><Icon name="bolt" size={15}/> Ai Lạc Quẻ?</span><span>Game nhóm · Tiếng Việt</span></footer>

    <dialog ref={dialog} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="dialog-body"><div className="people-title"><h2>Luật chơi</h2><button className="plain close" onClick={() => dialog.current?.close()} aria-label="Đóng">×</button></div>
        {steps.map(step => <div className="rule" key={step.title}><Icon name={step.icon}/><div><h3>{step.title}</h3><p>{step.detail}</p></div></div>)}
        <div className="rule"><Icon name="trophy"/><div><h3>Điểm qua nhiều ván</h3><p>Nếu nhóm thắng, mỗi người bỏ phiếu đúng được 2 điểm. Người lạc quẻ được 3 điểm nếu thoát hoặc đoán đúng từ của nhóm. Hòa ở vị trí nhiều phiếu nhất thì người lạc quẻ thoát. Ván không có phiếu sẽ không tính điểm.</p></div></div>
      </div>
    </dialog>
  </>;
}
