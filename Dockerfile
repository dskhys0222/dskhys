# 1. Builder stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package.json to get pnpm version
COPY package.json ./

# Install pnpm from packageManager field
RUN corepack enable && corepack install

# Copy workspace configuration and package files
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc .npmrc
COPY packages/server/api/package.json ./packages/server/api/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the application
RUN pnpm --filter @dskhys/api run build


# 2. Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package.json to get pnpm version
COPY package.json ./

# Install pnpm from packageManager field
RUN corepack enable && corepack install

# Copy workspace configuration and package files
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc .npmrc
COPY packages/server/api/package.json ./packages/server/api/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/packages/server/api/dist ./packages/server/api/dist

# Copy healthcheck script
COPY healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "packages/server/api/dist/index.js"]
