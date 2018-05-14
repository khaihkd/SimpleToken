FROM node:9.11.1
MAINTAINER Minh Khai Do <khai@tomochain.com>

WORKDIR /build

COPY package.json /build/package.json

RUN npm install -g truffle sails ganache-cli
RUN npm install

ADD . /build
RUN cd contracts && npm install

RUN cd contracts && truffle compile

RUN apt-get update && apt-get install -y systemd systemd-sysv
ADD ./ganache.service /etc/systemd/system/ganache.service
RUN systemctl daemon-reload && systemctl enable ganache && systemctl start ganache

RUN cd contracts && MNEMONIC="act output engage farm obscure name rubber fuel under voice glove mandate" truffle migrate


CMD sails lift