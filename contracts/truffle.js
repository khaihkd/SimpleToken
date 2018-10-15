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
        return new HDWalletProvider(mnemonic, 'https://testnet.tomochain.com');
      },
      network_id: 89
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io');
      },
      network_id: 4
    },

    ropsten: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"),
      network_id: 3
    },

    kovan: {
      provider: new HDWalletProvider(mnemonic, "https://kovan.infura.io/"),
      network_id: "*"
    }
  }
};

