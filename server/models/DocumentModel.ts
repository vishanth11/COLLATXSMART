import mongoose, { Schema, model, Model } from "mongoose";

export interface DocumentDoc {
  id: number;
  userId: number;
  loanId?: number | null;
  fileName: string;
  documentType: string;
  mimeType: string;
  fileKey: string;
  url: string;
  verificationStatus: "pending" | "verified" | "rejected";
  createdAt: Date;
}

const documentSchema = new Schema<DocumentDoc>({
  id: { type: Number, required: true, unique: true, index: true },
  userId: { type: Number, required: true, index: true },
  loanId: { type: Number, default: null },
  fileName: { type: String, required: true },
  documentType: { type: String, default: "loan document", required: true },
  mimeType: { type: String, required: true },
  fileKey: { type: String, required: true },
  url: { type: String, required: true },
  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
    required: true,
  },
  createdAt: { type: Date, default: () => new Date() },
});

// Named DocumentModel to avoid clashing with the DOM `Document` type.
export const DocumentModel = (mongoose.models.Document as Model<DocumentDoc>) || model<DocumentDoc>("Document", documentSchema);
