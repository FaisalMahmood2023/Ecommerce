const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("MFCollection", () => {
  let mfCollection;
  let owner, seller, buyer;

  beforeEach(async () => {
    // setup accounts
    [owner, seller, buyer] = await ethers.getSigners();

    //Deploy Contract
    const MFCollection = await hre.ethers.getContractFactory("MFCollection");
    mfCollection = await MFCollection.deploy(); //instance of contract

    await mfCollection.deployed();
  });

  describe("Deployment", () => {
    it("Set the owner", async () => {
      const deployer = await mfCollection.owner();
      expect(deployer).to.equal(owner.address);
    });
  });
});
