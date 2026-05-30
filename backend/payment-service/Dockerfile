FROM node:22-alpine
WORKDIR /app
COPY payment-service/package*.json ./
RUN npm install
RUN ln -s /app/node_modules /node_modules
COPY payment-service/ ./
COPY shared /shared
EXPOSE 3004
CMD ["npm", "start"]
