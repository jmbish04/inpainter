import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const rooms = sqliteTable("rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  floor: text("floor").notNull(),
});

export const photos = sqliteTable("photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: integer("room_id").references(() => rooms.id),
  type: text("type").notNull(),
  url: text("url").notNull(),
  prompt: text("prompt"),
  originalPhotoId: integer("original_photo_id"),
  inspirationPhotoId: integer("inspiration_photo_id"),
});

export const moodBoard = sqliteTable("mood_board", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  photoId: integer("photo_id").references(() => photos.id).notNull(),
});
