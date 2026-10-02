import crypto from "node:crypto";

export function createAccessToken(fastify, user) {
  return fastify.jwt.sign({
    sub: user.id,
    email: user.email,
  });
}

export function createRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

export function hashRefreshToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}