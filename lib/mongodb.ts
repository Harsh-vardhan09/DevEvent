import mongoose, { type Mongoose } from "mongoose";

// `?? ""` keeps the type as string (the narrowing from the guard below would
// not survive into the closure). Fails at import time, not on the first query.
const MONGODB_URI = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from .env");
}

type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

// Next.js hot-reloads modules in dev, which resets module-level variables on
// every save. Stashing the cache on globalThis survives reloads, so we don't
// open a fresh connection each time a file changes.
const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cached: MongooseCache = (globalWithMongoose.mongooseCache ??= {
  conn: null,
  promise: null,
});

/** Returns the shared mongoose connection, opening it on first use. */
export async function connectDB(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  // Cache the promise, not just the result: requests that arrive while the
  // first connection is still opening await that same in-flight promise
  // instead of each starting their own.
  cached.promise ??= mongoose.connect(MONGODB_URI, { bufferCommands: false });

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // clear it so the next call retries
    throw err;
  }

  return cached.conn;
}
