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

let escrow = Escrow.deployed()

module.exports = {
  createOrder: async function (req, res) {
    let amountBuyer = req.param('amountBuyer', 0),
      amountSeller = req.param('amountSeller', 0),
      seller = req.param('seller'),
      buyer = req.param('buyer')

    if (!web3.eth.isAddress(seller) || !web3.eth.isAddress(buyer)) {
      return res.status(400).json({error: true, message: 'Seller or Buyer is not wallet address'})
    }

    if (buyer === seller) {
      return res.status(400).json({error: true, message: 'Cannot buy yourself'})
    }

    if (parseFloat(amountBuyer) === 0.0 || parseFloat(amountSeller) === 0.0) {
      return res.status(400).json({error: true, message: 'Amount must greater than 0'})
    }
    try {
      let r = await escrow.createOrder(buyer, seller, amountBuyer, amountSeller, {from: await web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Create an order successful', orderId: parseInt(r)})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Something is wrong'})
    }
  },

  getOrderState: async function (req, res) {
    let orderId = req.param('orderId', 0)
    if (orderId === 0) {
      return res.status(400).json({error: true, message: 'Missing orderId'})
    }

    try {
      let r = await escrow.getOrderState(orderId, {from: await web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Get Order state successful', state: r})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Something is wrong'})
    }
  },

  cancelOrder: async function (req, res) {
    let orderId = req.param('orderId'),
      fromMember = req.param('fromMember'),
      refundBuyer = req.param('refundBuyer'),
      refundSeller = req.param('refundSeller')

    if (!web3.eth.isAddress(fromMember) ) {
      return res.status(400).json({error: true, message: 'fromMember is not wallet address'})
    }

    try {
      let r = await escrow.cancelOrder(orderId, fromMember, refundBuyer, refundSeller, {from: await  web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Cancel order successful'})
    } catch (e) {
      return res.status(400).json({error: true, message: 'Only buyer or seller can be cancel order'})
    }

  },



};

