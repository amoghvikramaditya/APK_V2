FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Install build dependencies for SQLite
RUN apk add --no-cache python3 make g++ 

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
