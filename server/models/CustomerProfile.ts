import mongoose, { Schema, model, Model } from "mongoose";

export interface CustomerProfileDoc {
  id: number;
  userId: number;
  phone?: string | null;
  address?: string | null;
  occupation?: string | null;
  monthlyIncome?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const customerProfileSchema = new Schema<CustomerProfileDoc>(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, unique: true, index: true },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    occupation: { type: String, default: null },
    monthlyIncome: { type: Number, default: null },
  },
  { timestamps: true },
);

export const CustomerProfile =
  (mongoose.models.CustomerProfile as Model<CustomerProfileDoc>) || model<CustomerProfileDoc>("CustomerProfile", customerProfileSchema);
