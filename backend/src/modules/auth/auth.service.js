import { eq } from "drizzle-orm";
import { users, refreshTokens } from "../../db/schema.js";
import {
  hashPassword,
  comparePassword,
} from "../../utils/hash.js";
import { createAccessToken, hashRefreshToken } from "../../utils/tokens.js";

export async function registerUser(
  fastify,
  { email, password, name }
) {
  const existingUser = await fastify.db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await hashPassword(password);

  const [user] = await fastify.db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
    });

  const accessToken = createAccessToken(fastify, user);

  return {
    user,
    accessToken,
  };
}

export async function loginUser(
  fastify,
  { email, password }
) {
  const user = await fastify.db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const validPassword = await comparePassword(
    password,
    user.passwordHash
  );

  if (!validPassword) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const accessToken = createAccessToken(fastify, user);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken,
  };
}

export async function logoutUser(fastify, refreshToken) {
  const tokenHash = hashRefreshToken(refreshToken);

  const [token] = await fastify.db
    .update(refreshTokens)
    .set({
      revokedAt: new Date(),
    })
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .returning({
      id: refreshTokens.id,
    });

  return {
    message: "Logged out successfully",
  };
}