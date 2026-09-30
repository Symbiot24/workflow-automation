async function errorHandlerPlugin(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    const statusCode = error.statusCode || 500;

    reply.status(statusCode).send({
      error: error.name || "InternalServerError",
      message: error.message || "Something went wrong",
      statusCode
    });
  });
}

module.exports = errorHandlerPlugin;