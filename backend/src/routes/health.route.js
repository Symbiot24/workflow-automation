const env = require("../config/env");

async function healthRoutes(fastify) {
  fastify.get("/health", async () => {
    return {
      status: "ok",
      uptime: process.uptime(),
      version: env.appVersion
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

module.exports = healthRoutes;