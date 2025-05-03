// eslint-disable-next-line @typescript-eslint/no-require-imports
const hre = require("hardhat");

async function main() {
  const DonationBox = await hre.ethers.getContractFactory("DonationBox");
  const contract = await DonationBox.deploy();
  await contract.deployed();
  console.log(`✅ DonationBox deployed to: ${contract.address}`);

  const goal = hre.ethers.utils.parseEther("0.01");
  const duration = 3600;

  const tx = await contract.createCampaign(goal, duration);
  const receipt = await tx.wait();
  console.log(`📤 Campaign created in tx: ${receipt.transactionHash}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});