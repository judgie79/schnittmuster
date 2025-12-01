FROM node:20-alpine

WORKDIR /app

# Install pnpm version compatible with lockfile v6
RUN npm install -g pnpm@8

# Copy dependency manifests first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies using the lockfile
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the TypeScript project
RUN pnpm run build

# Expose API port
EXPOSE 5000

# Default command
CMD ["pnpm", "start"]
