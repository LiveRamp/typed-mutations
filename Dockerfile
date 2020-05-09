FROM node:13.2

WORKDIR /app

COPY src src 

RUN yarn build 