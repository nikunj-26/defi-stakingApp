const { assert } = require("chai");

var PogToken = artifacts.require("./PogToken.sol");
var DaiToken = artifacts.require("./DaiToken.sol");
var TokenFarm = artifacts.require("./TokenFarm.sol");

require("chai").use(require("chai-as-promised")).should();

//Creating a helper function for converting from ether to wei:
function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

contract("TokenFarm", ([owner, investor]) => {
  let daiToken, pogToken, tokenFarm;
  before(async () => {
    //Load all Contracts
    daiToken = await DaiToken.new();
    pogToken = await PogToken.new();
    tokenFarm = await TokenFarm.new(pogToken.address, daiToken.address);

    //Transfer All PogTokens to Token Farm
    await pogToken.transfer(tokenFarm.address, tokens("1000000"));

    //Transfer investor tokens
    await daiToken.transfer(investor, tokens("100"), { from: owner });
  });

  //Write tests here
  describe("mockDai Deployment", async () => {
    it("has a name", async () => {
      const name = await daiToken.name();
      assert.equal(name, "Mock DAI Token");
    });
  });

  //PogToken
  describe("Pog Token Deployment", async () => {
    it("has a name", async () => {
      const name = await pogToken.name();
      assert.equal(name, "PogChamp Token");
    });
  });
  //Token Farm
  describe("Token Farm Deployment", async () => {
    it("has a name", async () => {
      const name = await tokenFarm.name();
      assert.equal(name, "Token Farm");
    });
    it("contract has tokens", async () => {
      let balance = await pogToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), tokens("1000000"));
    });
  });

  describe("Farming Tokens", async () => {
    it("rewards users for staking mDai Tokens", async () => {
      let result;
      //Check investor balance before staking
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "Investor mock dai balance correct before staking"
      );

      // Stake Mock DAI Tokens
      await daiToken.approve(tokenFarm.address, tokens("100"), {
        from: investor,
      });
      await tokenFarm.stakeTokens(tokens("100"), { from: investor });

      // Check staking result
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("0"),
        "investor Mock DAI wallet balance correct after staking"
      );

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        tokens("100"),
        "Token Farm Mock DAI balance correct after staking"
      );

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "investor staking balance correct after staking"
      );
      result = await tokenFarm.isStaking(investor);
      assert.equal(
        result.toString(),
        "true",
        "investor staking status correct after staking"
      );

      // Issue Tokens
      await tokenFarm.issueTokens({ from: owner });

      // Check balances after issuance
      result = await pogToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "investor Pog Token wallet balance correct affter issuance"
      );

      // Ensure that only onwer can issue tokens
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

      // Unstake tokens
      await tokenFarm.unstakeTokens({ from: investor });

      // Check results after unstaking
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "investor Mock DAI wallet balance correct after staking"
      );

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        tokens("0"),
        "Token Farm Mock DAI balance correct after staking"
      );

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokens("0"),
        "investor staking balance correct after staking"
      );

      result = await tokenFarm.isStaking(investor);
      assert.equal(
        result.toString(),
        "false",
        "investor staking status correct after staking"
      );
    });
  });
});
