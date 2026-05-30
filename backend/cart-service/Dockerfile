FROM node:22-alpine
WORKDIR /app
COPY cart-service/package*.json ./
RUN npm install
RUN ln -s /app/node_modules /node_modules
COPY cart-service/ ./
COPY shared /shared
EXPOSE 3002
CMD ["npm", "start"]
