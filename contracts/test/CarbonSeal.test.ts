import { expect } from "chai";
import  hre  from "hardhat";
import type { CarbonSealRegistry, CarbonSealToken, CarbonSealOracle } from "../typechain-types";

const ethers = (hre as any).ethers;
const loadFixture = (hre as any).loadFixture;

describe("CarbonSeal", function () {
  async function deployContractsFixture() {
    const [owner, farmer1, farmer2, verifier, oracle] = await ethers.getSigners();

    // Deploy CarbonSealRegistry
    const CarbonSealRegistry = await ethers.getContractFactory("CarbonSealRegistry");
    const registry = await CarbonSealRegistry.deploy();
    await registry.waitForDeployment();

    // Deploy CarbonSealToken
    const CarbonSealToken = await ethers.getContractFactory("CarbonSealToken");
    const token = await CarbonSealToken.deploy(await registry.getAddress());
    await token.waitForDeployment();

    // Link contracts
    await registry.setTokenContract(await token.getAddress());

    // Deploy Oracle
    const CarbonSealOracle = await ethers.getContractFactory("CarbonSealOracle");
    const oracleContract = await CarbonSealOracle.deploy(ethers.ZeroAddress);
    await oracleContract.waitForDeployment();

    // Setup roles
    await registry.grantRole(await registry.ORACLE_ROLE(), await oracleContract.getAddress());
    await registry.grantRole(await registry.VERIFIER_ROLE(), verifier.address);

    return {
      registry: registry as CarbonSealRegistry,
      token: token as CarbonSealToken,
      oracle: oracleContract as CarbonSealOracle,
      owner,
      farmer1,
      farmer2,
      verifier,
      oracleAccount: oracle,
    };
  }

  describe("CarbonSealRegistry", function () {
    it("Should deploy successfully", async function () {
      const { registry } = await loadFixture(deployContractsFixture);
      expect(await registry.getAddress()).to.be.properAddress;
    });

    it("Should allow farm registration", async function () {
      const { registry, farmer1 } = await loadFixture(deployContractsFixture);
      
      await expect(
        registry.connect(farmer1).registerFarm("Green Valley", 100, "0,0", "Loam")
      )
        .to.emit(registry, "FarmRegistered")
        .withArgs(farmer1.address, 1, "Green Valley", 100, "0,0");
      
      const farm = await registry.getFarmByAddress(farmer1.address);
      expect(farm.name).to.equal("Green Valley");
    });

    it("Should add carbon readings", async function () {
      const { registry, farmer1 } = await loadFixture(deployContractsFixture);
      
      await registry.connect(farmer1).registerFarm("Test", 100, "0,0", "Clay");
      
      const amount = ethers.parseUnits("500", 18);
      
      await expect(
        registry.connect(farmer1).addCarbonReading(1, amount, "sensor", "hash1")
      )
        .to.emit(registry, "CarbonAdded")
        .withArgs(1, 1, amount, "sensor", "hash1");
      
      const stats = await registry.getFarmStats(1);
      expect(stats.totalCarbon).to.equal(amount);
    });
  });

  describe("CarbonSealToken", function () {
    it("Should mint carbon credits", async function () {
      const { registry, token, farmer1 } = await loadFixture(deployContractsFixture);
      
      await registry.connect(farmer1).registerFarm("Farm", 100, "0,0", "Loam");
      const amount = ethers.parseUnits("1200", 18);
      
      await registry.connect(farmer1).addCarbonReading(1, amount, "sensor", "hash1");
      
      await expect(
        token.connect(farmer1).mintCredit(farmer1.address, 1, amount, "IPCC", "ipfs://test")
      )
        .to.emit(token, "CreditMinted")
        .withArgs(1, farmer1.address, 1, amount, "IPCC");
      
      expect(await token.ownerOf(1)).to.equal(farmer1.address);
    });

    it("Should allow credit retirement", async function () {
      const { registry, token, farmer1 } = await loadFixture(deployContractsFixture);
      
      await registry.connect(farmer1).registerFarm("Farm", 100, "0,0", "Loam");
      const amount = ethers.parseUnits("1200", 18);
      
      await registry.connect(farmer1).addCarbonReading(1, amount, "sensor", "hash1");
      await token.connect(farmer1).mintCredit(farmer1.address, 1, amount, "IPCC", "ipfs://test");
      
      await expect(
        token.connect(farmer1).retireCredit(1, "Sustainability")
      )
        .to.emit(token, "CreditRetired")
        .withArgs(1, farmer1.address, "Sustainability");
      
      const credit = await token.getCreditDetails(1);
      expect(credit.isRetired).to.be.true;
    });
  });
});