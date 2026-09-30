async function loggerPlugin(fastify) {
  fastify.log.info("Logger plugin registered");
}

module.exports = loggerPlugin;