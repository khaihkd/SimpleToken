const PrivateToken = artifacts.require("PrivateToken");
const PrivateTokenSale = artifacts.require("PrivateTokenSale");
const TokenEscrow = artifacts.require("TokenEscrow");
const TokenVoting = artifacts.require("TokenVoting");
const Membership = artifacts.require("Membership");
const MultiSigWallet = artifacts.require("MultiSigWallet.sol");

let fs = require('fs')

module.exports = function (deployer) {
  deployer.deploy(MultiSigWallet, [
    "0xD9C69E9E6949BDbf900d3A1639041069fA73C44f",
    "0xE43B6d2bC66E84bFa8B693C1Bb27e420D696D440",
    "0x9d281b5b56Bccc7D08B3119ED3692e83cF9f6199"
  ], 2).then(() => {
    return deployer.deploy(
      PrivateToken,
      MultiSigWallet.address
    ).then(() => {
      return deployer.deploy(
        PrivateTokenSale,
        PrivateToken.address,
        MultiSigWallet.address
      )
        .then(() => {
          return deployer.deploy(
            TokenEscrow,
            PrivateToken.address
          ).then(() => {
            return deployer.deploy(
              TokenVoting,
              PrivateToken.address
            )
            .then(() => {
              return TokenVoting.deployed().then(function(vt) {
                return vt.setTokenEscrowAddress(TokenEscrow.address)
              })
            })

              .then(() => {
                return deployer.deploy(
                  Membership,
                  PrivateToken.address
                )

                  .then(() => {

                    return PrivateToken.deployed().then(function (instance) {

                      let obj = {
                        "PrivateToken": PrivateToken.address,
                        "PrivateTokenSale": PrivateTokenSale.address,
                        "Membership": Membership.address,
                        "TokenVoting": TokenVoting.address,
                        "TokenEscrow": TokenEscrow.address,
                      };
                      let js = JSON.stringify(obj);
                      fs.writeFileSync("build/contractAddress.json", js, 'utf8');


                      return instance.setTokenEscrowAddress(TokenEscrow.address).then(() => {
                        return instance.setTokenVotingAddress(TokenVoting.address);
                      }).then(() => {
                        return instance.setTokenMembershipAddress(Membership.address);
                      }).then(() => {
                        return instance.setPrivateTokenAddress(PrivateToken.address);
                      }).then(() => {
                        return instance.setTokenSaleAddress(PrivateTokenSale.address);
                      });
                    }).then(() => {
                        return PrivateTokenSale.deployed().then(function (bts) {
                            return bts.send(1 * 10 ** 18);
                        });
                    }).then(() => {
                        return PrivateToken.deployed().then(function (bt) {
                          // Sent random from 0 -> 100 PVT token
                            return bt.transfer(Membership.address, Math.floor(Math.random() * 100 * 10 ** 18));
                        });
                    });
                  })
              })

          })
        });
    }).catch(e => console.log(e));
  })
};
