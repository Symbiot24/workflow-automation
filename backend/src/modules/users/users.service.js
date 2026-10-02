import { eq } from "drizzle-orm";
import { users } from "../../db/schema.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";

export async function getCurrentUser(fastify, userId) {
  const user = await fastify.db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
}

export async function updateCurrentUser(
  fastify,
  userId,
  data
) {
  const [user] = await fastify.db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return user;
}

export async function changePassword(
  fastify,
  userId,
  currentPassword,
  newPassword
) {
  const user = await fastify.db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const validPassword = await comparePassword(
    currentPassword,
    user.passwordHash
  );

  if (!validPassword) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  const newPasswordHash = await hashPassword(newPassword);

  await fastify.db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return {
    message: "Password changed successfully",
  };
}