FROM node:9.11.1
MAINTAINER Minh Khai Do <khai@tomochain.com>

WORKDIR /build

COPY package.json /build/package.json

RUN npm install -g npm@latest
RUN npm install -g truffle sails

RUN npm install

COPY .env /build/
ADD . /build
CMD sails lift
