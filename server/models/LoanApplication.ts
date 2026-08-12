import mongoose, { Schema, model, Model } from "mongoose";

export interface LoanApplicationDoc {
  id: number;
  userId?: number | null;
  applicationNumber: string;
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  occupation: string;
  monthlyIncome: number;
  loanType: string;
  requiredAmount: number;
  purpose: string;
  repaymentFrequency: string;
  preferredDuration: number;
  collateralType: string;
  collateralDetails?: string | null;
  estimatedValue?: number | null;
  referenceNumber?: string | null;
  status: "draft" | "submitted" | "under_review" | "documents_required" | "approved" | "rejected";
  adminNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const loanApplicationSchema = new Schema<LoanApplicationDoc>(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, default: null, index: true },
    applicationNumber: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    occupation: { type: String, required: true },
    monthlyIncome: { type: Number, required: true },
    loanType: { type: String, required: true },
    requiredAmount: { type: Number, required: true },
    purpose: { type: String, required: true },
    repaymentFrequency: { type: String, required: true },
    preferredDuration: { type: Number, required: true },
    collateralType: { type: String, required: true },
    collateralDetails: { type: String, default: null },
    estimatedValue: { type: Number, default: null },
    referenceNumber: { type: String, default: null },
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "documents_required", "approved", "rejected"],
      default: "submitted",
      required: true,
    },
    adminNote: { type: String, default: null },
  },
  { timestamps: true },
);

export const LoanApplication =
  (mongoose.models.LoanApplication as Model<LoanApplicationDoc>) || model<LoanApplicationDoc>("LoanApplication", loanApplicationSchema);
