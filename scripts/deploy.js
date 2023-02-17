const hre = require("hardhat");
const { items } = require("../client/src/items.json");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function main() {
  // Setup accounts
  const [owner, seller] = await ethers.getSigners();
  console.log(`Owner Account No.:`, owner.address);
  console.log(`Seller Account No.:`, seller.address);

  // Deploy Dappazon
  const MFCollection = await hre.ethers.getContractFactory("MFCollection");
  const contract = await MFCollection.deploy(); //instance of contract

  await contract.deployed();
  console.log("Address of contract:", contract.address);

  // seller Information
  const sellerInformation = await contract
    .connect(seller)
    .sellerInformation("Faisal", 121, "Pakistan");
  await sellerInformation.wait();

  const sellerId = await contract.sellersId(seller.address);
  console.log("Seller ID:", sellerId.toString());

  //Approved seller
  const approveSeller = await contract
    .connect(owner)
    .approveSeller(sellerId.toString());

  await approveSeller.wait();

  // Listing items...

  for (let i = 0; i < items.length; i++) {
    const transcation = await contract.connect(seller).listProduct(
      items[i].name,
      items[i].title,
      items[i].description,
      items[i].category,
      items[i].image,
      tokens(items[i].cost),
      parseInt(items[i].rating), //ParseInt use because value is in decimals
      items[i].stock
    );

    await transcation.wait();

    console.log(`Listed item ${items[i].name}: ${items[i].cost}`);
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
