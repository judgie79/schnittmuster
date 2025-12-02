FROM node:20-alpine

WORKDIR /app

# Install pnpm version compatible with lockfile v6
RUN npm install -g pnpm@8

# --- Shared DTO package ---
COPY shared-dtos/package.json shared-dtos/pnpm-lock.yaml ./shared-dtos/
WORKDIR /app/shared-dtos
RUN pnpm install --frozen-lockfile
COPY shared-dtos/ ./
RUN pnpm run build

# --- Backend application ---
WORKDIR /app/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY backend/ ./

# Build the TypeScript project
RUN pnpm run build

# Expose API port
EXPOSE 5000

# Default command
CMD ["pnpm", "start"]
