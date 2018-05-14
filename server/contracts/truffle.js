var HDWalletProvider = require('truffle-hdwallet-provider');

let host = '172.17.0.1', port = 8545;
let mnemonic = 'act output engage farm obscure name rubber fuel under voice glove mandate'

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

