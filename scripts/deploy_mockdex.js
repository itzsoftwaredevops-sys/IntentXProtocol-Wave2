const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying MockDEX...");

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);

  // Deploy MockDEX
  const MockDEX = await ethers.getContractFactory("MockDEX");
  const mockDex = await MockDEX.deploy();
  await mockDex.deployed();

  console.log(`✅ MockDEX deployed to: ${mockDex.address}`);

  // Create deployment directory
  if (!fs.existsSync(path.join(__dirname, "../deployment"))) {
    fs.mkdirSync(path.join(__dirname, "../deployment"), { recursive: true });
  }

  // Save deployment info
  const deploymentInfo = {
    address: mockDex.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    feePercentage: 200, // 2%
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployment/mockdex.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment/mockdex.json");

  // Export ABI
  const abiPath = path.join(__dirname, "../frontend/abi/MockDEX.json");
  if (!fs.existsSync(path.dirname(abiPath))) {
    fs.mkdirSync(path.dirname(abiPath), { recursive: true });
  }

  const artifact = await hre.artifacts.readArtifact("MockDEX");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log("📄 ABI exported to frontend/abi/MockDEX.json");

  // Test MockDEX functions
  const feePercentage = await mockDex.getFeePercentage();
  console.log(`\n📊 MockDEX Configuration:`);
  console.log(`   Fee Percentage: ${feePercentage.toString()} (${feePercentage.toString() / 100}%)`);
  console.log(`   Swap Count: ${(await mockDex.getSwapCount()).toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
