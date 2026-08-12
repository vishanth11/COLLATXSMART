import mongoose, { Schema, model, Model } from "mongoose";

export interface LoanDoc {
  id: number;
  applicationId: number;
  userId: number;
  loanNumber: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  repaymentFrequency: string;
  installmentAmount: number;
  outstanding: number;
  status: "approved" | "disbursed" | "active" | "overdue" | "completed" | "closed";
  approvedAt?: Date | null;
  disbursedAt?: Date | null;
  nextDueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<LoanDoc>(
  {
    id: { type: Number, required: true, unique: true, index: true },
    applicationId: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true, index: true },
    loanNumber: { type: String, required: true, unique: true },
    loanType: { type: String, required: true },
    principalAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    termMonths: { type: Number, required: true },
    repaymentFrequency: { type: String, required: true },
    installmentAmount: { type: Number, required: true },
    outstanding: { type: Number, required: true },
    status: {
      type: String,
      enum: ["approved", "disbursed", "active", "overdue", "completed", "closed"],
      default: "active",
      required: true,
    },
    approvedAt: { type: Date, default: null },
    disbursedAt: { type: Date, default: null },
    nextDueDate: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Loan = (mongoose.models.Loan as Model<LoanDoc>) || model<LoanDoc>("Loan", loanSchema);
