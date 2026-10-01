import { sql } from "drizzle-orm";
import { db } from "./connection.js";

export default async function checkDatabaseConnection() {
  try {
    await db.execute(sql`SELECT 1`);

    return {
      connected: true,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
}