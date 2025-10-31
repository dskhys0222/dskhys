# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY apps/server/api/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built application
COPY apps/server/api/dist ./dist
COPY apps/server/api/package.json ./

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
