FROM node:22-alpine
WORKDIR /app
COPY product-service/package*.json ./
RUN npm install
RUN ln -s /app/node_modules /node_modules
COPY product-service/ ./
COPY shared /shared
EXPOSE 3001
CMD ["npm", "start"]
