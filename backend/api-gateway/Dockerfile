FROM node:22-alpine
WORKDIR /app
COPY api-gateway/package*.json ./
RUN npm install
RUN ln -s /app/node_modules /node_modules
COPY api-gateway/ ./
COPY shared /shared
EXPOSE 3000
CMD ["npm", "start"]
