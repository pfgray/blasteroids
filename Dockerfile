FROM node:7

ADD ./ /app
WORKDIR /app
RUN npm install