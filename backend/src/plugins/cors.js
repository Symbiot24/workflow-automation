const cors = require("@fastify/cors");

async function corsPlugin(fastify) {
  await fastify.register(cors, {
    origin: true
  });
}

module.exports = corsPlugin;