import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import env from "../config/env.js";

export default fp(async function jwtPlugin(fastify) {
  await fastify.register(fastifyJwt, {
    secret: env.jwtAccessSecret,
    sign: {
      expiresIn: "15m",
    },
  });
});