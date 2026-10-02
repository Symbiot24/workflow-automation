import Fastify from "fastify";
import loggerPlugin from "./plugins/logger.js";
import corsPlugin from "./plugins/cors.js";
import securityPlugin from "./plugins/security.js";
import errorHandlerPlugin from "./plugins/error-handler.js";
import dbPlugin from "./plugins/db.js";
import authRoutes from "./modules/auth/auth.route.js";
import healthRoutes from "./routes/health.route.js";
import usersRoutes from "./modules/users/users.route.js";
import jwtPlugin from "./plugins/jwt.js";


export default async function buildApp() {
  const fastify = Fastify({
    logger: true
  });

  fastify.register(loggerPlugin);
  fastify.register(corsPlugin);
  fastify.register(securityPlugin);
  fastify.register(errorHandlerPlugin);
  fastify.register(dbPlugin);
  fastify.register(jwtPlugin);
  fastify.register(healthRoutes);
  
  await fastify.register(usersRoutes, {
    prefix: "/api/users",
  });

  await fastify.register(authRoutes, {
    prefix: "/api/auth",
  })

  return fastify;
}