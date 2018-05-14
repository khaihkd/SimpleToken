var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = process.env.MNEMONIC;

let host, port;
if (process.env.NETWORK_HOST){
  host = process.env.NETWORK_HOST
} else {
  host = '127.0.0.1'
}
if (process.env.NETWORK_PORT){
  port = process.env.NETWORK_PORT
} else {
  port = 8545
}
module.exports = {
  networks: {
    development: {
      host: host,
      port: port,
      gas: 4712388,
      gasPrice: 100000000000,
      network_id: "*"
    },
    tomo: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://core.tomocoin.io');
      },
      gas: 2900000,
      gasPrice: 120000000,
      network_id: 40686
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io');
      },
      gas: 2900000,
      gasPrice: 120000000,
      network_id: 4
    }
  }
};

