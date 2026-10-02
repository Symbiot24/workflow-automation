import buildApp from "./app.js";
import env from "./config/env.js";

const app = await buildApp();

async function start() {
  try {
    await app.listen({
      port: env.port,
      host: env.host
    });

    app.log.info(`Server running on http://${env.host}:${env.port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  app.log.info(`${signal} received. Starting graceful shutdown...`);

  try {
    await app.close();

    app.log.info("Server closed successfully.");
    process.exit(0);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();