import { Schema, model, models, Types, type Model } from "mongoose";
import { Event } from "./event.model";

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "invalid email address"],
    },
  },
  { timestamps: true },
);

// Mongoose 9 pre-save hooks take no `next` callback: throwing aborts the save.
BookingSchema.pre("save", async function () {
  // `ref` alone does not verify the target exists — Mongoose never checks it.
  // Only worth a round-trip when the reference actually changed.
  if (!this.isModified("eventId")) return;

  const exists = await Event.exists({ _id: this.eventId });
  if (!exists) throw new Error(`event not found: ${this.eventId.toString()}`);
});

// Reuse the compiled model across Next.js hot reloads instead of recompiling it.
export const Booking =
  (models.Booking as Model<IBooking> | undefined) ?? model<IBooking>("Booking", BookingSchema);
