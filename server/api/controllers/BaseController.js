/**
 * BaseController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    getAllContract: async function(req, res) {
        let fs = require('fs');
        let config = fs.readFileSync('./contracts/build/contractAddress.json', 'utf8');
        return res.json(JSON.parse(config))
    }

};

