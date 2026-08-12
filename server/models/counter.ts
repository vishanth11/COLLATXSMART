import mongoose, { Schema, model, Model } from "mongoose";

/**
 * The rest of the codebase (routers, zod schemas, the React admin UI) expects
 * plain numeric ids like the old MySQL auto-increment columns did. Rather than
 * rewrite every `z.number()` / comparison across the app to use Mongo's
 * ObjectId strings, we keep numeric ids and hand them out from this counters
 * collection — one running sequence per model name.
 */
const counterSchema = new Schema({
  _id: { type: String, required: true }, // model/collection name
  seq: { type: Number, default: 0 },
});

interface CounterDoc {
  _id: string;
  seq: number;
}

const Counter = (mongoose.models.Counter as Model<CounterDoc>) || model<CounterDoc>("Counter", counterSchema);
export async function nextSequence(name: string): Promise<number> {
  const result = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return result.seq;
}

export default Counter;
