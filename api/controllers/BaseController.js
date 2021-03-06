/**
 * BaseController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')

let mnemonic = sails.config.truffle.mnemonic,
  network = sails.config.truffle.network,
  network_url = sails.config.truffle.network_url

if (network === 'development') {
  network_url = 'http://' + sails.config.truffle.host + ':' + sails.config.truffle.port
}
let walletProvider = new HDWalletProvider(mnemonic, network_url)
let web3 = new Web3(walletProvider)

module.exports = {
  getAllContract: async function (req, res) {
    let fs = require('fs');
    let config = fs.readFileSync('./contracts/build/contractAddress.json', 'utf8');
    return res.json(JSON.parse(config))
  },

  getEther: async function (req, res) {
    let walletAddress = req.param('walletAddress', '')
    if (!web3.utils.isAddress(walletAddress)) {
      return res.status(400).json({error: true, message: 'Wallet address is incorrect address'})
    }

    let currentWallet = await web3.eth.getCoinbase()

    web3.eth.sendTransaction({to: walletAddress, from: currentWallet, value: web3.toWei("1", "ether")})
  },

  testSecure: async function(req, res) {
    return res.json({error: false, message: 'Congratulation! Authorization is correct'})
  }

};

