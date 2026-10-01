import "dotenv/config";

function getEnv(name, defaultValue) {
  const value = process.env[name];

  if (value !== undefined && value !== "") {
    return value;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

const env = {
  port: Number(getEnv("PORT", "3000")),
  host: getEnv("HOST", "0.0.0.0"),
  nodeEnv: getEnv("NODE_ENV", "development"),
  appVersion: getEnv("APP_VERSION", "1.0.0")
};

if (Number.isNaN(env.port)) {
  throw new Error("PORT must be a valid number");
}

export default env;