import cors from "@fastify/cors";

export default async function corsPlugin(fastify) {
  await fastify.register(cors, {
    origin: true
  });
}