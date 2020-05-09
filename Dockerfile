FROM node:13.2

WORKDIR /app

COPY src src
COPY test test
COPY package.json package.json 
COPY tsconfig.json tsconfig.json

RUN yarn
RUN yarn build