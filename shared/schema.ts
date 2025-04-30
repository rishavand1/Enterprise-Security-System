import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema as the base schema that was already there
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// URL Scan History
export const urlScans = pgTable("url_scans", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  isPhishing: boolean("is_phishing").notNull(),
  reasons: text("reasons").array(),
  scannedAt: text("scanned_at").notNull(),
});

export const insertUrlScanSchema = createInsertSchema(urlScans).pick({
  url: true,
  isPhishing: true,
  reasons: true,
  scannedAt: true,
});

// Mock Virus Database
export const virusDefinitions = pgTable("virus_definitions", {
  id: serial("id").primaryKey(),
  hash: text("hash").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Trojan, Worm, Ransomware, etc.
  description: text("description"),
  severity: text("severity").notNull(), // Critical, High, Medium, Low
});

export const insertVirusDefinitionSchema = createInsertSchema(virusDefinitions).pick({
  hash: true,
  name: true,
  type: true,
  description: true,
  severity: true,
});

// File Scan Results
export const fileScanResults = pgTable("file_scan_results", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileHash: text("file_hash").notNull(),
  isInfected: boolean("is_infected").notNull(),
  virusId: integer("virus_id"),
  scannedAt: text("scanned_at").notNull(),
});

export const insertFileScanResultSchema = createInsertSchema(fileScanResults).pick({
  fileName: true,
  fileSize: true,
  fileHash: true,
  isInfected: true,
  virusId: true,
  scannedAt: true,
});

// Code Vulnerability Types
export const vulnerabilityTypes = pgTable("vulnerability_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull(), // A1:2017, A2:2017, etc.
  description: text("description").notNull(),
  severity: text("severity").notNull(), // Critical, High, Medium, Low
});

export const insertVulnerabilityTypeSchema = createInsertSchema(vulnerabilityTypes).pick({
  name: true,
  code: true,
  description: true,
  severity: true,
});

// Code Scan Results
export const codeScanResults = pgTable("code_scan_results", {
  id: serial("id").primaryKey(),
  language: text("language").notNull(),
  codeSnippet: text("code_snippet").notNull(),
  vulnerabilities: jsonb("vulnerabilities").notNull(),
  scannedAt: text("scanned_at").notNull(),
});

export const insertCodeScanResultSchema = createInsertSchema(codeScanResults).pick({
  language: true,
  codeSnippet: true,
  vulnerabilities: true,
  scannedAt: true,
});

// Export types

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UrlScan = typeof urlScans.$inferSelect;
export type InsertUrlScan = z.infer<typeof insertUrlScanSchema>;

export type VirusDefinition = typeof virusDefinitions.$inferSelect;
export type InsertVirusDefinition = z.infer<typeof insertVirusDefinitionSchema>;

export type FileScanResult = typeof fileScanResults.$inferSelect;
export type InsertFileScanResult = z.infer<typeof insertFileScanResultSchema>;

export type VulnerabilityType = typeof vulnerabilityTypes.$inferSelect;
export type InsertVulnerabilityType = z.infer<typeof insertVulnerabilityTypeSchema>;

export type CodeScanResult = typeof codeScanResults.$inferSelect;
export type InsertCodeScanResult = z.infer<typeof insertCodeScanResultSchema>;

// Common types for application
export type Vulnerability = {
  id: number;
  type: string;
  code: string;
  line: number;
  snippet: string;
  recommendation: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
};

// Subscription Plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // in cents
  duration: integer("duration").notNull(), // in days
  description: text("description").notNull(),
  features: text("features").array().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  planType: text("plan_type").notNull(), // "student", "professional", "enterprise"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  price: true,
  duration: true,
  description: true,
  features: true,
  isActive: true,
  planType: true,
});

// User Subscriptions
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull(), // "active", "expired", "cancelled"
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).pick({
  userId: true,
  planId: true,
  startDate: true,
  endDate: true,
  status: true,
  paymentId: true,
});

// Payment Transactions
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subscriptionId: integer("subscription_id").references(() => userSubscriptions.id),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("INR"),
  paymentId: text("payment_id").notNull(),
  orderId: text("order_id").notNull(),
  status: text("status").notNull(), // "success", "failed", "pending"
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).pick({
  userId: true,
  subscriptionId: true,
  amount: true,
  currency: true,
  paymentId: true,
  orderId: true,
  status: true,
  paymentMethod: true,
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
