FROM node:22-alpine
WORKDIR /app
COPY order-service/package*.json ./
RUN npm install
RUN ln -s /app/node_modules /node_modules
COPY order-service/ ./
COPY shared /shared
EXPOSE 3003
CMD ["npm", "start"]
