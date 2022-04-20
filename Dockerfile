FROM node:16.14.0-alpine

WORKDIR /usr/src

COPY package.json ./

COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 4003

CMD ["yarn","start"]