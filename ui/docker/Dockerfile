FROM node:20-alpine

WORKDIR /app

# Ensure reproducible installs
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build the production bundle (keeps parity with backend image builds)
RUN npm run build

# Expose the Vite dev server port
EXPOSE 5173

# Default to running the Vite dev server; override in compose for preview/prod
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
