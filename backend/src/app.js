import Fastify from "fastify";
import loggerPlugin from "./plugins/logger.js";
import corsPlugin from "./plugins/cors.js";
import securityPlugin from "./plugins/security.js";
import errorHandlerPlugin from "./plugins/error-handler.js";

import healthRoutes from "./routes/health.route.js";

export default function buildApp() {
  const fastify = Fastify({
    logger: true
  });

  fastify.register(loggerPlugin);
  fastify.register(corsPlugin);
  fastify.register(securityPlugin);
  fastify.register(errorHandlerPlugin);

  fastify.register(healthRoutes);

  return fastify;
}