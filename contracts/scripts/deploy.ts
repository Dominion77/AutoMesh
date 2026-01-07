import { ethers, network, run } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

 
  console.log("\nDeploying CarbonSealRegistry...");
  const CarbonSealRegistry = await ethers.getContractFactory("CarbonSealRegistry");
  const registry = await CarbonSealRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("CarbonSealRegistry deployed to:", registryAddress);

 
  console.log("\nDeploying CarbonSealToken...");
  const CarbonSealToken = await ethers.getContractFactory("CarbonSealToken");
  const token = await CarbonSealToken.deploy(registryAddress);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("CarbonSealToken deployed to:", tokenAddress);

  
  console.log("\nLinking contracts...");
  await registry.setTokenContract(tokenAddress);
  console.log("Contracts linked successfully");

  
  console.log("\nDeploying CarbonSealOracle...");
  const CarbonSealOracle = await ethers.getContractFactory("CarbonSealOracle");
  const oracle = await CarbonSealOracle.deploy(ethers.ZeroAddress);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("CarbonSealOracle deployed to:", oracleAddress);

  
  console.log("\nSetting up roles...");
  await registry.grantRole(await registry.ORACLE_ROLE(), oracleAddress);
  await registry.grantRole(await registry.VERIFIER_ROLE(), deployer.address);
  console.log("Roles granted");

  const deploymentInfo = {
    network: network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      registry: registryAddress,
      token: tokenAddress,
      oracle: oracleAddress,
    },
    deployer: deployer.address,
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }
  fs.writeFileSync(
    `deployments/${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  if (network.name !== "hardhat") {
    console.log("\nWaiting for block confirmations...");
    await registry.deploymentTransaction()?.wait(5);
    
    console.log("\nVerifying contracts...");
    try {
      await run("verify:verify", {
        address: registryAddress,
        constructorArguments: [],
      });
      
      await run("verify:verify", {
        address: tokenAddress,
        constructorArguments: [registryAddress],
      });
      
      await run("verify:verify", {
        address: oracleAddress,
        constructorArguments: [ethers.ZeroAddress],
      });
      
      console.log("Contracts verified successfully!");
    } catch (error: any) {
      console.log("Verification error:", error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});