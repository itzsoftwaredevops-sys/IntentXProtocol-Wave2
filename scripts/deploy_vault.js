const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Vault...");

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);

  // For demo, use a mock token address (in real deployment, use real token)
  const mockTokenAddress = "0x0000000000000000000000000000000000000001";

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(mockTokenAddress);
  await vault.deployed();

  console.log(`✅ Vault deployed to: ${vault.address}`);

  if (!fs.existsSync(path.join(__dirname, "../deployment"))) {
    fs.mkdirSync(path.join(__dirname, "../deployment"), { recursive: true });
  }

  const deploymentInfo = {
    address: vault.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    depositToken: mockTokenAddress,
    defaultAPR: 750, // 7.5%
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployment/vault.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment/vault.json");

  const abiPath = path.join(__dirname, "../frontend/abi/Vault.json");
  if (!fs.existsSync(path.dirname(abiPath))) {
    fs.mkdirSync(path.dirname(abiPath), { recursive: true });
  }

  const artifact = await hre.artifacts.readArtifact("Vault");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log("📄 ABI exported to frontend/abi/Vault.json");

  const apr = await vault.getAPR();
  console.log(`\n📊 Vault Configuration:`);
  console.log(`   Default APR: ${apr.toString()} (${apr.toString() / 100}%)`);
  console.log(`   Total Deposits: ${(await vault.getTotalDeposits()).toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
