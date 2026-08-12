import mongoose, { Schema, model, Model } from "mongoose";

export interface CollateralDoc {
  id: number;
  applicationId: number;
  userId?: number | null;
  type: string;
  details?: string | null;
  estimatedValue?: number | null;
  referenceNumber?: string | null;
  status: "pending" | "verified" | "rejected" | "released";
  createdAt: Date;
}

const collateralSchema = new Schema<CollateralDoc>({
  id: { type: Number, required: true, unique: true, index: true },
  applicationId: { type: Number, required: true, index: true },
  userId: { type: Number, default: null },
  type: { type: String, required: true },
  details: { type: String, default: null },
  estimatedValue: { type: Number, default: null },
  referenceNumber: { type: String, default: null },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected", "released"],
    default: "pending",
    required: true,
  },
  createdAt: { type: Date, default: () => new Date() },
});

export const Collateral = (mongoose.models.User as Model<CollateralDoc>) || model<CollateralDoc>("Collateral", collateralSchema);
