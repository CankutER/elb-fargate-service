FROM node:16
WORKDIR /app
COPY package.json .
RUN npm install
EXPOSE 3000
COPY . .
RUN npm run build
CMD ["node","dist/main.js"]