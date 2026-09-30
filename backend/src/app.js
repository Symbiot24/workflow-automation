const Fastify = require("fastify");

const loggerPlugin = require("./plugins/logger");
const corsPlugin = require("./plugins/cors");
const securityPlugin = require("./plugins/security");
const errorHandlerPlugin = require("./plugins/error-handler");

const healthRoutes = require("./routes/health.route");

function buildApp() {
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

module.exports = buildApp;