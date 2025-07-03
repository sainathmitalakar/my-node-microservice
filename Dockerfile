FROM node:18

WORKDIR /app

# Copy only package.json and package-lock.json first
COPY package*.json ./

# Install dependencies properly inside the container
RUN npm install

# Then copy the rest of your app
COPY . .

EXPOSE 3000

CMD ["npm", "start"]

