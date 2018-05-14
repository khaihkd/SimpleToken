FROM node:9.11.1
MAINTAINER Minh Khai Do <khai@tomochain.com>

WORKDIR /build

COPY package.json /build/package.json

RUN apt-get update && apt-get install -y npm  wget git

RUN npm install -g npm@latest truffle sails

RUN npm install

ADD . /build
RUN cd contracts && npm install

RUN cd contracts && truffle compile

RUN cd contracts && MNEMONIC="act output engage farm obscure name rubber fuel under voice glove mandate" truffle migrate


CMD sails lift