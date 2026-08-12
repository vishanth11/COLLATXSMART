import mongoose from "mongoose";
import { ENV } from "./_core/env";

let connected = false;
let connecting: Promise<typeof mongoose> | null = null;

/**
 * Lazily connects to MongoDB using MONGODB_URI (see server/_core/env.ts).
 * Safe to call many times — reuses the existing connection/in-flight promise.
 */
export async function connectMongo() {
  if (connected) return mongoose;
  if (!ENV.mongodbUri) {
    console.warn("[MongoDB] MONGODB_URI is not set — database calls will be skipped.");
    return null;
  }
  if (!connecting) {
    connecting = mongoose
      .connect(ENV.mongodbUri, {
        dbName: ENV.mongodbDbName || undefined,
      })
      .then((m) => {
        connected = true;
        console.log("[MongoDB] Connected");
        return m;
      })
      .catch((error) => {
        connecting = null;
        console.warn("[MongoDB] Failed to connect:", error?.message || error);
        throw error;
      });
  }
  try {
    return await connecting;
  } catch {
    return null;
  }
}

export { mongoose };
