FROM --platform=linux/amd64 node:18
WORKDIR /app
COPY package.json .
RUN npm install
EXPOSE 80
COPY . .
RUN npm run build
CMD npm run start:prod