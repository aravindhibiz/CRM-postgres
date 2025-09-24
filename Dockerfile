# Multi-stage build for SalesFlow Pro
# Stage 1: Build the React application (commented out - using pre-built assets)
# FROM node:18-alpine AS builder

# Set working directory
# WORKDIR /app

# Copy package files
# COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
# RUN npm ci --silent

# Copy source code
# COPY . .

# Build the application
# RUN npm run build

# Stage 2: Production server
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S salesflow -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Copy pre-built application assets
COPY dist ./dist

# Copy server file
COPY server.js ./

# Change ownership to non-root user
RUN chown -R salesflow:nodejs /app
USER salesflow

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 5000, path: '/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["dumb-init", "--", "node", "server.js"]