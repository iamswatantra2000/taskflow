// lib/db/index.ts
import { config } from "dotenv"
config() // ← loads .env before anything else

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env")
}

console.log("DB connecting to:", connectionString) // temporary — remove after fix

const pool = new Pool({ connectionString })

export const db = drizzle(pool, { schema })
export * from "./schema"