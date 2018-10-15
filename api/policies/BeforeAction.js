module.exports = async function (req, res, proceed) {

  let params = req.allParams()
  sails.log('params: ', params)

  let data = {};
  Object.keys(params).sort().forEach(function (key) {
    data[key] = params[key];
  });

  let string_encrypt = Object.values(data).join('')
  let authorization = req.headers.authorization;
  if (authorization === undefined) {
    return res.status(401).json({error: true, message: 'Missing header authorization.'});
  }
  sails.log('authorization: ', authorization)



  let crypto = require('crypto');
  let encrypt = function (message, method, secret) {
    //let iv = crypto.randomBytes(16).toString('hex').substr(0,16);    //use this in production
    let iv = secret.substr(0,16);    //using this for testing purposes (to have the same encryption IV in PHP and Node encryptors)
    let encryptor = crypto.createCipheriv(method, secret, iv);
    let encrypted_result = new Buffer.from(iv).toString('base64') + encryptor.update(message, 'utf8', 'base64') + encryptor.final('base64');
    return encrypted_result;
  };

  let decrypt = function (encrypted, method, secret) {
    let iv = new Buffer.from(encrypted.substr(0, 24), 'base64').toString();
    let decryptor = crypto.createDecipheriv(method, secret, iv);
    return decryptor.update(encrypted.substr(24), 'base64', 'utf8') + decryptor.final('utf8');
  };

  let method = 'AES-256-CBC';
  let secret = sails.config.truffle.aes256secret; //must be 32 char length

  let encrypted = encrypt(string_encrypt, method, secret)
  let decrypted = decrypt(authorization, method, secret); //60*60m*12=12h

  sails.log('string encrypt: ', string_encrypt)
  sails.log('string decrypt: ', decrypted)

  if (decrypted === string_encrypt){
    sails.log('pass process');
    return proceed();
  }

  return res.status(401).json({error: true, message: 'Header authorization is incorrect.', authorization: encrypted});

};
