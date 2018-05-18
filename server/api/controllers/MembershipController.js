/**
 * MembershipController
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
let BinkabiMembership = require('../../contracts/build/contracts/BinkabiMembership.json')
let Membership = contract(BinkabiMembership)
Membership.setProvider(web3.currentProvider)

module.exports = {
  register: async function (req, res) {
    let email = req.param('email', ''),
      walletAddress = req.param('walletAddress', '')

    if (email === '' || walletAddress === '') {
      return res.status(400).json({error: true, message: 'Missing email or wallet address'})
    }

    if (!web3.utils.isAddress(walletAddress)){
      return res.status(400).json({error: true, message: 'Wallet address is incorrect address'})
    }

    let _contract = await Membership.deployed()
    try {
      let r = await _contract.registerMember(email, walletAddress, {from: await web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Register successful', data: r})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Email or wallet address exist. Please check again'})
    }

  },

  getBalance: async function(req, res) {
    let walletAddress = req.param('walletAddress', '')

    if (walletAddress === '') {
      return res.json({error: true, message: 'Missing wallet address'})
    }
    if (!web3.utils.isAddress(walletAddress)){
      return res.status(400).json({error: true, message: 'Wallet address is incorrect address'})
    }

    let _contract = await Membership.deployed()

    try {
      let r = await _contract.getAmount(walletAddress, {from: await web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Get balance is successful', balance: parseFloat(r)})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Your wallet address is incorrect!'})
    }
  },

  checkMember: async function(req, res) {
    let walletAddress = req.param('walletAddress', '')

    if (walletAddress === '') {
      return res.json({error: true, message: 'Missing wallet address'})
    }

    if (!web3.utils.isAddress(walletAddress)){
      return res.status(400).json({error: true, message: 'Wallet address is incorrect address'})
    }

    let _contract = await Membership.deployed()

    try {
      let r = await _contract.isMembership(walletAddress, {from: await web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Check membership is successful', isMember: r})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Your wallet address is incorrect!'})
    }
  },

  withdrawal: async function(req, res) {
    let walletAddress = req.param('walletAddress', ''),
      amount = req.param('amount', 0)

    if (walletAddress === '') {
      return res.status(400).json({error: true, message: 'Missing wallet address'})
    }

    if (!web3.utils.isAddress(walletAddress)){
      return res.status(400).json({error: true, message: 'Wallet address is incorrect address'})
    }

    if (parseFloat(amount) <= 0){
      return res.status(400).json({error: true, message: 'Amount is too low'})
    }

    let _contract = await Membership.deployed()

    try {
      let r = await _contract.memberWithdrawal(walletAddress, amount, {from: await web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Withdrawal is send success', log: r})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Wallet address is not membership, or amount is not enough!'})
    }
  }

};

