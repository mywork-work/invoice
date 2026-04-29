# Use official Node.js image
FROM node:22

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose your app port
EXPOSE 5010

# Start app
CMD ["node", "index.js"]