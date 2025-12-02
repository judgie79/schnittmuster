const path = require("path");
const fs = require("fs");
const dotenvPath = process.env.DOTENV_CONFIG_PATH || path.resolve(__dirname, "../.env");

if (fs.existsSync(dotenvPath)) {
  require("dotenv").config({ path: dotenvPath });
}

const toInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
};

const baseConfig = {
  username: process.env.DB_USER || "schnittmuster_user",
  password: process.env.DB_PASSWORD || "change_me_in_production",
  database: process.env.DB_NAME || "schnittmuster_db",
  host: process.env.DB_HOST || "localhost",
  port: toInt(process.env.DB_PORT, 5432),
  dialect: "postgres",
  logging: toBool(process.env.DB_LOGGING, false) ? console.log : false,
  pool: {
    min: toInt(process.env.DB_POOL_MIN, 0),
    max: toInt(process.env.DB_POOL_MAX, 5),
    acquire: toInt(process.env.DB_POOL_ACQUIRE, 30000),
    idle: toInt(process.env.DB_POOL_IDLE, 10000),
  },
};

const sslEnabled = toBool(process.env.DB_SSL, false);

const withOptionalSsl = (config) => {
  if (!sslEnabled) {
    return config;
  }
  return {
    ...config,
    dialectOptions: {
      ...(config.dialectOptions || {}),
      ssl: {
        require: true,
        rejectUnauthorized: toBool(process.env.DB_SSL_REJECT_UNAUTHORIZED, false),
      },
    },
  };
};

module.exports = {
  development: withOptionalSsl(baseConfig),
  test: withOptionalSsl({
    ...baseConfig,
    database: process.env.DB_NAME_TEST || `${baseConfig.database}_test`,
  }),
  production: withOptionalSsl({
    ...baseConfig,
    logging: toBool(process.env.DB_LOGGING, false) ? console.log : false,
  }),
};
