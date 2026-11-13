import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const rooms = sqliteTable("rooms", {
  code: text().primaryKey(),
  state: text().notNull(),
  version: integer().notNull(),
  expires: integer().notNull(),
}, table => [index("rooms_expires").on(table.expires)]);
