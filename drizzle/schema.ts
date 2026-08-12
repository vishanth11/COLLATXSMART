import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const customerProfiles = mysqlTable("customer_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  phone: varchar("phone", { length: 32 }),
  address: text("address"),
  occupation: varchar("occupation", { length: 160 }),
  monthlyIncome: int("monthlyIncome"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const loanApplications = mysqlTable("loan_applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  applicationNumber: varchar("applicationNumber", { length: 40 }).notNull().unique(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  mobile: varchar("mobile", { length: 32 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  address: text("address").notNull(),
  occupation: varchar("occupation", { length: 160 }).notNull(),
  monthlyIncome: int("monthlyIncome").notNull(),
  loanType: varchar("loanType", { length: 32 }).notNull(),
  requiredAmount: int("requiredAmount").notNull(),
  purpose: text("purpose").notNull(),
  repaymentFrequency: varchar("repaymentFrequency", { length: 16 }).notNull(),
  preferredDuration: int("preferredDuration").notNull(),
  collateralType: varchar("collateralType", { length: 40 }).notNull(),
  collateralDetails: text("collateralDetails"),
  estimatedValue: int("estimatedValue"),
  referenceNumber: varchar("referenceNumber", { length: 120 }),
  status: mysqlEnum("status", ["draft", "submitted", "under_review", "documents_required", "approved", "rejected"]).default("submitted").notNull(),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const loans = mysqlTable("loans", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull().unique(),
  userId: int("userId").notNull(),
  loanNumber: varchar("loanNumber", { length: 40 }).notNull().unique(),
  loanType: varchar("loanType", { length: 32 }).notNull(),
  principalAmount: int("principalAmount").notNull(),
  interestRate: int("interestRate").notNull(),
  termMonths: int("termMonths").notNull(),
  repaymentFrequency: varchar("repaymentFrequency", { length: 16 }).notNull(),
  installmentAmount: int("installmentAmount").notNull(),
  outstanding: int("outstanding").notNull(),
  status: mysqlEnum("status", ["approved", "disbursed", "active", "overdue", "completed", "closed"]).default("active").notNull(),
  approvedAt: timestamp("approvedAt"),
  disbursedAt: timestamp("disbursedAt"),
  nextDueDate: timestamp("nextDueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  loanId: int("loanId").notNull(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  method: varchar("method", { length: 24 }).notNull(),
  reference: varchar("reference", { length: 120 }),
  status: mysqlEnum("status", ["paid", "pending", "failed"]).default("paid").notNull(),
  paidAt: timestamp("paidAt").defaultNow().notNull(),
});

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  loanId: int("loanId"),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  documentType: varchar("documentType", { length: 80 }).default("loan document").notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  url: text("url").notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const collaterals = mysqlTable("collaterals", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  userId: int("userId"),
  type: varchar("type", { length: 40 }).notNull(),
  details: text("details"),
  estimatedValue: int("estimatedValue"),
  referenceNumber: varchar("referenceNumber", { length: 120 }),
  status: mysqlEnum("status", ["pending", "verified", "rejected", "released"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Collateral = typeof collaterals.$inferSelect;
