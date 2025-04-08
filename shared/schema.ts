import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  joinedDate: timestamp("joined_date").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  fixedReplyRequired: boolean("fixed_reply_required").notNull().default(false),
  fixedReply: text("fixed_reply"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const replies = pgTable("replies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  messageId: integer("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  replyDate: timestamp("reply_date").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  fixedReplyRequired: true,
  fixedReply: true,
});

export const insertReplySchema = createInsertSchema(replies).pick({
  userId: true,
  messageId: true,
  content: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertReply = z.infer<typeof insertReplySchema>;
export type Reply = typeof replies.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
