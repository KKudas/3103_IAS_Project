# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire project
COPY . .

# Expose port 3000 and run the app
EXPOSE 3000
CMD ["node", "index.js"]