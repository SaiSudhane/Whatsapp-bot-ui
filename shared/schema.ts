import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Updated schemas based on the backend.myadvisor.sg API

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

// Login response schema
export const loginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  refresh_token: z.string(),
  advisor: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string()
  })
});

// Refresh token request schema
export const refreshTokenSchema = z.object({
  refresh_token: z.string()
});

// User schema
export const userSchema = z.object({
  id: z.number(),
  salutation: z.string().nullable(),
  name: z.string(),
  mobile_number: z.string(),
  email: z.string().nullable(),
  advisor_id: z.number().nullable(),
  age_group: z.string().nullable(),
  created_at: z.string()
});

// User replies schema
export const userReplySchema = z.object({
  question: z.string(),
  reply: z.string()
});

// Question schema
export const questionSchema = z.object({
  id: z.number(),
  step: z.number(),
  question: z.string(),
  triggerKeyword: z.string()
});

// Add question request schema
export const addQuestionSchema = z.object({
  advisor_id: z.number(),
  question: z.string(),
  triggerKeyword: z.string(),
  is_predefined_answer: z.boolean().optional().default(false)
});

// Update question request schema
export const updateQuestionSchema = z.object({
  step: z.number(),
  question: z.string()
});

// Send message schema
export const sendMessageSchema = z.object({
  advisor_id: z.number(),
  user_id: z.number(),
  message: z.string()
}).passthrough();

// ===== Maintaining database schema for local development =====

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  salutation: text("salutation"),
  name: text("name").notNull(),
  mobile_number: text("mobile_number").notNull(),
  email: text("email"),
  advisor_id: integer("advisor_id"),
  age_group: text("age_group"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  step: integer("step").notNull(),
  question: text("question").notNull(),
  triggerKeyword: text("trigger_keyword").notNull(),
  advisor_id: integer("advisor_id").notNull(),
  is_predefined_answer: boolean("is_predefined_answer").default(false),
});

export const replies = pgTable("replies", {
  question_id: text("question").notNull(),
  reply: text("reply").notNull()
});

// ===== Export types for use in the application =====

export type LoginCredentials = z.infer<typeof loginSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type User = z.infer<typeof userSchema>;
export type UserReply = z.infer<typeof userReplySchema>;
export type Question = z.infer<typeof questionSchema>;
export type AddQuestion = z.infer<typeof addQuestionSchema>;
export type UpdateQuestion = z.infer<typeof updateQuestionSchema>;
export type SendMessage = z.infer<typeof sendMessageSchema>;

// Maintaining these for compatibility with existing code
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  mobile_number: true,
  email: true,
  advisor_id: true,
  age_group: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  step: true,
  question: true,
  triggerKeyword: true,
  advisor_id: true,
  is_predefined_answer: true,
});



export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

