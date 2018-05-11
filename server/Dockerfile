FROM node:9.11.1
MAINTAINER Minh Khai Do <khai@tomochain.com>

WORKDIR /build

COPY package.json /build/package.json

#RUN \
#  apt-get update && \
#  apt-get install -y python python-dev python-pip python-virtualenv && \
#  apt-get install -y git nano && \
#  rm -rf /var/lib/apt/lists/*

RUN npm i npm@latest -g
RUN npm install -g truffle sails ganache-cli
RUN npm install

ADD . /build
RUN cd contracts && npm install

RUN cd contracts && truffle compile
RUN cd contracts && truffle migrate --network rinkeby

CMD sails lift