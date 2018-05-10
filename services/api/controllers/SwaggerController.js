/**
 * SwaggerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  docs: async function(req, res) {
    let yaml = require('js-yaml');
    let fs = require('fs');
    let config = yaml.safeLoad(fs.readFileSync('./docs/swagger.yml', 'utf8'));
    return res.json(config)
  }

};

