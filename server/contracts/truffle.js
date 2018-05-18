var HDWalletProvider = require('truffle-hdwallet-provider');

let host = process.env.EVM_HOST, port = process.env.EVM_PORT,
  mnemonic = process.env.MNEMONIC

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

