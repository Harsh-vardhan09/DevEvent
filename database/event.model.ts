import { Schema, model, models, type Model } from "mongoose";

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: "online" | "offline" | "hybrid";
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// `trim: true` + `required` rejects whitespace-only values: trim runs on set,
// so "   " becomes "" and then fails the required check.
const requiredString = { type: String, required: true, trim: true } as const;

// Arrays satisfy `required` even when empty, so non-empty is a separate check.
const requiredStringArray = {
  type: [String],
  required: true,
  validate: {
    validator: (value: string[]) => value.length > 0,
    message: "{PATH} must contain at least one entry",
  },
} as const;

const EventSchema = new Schema<IEvent>(
  {
    title: requiredString,
    // `unique: true` is what creates the unique index on slug.
    // Generated in the pre-save hook below, hence not required on input.
    slug: { type: String, unique: true, trim: true, lowercase: true },
    description: requiredString,
    overview: requiredString,
    image: requiredString,
    venue: requiredString,
    location: requiredString,
    date: requiredString,
    time: requiredString,
    mode: { ...requiredString, enum: ["online", "offline", "hybrid"], lowercase: true },
    audience: requiredString,
    agenda: requiredStringArray,
    organizer: requiredString,
    tags: requiredStringArray,
  },
  { timestamps: true },
);

/** "React Conf 2024!" -> "react-conf-2024" */
const slugify = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Mongoose 9 pre-save hooks take no `next` callback: throwing aborts the save.
EventSchema.pre("save", function () {
  // Regenerate only on title change, so an existing slug (and any links to it)
  // stays stable across unrelated edits.
  if (this.isModified("title")) {
    this.slug = slugify(this.title);
    if (!this.slug) throw new Error("title must contain alphanumeric characters");
  }

  if (this.isModified("date")) {
    // Store dates as ISO strings so they sort and compare lexicographically.
    // Re-parsing an already-normalized value is a no-op.
    const parsed = new Date(this.date);
    if (Number.isNaN(parsed.getTime())) throw new Error(`invalid date: ${this.date}`);
    this.date = parsed.toISOString();
  }

  if (this.isModified("time")) {
    // Collapse spacing and normalize the meridiem: "9:00am -  6:00 p.m." ->
    // "9:00 AM - 6:00 PM". Anchored to a preceding digit so free-form values
    // ("48 Hours") and words containing "am"/"pm" are left alone. Idempotent.
    this.time = this.time
      .replace(/\s+/g, " ")
      .replace(/(\d)\s*([ap])\.?\s*m\.?/gi, (_, digit: string, meridiem: string) =>
        `${digit} ${meridiem.toUpperCase()}M`,
      )
      .trim();
  }
});

// Reuse the compiled model across Next.js hot reloads instead of recompiling it.
export const Event = (models.Event as Model<IEvent> | undefined) ?? model<IEvent>("Event", EventSchema);
