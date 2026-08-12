import mongoose, { Schema, model, Model } from "mongoose";

export interface PaymentDoc {
  id: number;
  loanId: number;
  userId: number;
  amount: number;
  method: string;
  reference?: string | null;
  status: "paid" | "pending" | "failed";
  paidAt: Date;
}

const paymentSchema = new Schema<PaymentDoc>({
  id: { type: Number, required: true, unique: true, index: true },
  loanId: { type: Number, required: true, index: true },
  userId: { type: Number, required: true, index: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  reference: { type: String, default: null },
  status: { type: String, enum: ["paid", "pending", "failed"], default: "paid", required: true },
  paidAt: { type: Date, default: () => new Date() },
});

export const Payment = (mongoose.models.Payment as Model<PaymentDoc>) || model<PaymentDoc>("Payment", paymentSchema);
