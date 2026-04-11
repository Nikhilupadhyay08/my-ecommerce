import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-unused-vars
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI?.trim();

function isValidMongoUri(u: string | undefined): u is string {
  if (!u) return false;
  return u.startsWith("mongodb://") || u.startsWith("mongodb+srv://");
}

/** Resolves a connected client, or rejects if MONGODB_URI is missing or invalid. */
export default function getMongoClient(): Promise<MongoClient> {
  if (!isValidMongoUri(uri)) {
    return Promise.reject(
      new Error("MONGODB_URI is missing or must start with mongodb:// or mongodb+srv://")
    );
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}
