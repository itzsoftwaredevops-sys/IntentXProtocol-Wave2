const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying IntentRegistry...");

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);

  // Get MockDEX address from deployment file
  const mockDexPath = path.join(__dirname, "../deployment/mockdex.json");
  let mockDexAddress = "0x0000000000000000000000000000000000000000";

  if (fs.existsSync(mockDexPath)) {
    const mockDexData = JSON.parse(fs.readFileSync(mockDexPath, "utf8"));
    mockDexAddress = mockDexData.address;
    console.log(`📍 Using MockDEX address: ${mockDexAddress}`);
  } else {
    console.warn("⚠️  MockDEX not deployed yet. Deploy MockDEX first.");
    return;
  }

  // Deploy IntentRegistry
  const IntentRegistry = await ethers.getContractFactory("IntentRegistry");
  const intentRegistry = await IntentRegistry.deploy(mockDexAddress);
  await intentRegistry.deployed();

  console.log(`✅ IntentRegistry deployed to: ${intentRegistry.address}`);

  // Create deployment directory
  if (!fs.existsSync(path.join(__dirname, "../deployment"))) {
    fs.mkdirSync(path.join(__dirname, "../deployment"), { recursive: true });
  }

  // Save deployment info
  const deploymentInfo = {
    address: intentRegistry.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    mockDex: mockDexAddress,
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployment/intent_registry.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment/intent_registry.json");

  // Export ABI
  const abiPath = path.join(__dirname, "../frontend/abi/IntentRegistry.json");
  if (!fs.existsSync(path.dirname(abiPath))) {
    fs.mkdirSync(path.dirname(abiPath), { recursive: true });
  }

  const artifact = await hre.artifacts.readArtifact("IntentRegistry");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log("📄 ABI exported to frontend/abi/IntentRegistry.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
