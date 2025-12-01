import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toArray = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) {
    return fallback;
  }
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
};

export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    logging: boolean;
  };
  jwt: {
    accessSecret: string;
    accessExpiry: string;
    refreshSecret: string;
    refreshExpiry: string;
  };
  oauth: {
    provider: string;
    googleClientId: string;
    googleClientSecret: string;
    callbackUrl: string;
  };
  storage: {
    type: "local" | "s3" | "database";
    uploadDir: string;
    s3Bucket: string;
    s3Region: string;
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
  security: {
    passwordMinLength: number;
    rateLimitWindow: number;
    rateLimitMaxRequests: number;
  };
  cors: {
    origins: string[];
  };
  logging: {
    level: string;
  };
}

export const environment: EnvironmentConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 5000),
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  database: {
    host: process.env.DB_HOST || "localhost",
    port: toNumber(process.env.DB_PORT, 5432),
    username: process.env.DB_USER || "schnittmuster_user",
    password: process.env.DB_PASSWORD || "change_in_production",
    name: process.env.DB_NAME || "schnittmuster_db",
    logging: (process.env.DB_LOGGING || "false").toLowerCase() === "true",
  },
  jwt: {
    accessSecret: process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production",
    accessExpiry: process.env.JWT_EXPIRY || "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },
  oauth: {
    provider: process.env.OAUTH_PROVIDER || "google",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl: process.env.OAUTH_CALLBACK_URL || "http://localhost:5000/api/v1/auth/google/callback",
  },
  storage: {
    type: (process.env.STORAGE_TYPE as "local" | "s3" | "database") || "local",
    uploadDir: process.env.UPLOAD_DIR || "./uploads",
    s3Bucket: process.env.S3_BUCKET || "",
    s3Region: process.env.S3_REGION || "eu-central-1",
  },
  pagination: {
    defaultPageSize: toNumber(process.env.DEFAULT_PAGE_SIZE, 20),
    maxPageSize: toNumber(process.env.MAX_PAGE_SIZE, 100),
  },
  security: {
    passwordMinLength: toNumber(process.env.PASSWORD_MIN_LENGTH, 8),
    rateLimitWindow: toNumber(process.env.RATE_LIMIT_WINDOW, 900000),
    rateLimitMaxRequests: toNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
  },
  cors: {
    origins: toArray(process.env.CORS_ORIGIN, ["http://localhost:3000"]),
  },
  logging: {
    level: process.env.LOG_LEVEL || "debug",
  },
};

export default environment;
