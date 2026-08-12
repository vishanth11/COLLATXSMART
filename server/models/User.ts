import mongoose, { Schema, model, Model } from "mongoose";

export interface UserDoc {
  id: number;
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    id: { type: Number, required: true, unique: true, index: true },
    openId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: null },
    email: { type: String, default: null },
    loginMethod: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user", required: true },
    lastSignedIn: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

export const User = (mongoose.models.User as Model<UserDoc>) || model<UserDoc>("User", userSchema);
