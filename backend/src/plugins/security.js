import helmet from "@fastify/helmet";

export default async function securityPlugin(fastify) {
  await fastify.register(helmet);
}