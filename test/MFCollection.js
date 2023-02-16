const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

// Global constants for listing an item...
//Product
// const id = 1;
const name = "Stuffed Animal";
const title = "Bluey Bingo 16 Stuffed Animal - Playtime & Naptime Companion";
const description =
  "Best Mate Bingo Is Made With Premium Soft Deluxe Fabrics And Detailed Stitching.";
const category = "toys";
const image =
  "https://gateway.pinata.cloud/ipfs/QmZhFD5dAeZHWuTtaZoNC7R6p1nMWDQJA1mqA9PnAS7PSF/Toys1.png";
const cost = 1;
const rating = parseInt(4.5); //for Decimals
const stock = 10;

//SellerInformation
const sellerName = "Faisal";
const sellerIdentityNo = 121;
const sellerCountry = "Pakistan";

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

  describe("Owner approved the seller", () => {
    let sellerInformation, approveSeller;

    beforeEach(async () => {
      // seller Information
      sellerInformation = await mfCollection
        .connect(seller)
        .sellerInformation(sellerName, sellerIdentityNo, sellerCountry);
      await sellerInformation.wait();

      // const sellerId = await mfCollection.sellersId(seller.address);
      // console.log(sellerId.toString());

      // approve seller
      approveSeller = await mfCollection
        .connect(owner)
        .approveSeller(sellerIdentityNo);

      await approveSeller.wait();
    });

    it("Owner Approved Seller", async () => {
      const sellerDetails = await mfCollection.sellers(sellerIdentityNo);
      expect(sellerDetails.sellerName).to.equal(sellerName);
      expect(sellerDetails.sellerAddress).to.equal(seller.address);
      expect(sellerDetails.sellerId).to.equal(sellerIdentityNo);
      expect(sellerDetails.sellerCountry).to.equal(sellerCountry);
      expect(sellerDetails.approvedSeller).to.equal(true);

      const sellerID = await mfCollection.sellersId(seller.address);
      expect(sellerID).to.equal(sellerIdentityNo);
    });

    it("Emit Approved Seller", async () => {
      expect(sellerInformation).to.emit(mfCollection, "SellerInformation");
    });
  });

  describe("Listing a Product", () => {
    let transcation, sellerInformation, approveSeller;

    beforeEach(async () => {
      // seller Information
      sellerInformation = await mfCollection
        .connect(seller)
        .sellerInformation(sellerName, sellerIdentityNo, sellerCountry);
      await sellerInformation.wait();

      // const sellerId = await mfCollection.sellersId(seller.address);
      // console.log(sellerId.toString());

      // approve seller
      approveSeller = await mfCollection
        .connect(owner)
        .approveSeller(sellerIdentityNo);

      await approveSeller.wait();

      //Listing Product
      transcation = await mfCollection
        .connect(seller)
        .listProduct(
          name,
          title,
          description,
          category,
          image,
          cost,
          rating,
          stock
        );
      await transcation.wait();
    });

    it("Seller Upload Items", async () => {
      const item = await mfCollection.items(1);

      expect(item.id).to.equal(1);
      expect(item.name).to.equal("Stuffed Animal");
      expect(item.title).to.equal(title);
      expect(item.description).to.equal(description);
      expect(item.category).to.equal(category);
      expect(item.image).to.equal(image);
      expect(item.cost).to.equal(cost);
      expect(item.rating).to.equal(rating);
      expect(item.stock).to.equal(stock);
      expect(item.seller).to.equal(seller.address);
    });

    it("Emit Product List", async () => {
      expect(transcation).to.emit(mfCollection, "ListProduct");
    });
  });
});
