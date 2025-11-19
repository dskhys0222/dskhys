# 1. Builder stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files and install all dependencies
COPY package.json package-lock.json ./
COPY .npmrc .npmrc
COPY apps/server/api/package.json ./apps/server/api/
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the application
RUN npm -w @dskhys/api run build


# 2. Production stage
FROM node:22-alpine

WORKDIR /app

# Copy only production package.json
COPY apps/server/api/package.json ./

# Install only production dependencies
RUN npm install --production

# Copy built application from builder stage
COPY --from=builder /app/apps/server/api/dist ./dist

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
CMD ["node", "dist/index.js"]
