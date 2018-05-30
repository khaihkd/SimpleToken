let dotenv = require('dotenv');
dotenv.load();
module.exports.truffle = {
  host: process.env.EVM_HOST,
  port: process.env.EVM_PORT,
  mnemonic: process.env.MNEMONIC,
  network: process.env.NETWORK,
  network_url: process.env.NETWORK_URL
}
