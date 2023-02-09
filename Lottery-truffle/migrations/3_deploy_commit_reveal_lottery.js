const Lottery = artifacts.require("CommitRevealLottery");

module.exports = function (deployer) {
    deployer.deploy(Lottery);
}