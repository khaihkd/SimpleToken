var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = process.env.MNEMONIC;
module.exports = {
  networks: {
    development: {
      host: process.env.NETWORK_HOST ? process.env.NETWORK_HOST : '127.0.0.1',
      port: process.env.NETWORK_PORT ? process.env.NETWORK_PORT: 8545,
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

