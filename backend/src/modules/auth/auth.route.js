import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "./auth.schema.js";

import {
  registerUser,
  loginUser,
  logoutUser
} from "./auth.service.js";

export default async function authRoutes(fastify) {
  fastify.post(
    "/register",
    {
      schema: registerSchema,
    },
    async (request, reply) => {
      try {
        const result = await registerUser(
          fastify,
          request.body
        );

        return reply.code(201).send(result);
      } catch (error) {
        if (error.message === "EMAIL_ALREADY_EXISTS") {
          return reply.code(409).send({
            error: "Email already registered",
          });
        }

        throw error;
      }
    }
  );

  fastify.post(
    "/login",
    {
      schema: loginSchema,
    },
    async (request, reply) => {
      try {
        const result = await loginUser(
          fastify,
          request.body
        );

        return reply.send(result);
      } catch (error) {
        if (error.message === "INVALID_CREDENTIALS") {
          return reply.code(401).send({
            error: "Invalid email or password",
          });
        }

        throw error;
      }
    }
  );

  fastify.post(
    "/logout",
    {
      schema: refreshSchema,
    },
    async (request, reply) => {
      const { refreshToken } = request.body;
  
      await logoutUser(fastify, refreshToken);
  
      return reply.send({
        message: "Logged out successfully",
      });
    }
  );
}