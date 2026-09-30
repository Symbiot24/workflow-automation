const helmet = require("@fastify/helmet");

async function securityPlugin(fastify) {
  await fastify.register(helmet);
}

module.exports = securityPlugin;