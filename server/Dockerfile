FROM node:9.11.1
MAINTAINER Minh Khai Do <khai@tomochain.com>

WORKDIR /build

COPY package.json /build/package.json

RUN npm install -g truffle sails
RUN npm install

ADD . /build
RUN cd contracts && npm install

RUN cd contracts && truffle compile
RUN cd contracts && MNEMONIC="act output engage farm obscure name rubber fuel under voice glove mandate" truffle migrate --network tomo

CMD sails lift