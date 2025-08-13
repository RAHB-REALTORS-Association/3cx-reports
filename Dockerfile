# Multi-stage build for 3CX Reports Dashboard
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package.json package-lock.json ./

# Install dependencies using npm ci for faster, reliable builds
RUN npm ci --only=production

# Copy all application files
COPY . .

# Build the React application for production
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy the built React app from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
