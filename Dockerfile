FROM node:13.2

WORKDIR /app

COPY . . 

RUN yarn build 