const BinbabiTokenCreate = artifacts.require("BinkabiTokenCreate");
const BinkabiTokenSale = artifacts.require("BinkabiTokenSale");
const BinkabiEscrow = artifacts.require("BinkabiEscrow");
const BinkabiVoting = artifacts.require("BinkabiVoting");
const BinkabiMembership = artifacts.require("BinkabiMembership");
const MultiSigWallet = artifacts.require("MultiSigWallet.sol");

module.exports = function (deployer) {
  deployer.deploy(MultiSigWallet, [
    "0xD9C69E9E6949BDbf900d3A1639041069fA73C44f",
    "0xE43B6d2bC66E84bFa8B693C1Bb27e420D696D440",
    "0x9d281b5b56Bccc7D08B3119ED3692e83cF9f6199"
  ], 2).then(() => {
    return deployer.deploy(
      BinbabiTokenCreate,
      MultiSigWallet.address
    ).then(() => {
      return deployer.deploy(
        BinkabiTokenSale,
        BinbabiTokenCreate.address,
        MultiSigWallet.address
      )
      // .then(() => {
      //   return deployer.deploy(
      //     BinkabiEscrow,
      //     BinbabiTokenCreate.address
      //   ).then(() => {
      //     return deployer.deploy(
      //       BinkabiVoting,
      //       BinbabiTokenCreate.address
      //     ).then(() => {
      //       return deployer.deploy(
      //         BinkabiMembership,
      //         BinbabiTokenCreate.address
      //       )
            .then(() => {
              return BinbabiTokenCreate.deployed().then(function (instance) {
                // instance.setTokenEscrowAddress(BinkabiEscrow.address);
                // instance.setTokenVotingAddress(BinkabiVoting.address);
                instance.setTokenMembershipAddress(BinkabiMembership.address);
                return instance.setTokenSaleAddress(BinkabiTokenSale.address);
              });
        //     })
        //   })

        // })
      });
    }).catch(e => console.log(e));
  })
};