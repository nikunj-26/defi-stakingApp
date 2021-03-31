var PogToken = artifacts.require("./PogToken.sol");
var DaiToken = artifacts.require("./DaiToken.sol");
var TokenFarm = artifacts.require("./TokenFarm.sol");

module.exports = async function (deployer, network, accounts) {
  //Deploy Dai Token
  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();

  //Deploy Pog Token
  await deployer.deploy(PogToken);
  const pogToken = await PogToken.deployed();

  //deploy token farm with daiToken and pogToken address
  await deployer.deploy(TokenFarm, pogToken.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed();

  //Pass all the PogTokens to TokenFarm so that it can manage and distribute it as interest
  await pogToken.transfer(tokenFarm.address, "1000000000000000000000000");

  //Transfer 100 mock dai tokens to the investor
  //accounts[0] is the contract deployer
  //we treat accounts[1] as the investor
  await daiToken.transfer(accounts[1], "100000000000000000000");
};
