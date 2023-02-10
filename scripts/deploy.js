const hre = require("hardhat");

async function main() {
  const MFCollection = await hre.ethers.getContractFactory("MFCollection");
  const contract = await MFCollection.deploy(); //instance of contract

  await contract.deployed();
  console.log("Address of contract:", contract.address);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
