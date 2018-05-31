const BinkabiToken = artifacts.require("BinkabiToken");
const BinkabiTokenSale = artifacts.require("BinkabiTokenSale");
const BinkabiEscrow = artifacts.require("BinkabiEscrow");
const BinkabiVoting = artifacts.require("BinkabiVoting");
const BinkabiMembership = artifacts.require("BinkabiMembership");
const MultiSigWallet = artifacts.require("MultiSigWallet.sol");

let fs = require('fs')

module.exports = function (deployer) {
  deployer.deploy(MultiSigWallet, [
    "0xD9C69E9E6949BDbf900d3A1639041069fA73C44f",
    "0xE43B6d2bC66E84bFa8B693C1Bb27e420D696D440",
    "0x9d281b5b56Bccc7D08B3119ED3692e83cF9f6199"
  ], 2).then(() => {
    return deployer.deploy(
      BinkabiToken,
      MultiSigWallet.address
    ).then(() => {
      return deployer.deploy(
        BinkabiTokenSale,
        BinkabiToken.address,
        MultiSigWallet.address
      )
        .then(() => {
          return deployer.deploy(
            BinkabiEscrow,
            BinkabiToken.address
          ).then(() => {
            return deployer.deploy(
              BinkabiVoting,
              BinkabiToken.address
            )
            .then(() => {
              return BinkabiVoting.deployed().then(function(vt) {
                return vt.setTokenEscrowAddress(BinkabiEscrow.address)
              })
            })

              .then(() => {
                return deployer.deploy(
                  BinkabiMembership,
                  BinkabiToken.address
                )

                  .then(() => {

                    return BinkabiToken.deployed().then(function (instance) {

                      let obj = {
                        "BinkabiToken": BinkabiToken.address,
                        "BinkabiTokenSale": BinkabiTokenSale.address,
                        "BinkabiMembership": BinkabiMembership.address,
                        "BinkabiVoting": BinkabiVoting.address,
                        "BinkabiEscrow": BinkabiEscrow.address,
                      };
                      let js = JSON.stringify(obj);
                      fs.writeFileSync("build/contractAddress.json", js, 'utf8');


                      return instance.setTokenEscrowAddress(BinkabiEscrow.address).then(() => {
                        return instance.setTokenVotingAddress(BinkabiVoting.address);
                      }).then(() => {
                        return instance.setTokenMembershipAddress(BinkabiMembership.address);
                      }).then(() => {
                        return instance.setBinkabiAddress(BinkabiToken.address);
                      }).then(() => {
                        return instance.setTokenSaleAddress(BinkabiTokenSale.address);
                      });
                    }).then(() => {
                        return BinkabiTokenSale.deployed().then(function (bts) {
                            return bts.send(1 * 10 ** 18);
                        });
                    }).then(() => {
                        return BinkabiToken.deployed().then(function (bt) {
                            return bt.transfer(BinkabiMembership.address, 1 * 10 ** 18);
                        });
                    });
                  })
              })

          })
        });
    }).catch(e => console.log(e));
  })
};
