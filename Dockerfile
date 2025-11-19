# Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY apps/server/api/package.json ./

# Install only production dependencies
RUN npm install --production

# Copy built application (built by CI/CD)
COPY apps/server/api/dist ./dist

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
