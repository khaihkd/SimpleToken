/**
 * MembershipController
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

    let membership = await Membership.deployed()
    try {
      let r = await membership.registerMember(email, walletAddress, {from: await web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Register successful', data: r})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Wallet is exist. Cannot use this address to register new membership'})
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

    let membership = await Membership.deployed()
    try {
      let r = await membership.getAmount(walletAddress, {from: await web3.eth.getCoinbase()})
      sails.log(r)
      return res.json({error: false, message: 'Get balance is successful', balance: parseFloat(r[0]) / (10 ** 18), blockActive: r[1], currentBlock: r[2]})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Something is wrong'})
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

    let membership = await Membership.deployed()
    try {
      let r = await membership.isMembership(walletAddress, {from: await web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Check membership is successful', isMember: r[0], currentBlock: r[1], blockActive: r[2]})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Something is wrong'})
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

    let membership = await Membership.deployed()
    try {
      let r = await membership.memberWithdrawal(walletAddress, amount * 10**18, {from: await web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Withdrawal is send success', log: r})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Your balance is not enough'})
    }
  }

};

