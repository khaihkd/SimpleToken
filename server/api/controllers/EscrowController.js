/**
 * EscrowController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')

let host = sails.config.truffle.host, port = sails.config.truffle.port,
  mnemonic = sails.config.truffle.mnemonic

let network = 'http://' + host + ':' + port
let walletProvider = new HDWalletProvider(mnemonic, network)
let web3 = new Web3(walletProvider)

let contract = require('truffle-contract')
let BinkabiEscrow = require('../../contracts/build/contracts/BinkabiEscrow.json')
let Escrow = contract(BinkabiEscrow)
Escrow.setProvider(web3.currentProvider)

module.exports = {
  createOrder: async function (req, res) {
    let orderId = req.param('orderId'),
      amountBuyer = req.param('amountBuyer', 0),
      amountSeller = req.param('amountSeller', 0),
      seller = req.param('seller'),
      buyer = req.param('buyer')

    if (!web3.eth.isAddress(seller) || !web3.eth.isAddress(buyer)) {
      return res.status(400).json({error: true, message: 'Seller or Buyer is not wallet address'})
    }

    if (parseFloat(amountBuyer) === 0.0 || parseFloat(amountSeller) === 0.0) {
      return res.status(400).json({error: true, message: 'Amount must greater than 0'})
    }

  },

  getState: async function (req, res) {
    let orderId = req.param('orderId')

  },

  cancelOrder: async function (req, res) {
    let orderId = req.param('orderId')

  },

  transinfo: async function (req, res) {

  },



};

