-- Fresh database only. Existing databases should apply drizzle migrations.
CREATE TABLE IF NOT EXISTS rooms (
  code TEXT PRIMARY KEY NOT NULL,
  state TEXT NOT NULL,
  version INTEGER NOT NULL,
  expires INTEGER NOT NULL,
  token TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS rooms_expires ON rooms (expires);
