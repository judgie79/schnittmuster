import dotenv from "dotenv";

dotenv.config();

export const environment = {
  // Server
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  apiPrefix: process.env.API_PREFIX || "/api/v1",

  // Database
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "schnittmuster_user",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "schnittmuster_db",
    poolMin: parseInt(process.env.DB_POOL_MIN || "2", 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || "10", 10),
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiry: process.env.JWT_EXPIRY || "24h",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },

  // File Upload
  upload: {
    dir: process.env.UPLOAD_DIR || "./uploads",
    maxSize: parseInt(process.env.MAX_FILE_SIZE || "52428800", 10), // 50MB default
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || "pdf,jpg,jpeg,png").split(","),
  },

  // CORS
  cors: {
    origin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
  },

  // Logging
  log: {
    level: process.env.LOG_LEVEL || "debug",
  },
};

export default environment;
