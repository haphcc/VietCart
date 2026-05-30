FROM node:22-alpine
WORKDIR /app
COPY user-service/package*.json ./
RUN npm install
RUN ln -s /app/node_modules /node_modules
COPY user-service/ ./
COPY shared /shared
EXPOSE 3006
CMD ["npm", "start"]
