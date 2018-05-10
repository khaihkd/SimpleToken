FROM node:9.11.1
MAINTAINER Minh Khai Do <khai@tomochain.com>

WORKDIR /build

COPY package.json /build/package.json

RUN \
  apt-get update && \
  apt-get install -y python python-dev python-pip python-virtualenv && \
  apt-get install -y git nano && \
  rm -rf /var/lib/apt/lists/*

RUN npm i npm@latest -g
RUN npm install -g truffle sails ganache-cli
RUN npm install
RUN cd contracts && npm install

ADD . /build

RUN ganache-cli -m "act output engage farm obscure name rubber fuel under voice glove mandate" -e 99999999 > /dev/null &
RUN cd contracts && truffle compile && truffle migrate

CMD sails lift