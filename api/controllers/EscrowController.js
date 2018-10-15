/**
 * EscrowController
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

let contract = require('truffle-contract')
let TokenEscrow = require('../../contracts/build/contracts/TokenEscrow.json')
let Escrow = contract(TokenEscrow)
Escrow.setProvider(web3.currentProvider)


module.exports = {
  createOrder: async function (req, res) {
    let amountBuyer = req.param('amountBuyer', 0),
      amountSeller = req.param('amountSeller', 0),
      seller = req.param('seller'),
      buyer = req.param('buyer')

    if (!web3.utils.isAddress(seller) || !web3.utils.isAddress(buyer)) {
      return res.status(400).json({error: true, message: 'Seller or Buyer is not wallet address'})
    }

    if (buyer === seller) {
      return res.status(400).json({error: true, message: 'Cannot buy yourself'})
    }

    if (parseFloat(amountBuyer) === 0.0 || parseFloat(amountSeller) === 0.0) {
      return res.status(400).json({error: true, message: 'Amount must greater than 0'})
    }
    let escrow = await Escrow.deployed()
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

    let escrow = await Escrow.deployed()
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

    if (!web3.utils.isAddress(fromMember) ) {
      return res.status(400).json({error: true, message: 'fromMember is not wallet address'})
    }

    let escrow = await Escrow.deployed()
    try {
      let r = await escrow.cancelOrder(orderId, fromMember, refundBuyer, refundSeller, {from: await  web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Cancel order successful'})
    } catch (e) {
      return res.status(400).json({error: true, message: 'Only buyer or seller can be cancel order'})
    }

  },

  refundingOrder: async function (req, res) {
    let orderId = req.param('orderId'),
      fromMember = req.param('fromMember'),
      hash = req.param('hash')

    if (!web3.utils.isAddress(fromMember) ) {
      return res.status(400).json({error: true, message: 'fromMember is not wallet address'})
    }

    let escrow = await Escrow.deployed()
    try {
      let r = await escrow.refundingOrder(fromMember, orderId, hash, {from: await  web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Refunding successful'})
    } catch (e) {
      return res.status(400).json({error: true, message: 'Only buyer can be cancel refunding order'})
    }
  },

  refundedOrder: async function (req, res) {
    let orderId = req.param('orderId'),
      fromMember = req.param('fromMember'),
      refundBuyer = req.param('refundBuyer'),
      refundSeller = req.param('refundSeller')

    if (!web3.utils.isAddress(fromMember) ) {
      return res.status(400).json({error: true, message: 'fromMember is not wallet address'})
    }

    let escrow = await Escrow.deployed()
    try {
      let r = await escrow.refundedOrder(fromMember, orderId, refundBuyer, refundSeller, {from: await  web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Refunded order successful'})
    } catch (e) {
      return res.status(400).json({error: true, message: 'Only seller can be confirm refunded success'})
    }

  },

  deliverOrder: async function (req, res) {
    let orderId = req.param('orderId'),
      fromMember = req.param('fromMember'),
      hash = req.param('hash')

    if (!web3.utils.isAddress(fromMember) ) {
      return res.status(400).json({error: true, message: 'fromMember is not wallet address'})
    }

    let escrow = await Escrow.deployed()
    try {
      let r = await escrow.deliverOrder(fromMember, orderId, hash, {from: await  web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Deliver successful'})
    } catch (e) {
      return res.status(400).json({error: true, message: 'Only seller can be confirm delivery order'})
    }
  },

  completedOrder: async function (req, res) {
    let orderId = req.param('orderId'),
      fromMember = req.param('fromMember'),
      hash = req.param('hash')

    if (!web3.utils.isAddress(fromMember) ) {
      return res.status(400).json({error: true, message: 'fromMember is not wallet address'})
    }

    let escrow = await Escrow.deployed()
    try {
      let r = await escrow.completedOrder(fromMember, orderId, hash, {from: await  web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Complete successful'})
    } catch (e) {
      return res.status(400).json({error: true, message: 'Only buyer can be confirm complete order'})
    }
  },

  uploadDocument: async function (req, res) {
    let orderId = req.param('orderId'),
      fromMember = req.param('fromMember'),
      hash = req.param('hash')

    if (!web3.utils.isAddress(fromMember) ) {
      return res.status(400).json({error: true, message: 'fromMember is not wallet address'})
    }

    let escrow = await Escrow.deployed()
    try {
      let r = await escrow.uploadDocument(fromMember, orderId, hash, {from: await  web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Upload document successful'})
    } catch (e) {
      return res.status(400).json({error: true, message: 'Only buyer & seller can be upload document'})
    }
  },

};

