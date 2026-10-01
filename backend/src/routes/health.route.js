import env from "../config/env.js";
import checkDatabaseConnection from "../db/health.js";
import { db } from "../db/connection.js"; 

export default async function healthRoutes(fastify) {
  fastify.get("/health", async () => {

    const db = await checkDatabaseConnection();
    
    return {
      status: db.connected ? "ok" : "Degraded",
      db,
      uptime: process.uptime(),
    };
  });

  fastify.get("/api/health", async () => {
    return {
      status: "ok",
      uptime: process.uptime(),
      version: env.appVersion
    };
  });

  fastify.post(
    "/api/test-validation",
    {
      schema: {
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              minLength: 2
            }
          }
        }
      }
    },
    async (request) => {
      return {
        message: `Hello ${request.body.name}`
      };
    }
  );
}