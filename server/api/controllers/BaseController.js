/**
 * BaseController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')

let host, port;
if (process.env.NETWORK_HOST){
    host = process.env.NETWORK_HOST
} else {
    host = '127.0.0.1'
}
if (process.env.NETWORK_PORT){
    port = process.env.NETWORK_PORT
} else {
    port = 8545
}
let mnemonic = process.env.MNEMONIC

let network = 'http://' + host + ':' + port
let walletProvider = new HDWalletProvider(mnemonic, network)
let web3 = new Web3(walletProvider)

module.exports = {
    getAllContract: async function(req, res) {
        let fs = require('fs');
        let config = fs.readFileSync('./contracts/build/contractAddress.json', 'utf8');
        return res.json(JSON.parse(config))
    },

    getEther: async function(req, res) {
        let walletAddress = req.param('walletAddress', '')
        if (!web3.utils.isAddress(walletAddress)){
            return res.status(400).json({error: true, message: 'Wallet address is incorrect address'})
        }

        let currentWallet = await web3.eth.getCoinbase()

        web3.eth.sendTransaction({to:walletAddress, from:currentWallet, value:web3.toWei("1", "ether")})
    }

};

