FROM node:20

RUN apt-get update && apt-get install -y stockfish

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]
