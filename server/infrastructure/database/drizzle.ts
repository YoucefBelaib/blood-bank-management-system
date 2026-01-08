import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

let _pool: ReturnType<typeof neon> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function initDbIfNeeded() {
  if (_db) return _db;
  if (!process.env.DATABASE_URL) return null;
  _pool = neon(process.env.DATABASE_URL);
  _db = drizzle(_pool as any);
  return _db;
}

export function getDb() {
  const db = initDbIfNeeded();
  if (!db) {
    throw new Error(
      "Database not configured. Please set DATABASE_URL environment variable."
    );
  }
  return db;
}

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}
