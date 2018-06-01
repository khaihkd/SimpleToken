/**
 * VotingController
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
let BinkabiVoting = require('../../contracts/build/contracts/BinkabiVoting.json')
let Voting = contract(BinkabiVoting)
Voting.setProvider(web3.currentProvider)

module.exports = {
  voting: async function (req, res) {
    let fromMember = req.param('fromMember', ''),
      toMember = req.param('toMember', ''),
      orderId = req.param('orderId', 0),
      score = parseInt(req.param('score', 0)),
      comment = req.param('comment', '')

    if (!web3.utils.isAddress(fromMember) || !web3.utils.isAddress(toMember)){
      return res.status(400).json({error: true, message: 'Wallet address is incorrect address'})
    }
    if (fromMember === toMember) {
      return res.status(400).json({error: true, message: 'Member cannot rating for himself'})
    }
    if (score > 5 || score < 0){
      return res.status(400).json({error: true, message: 'Score is between 0 and 5'})
    }

    let voting = await Voting.deployed()
    try {
      let r = await voting.registerMember(fromMember, toMember, orderId, score, comment, {from: await web3.eth.getCoinbase()})
      if (r === false){
        return res.status(400).json({error: true, message: 'A member cannot voting other member 2 times in a order'})
      }
      return res.json({error: false, message: 'Voting successful'})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Only buyer & seller can be rating together'})
    }

  },

  getScore: async function (req, res) {
    let member = req.param('member')
    if (!web3.utils.isAddress(member)){
      return res.status(400).json({error: true, message: 'Member is incorrect address'})
    }

    let voting = await Voting.deployed()
    try {
      let r = await voting.getRating(member, {from: await web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Get voting successful', totalVote: r[0], totalScore: r[1], scoreAvg: r[2]})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Something is error'})
    }
  },

  getComment: async function (req, res) {
    let member = req.param('member'),
      indexComment = req.param('indexComment')

    let voting = await Voting.deployed()
    try {
      let r = await voting.getRating(member, indexComment, {from: await web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Get voting successful', comment: r})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Something is error'})
    }
  },

  checkIsVoted: async function (req, res) {
    let member = req.param('member'),
      orderId = req.param('orderId')

    let voting = await Voting.deployed()
    try {
      let r = await voting.isVoted(member, orderId, {from: await web3.eth.getCoinbase()})
      return res.json({error: false, message: 'Check voting successful', isVoted: r})
    }
    catch (e) {
      sails.log(e)
      return res.status(400).json({error: true, message: 'Something is error'})
    }

  }


};

