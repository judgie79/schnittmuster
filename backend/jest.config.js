const tsJestTransform = require.resolve("ts-jest");

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  passWithNoTests: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/server.ts",
    "!src/migrations/**",
  ],
  transform: {
    "^.+\\.ts$": [tsJestTransform, { tsconfig: "tsconfig.test.json" }],
  },
  moduleNameMapper: {
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@features/(.*)$": "<rootDir>/src/features/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@middleware/(.*)$": "<rootDir>/src/middleware/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
  },
};
