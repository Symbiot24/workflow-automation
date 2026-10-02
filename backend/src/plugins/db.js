import fp from "fastify-plugin";
import db from "../db/index.js";

export default fp(async function dbPlugin(fastify) {
  fastify.decorate("db", db);
});