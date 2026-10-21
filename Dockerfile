# Stage 1: Build and asset preparation
FROM node:20-alpine AS builder

WORKDIR /app

# Copy application static assets
COPY index.html style.css index.js ./

# Validate JavaScript syntax for runtime integrity
RUN node --check index.js

# Stage 2: Production web server
FROM nginx:alpine

# Remove default static content
RUN rm -rf /usr/share/nginx/html/*

# Copy verified static assets from builder stage
COPY --from=builder /app/index.html /app/index.js /app/style.css /usr/share/nginx/html/

# Expose HTTP port
EXPOSE 80

# Healthcheck to verify service availability
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null http://localhost/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
