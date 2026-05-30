FROM node:22-alpine
WORKDIR /app
COPY notification-service/package*.json ./
RUN npm install
RUN ln -s /app/node_modules /node_modules
COPY notification-service/ ./
COPY shared /shared
EXPOSE 3005
CMD ["npm", "start"]
