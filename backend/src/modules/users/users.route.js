import { authenticate } from "../auth/auth.middleware.js";
import { getCurrentUser, updateCurrentUser, changePassword } from "./users.service.js";
import { updateProfileSchema, changePasswordSchema } from "./users.schema.js";

export default async function usersRoutes(fastify) {
  fastify.get(
    "/me",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const user = await getCurrentUser(
        fastify,
        request.user.sub
      );

      return reply.send({
        user,
      });
    }
  );

  fastify.patch(
    "/me",
    {
      preHandler: authenticate,
      schema: updateProfileSchema,
    },
    async (request, reply) => {
      const user = await updateCurrentUser(
        fastify,
        request.user.sub,
        request.body
      );
  
      return reply.send({
        user,
      });
    }
  );

  fastify.patch(
    "/me/password",
    {
      preHandler: authenticate,
      schema: changePasswordSchema,
    },
    async (request, reply) => {
      const result = await changePassword(
        fastify,
        request.user.sub,
        request.body.currentPassword,
        request.body.newPassword
      );
  
      return reply.send(result);
    }
  );
}