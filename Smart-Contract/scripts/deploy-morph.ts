import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("🚀 Starting TipProtocol deployment on Morph Holesky...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("📝 Deploying contracts with the account:", deployerAddress);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployerAddress)));

  // USDT token address on Morph Holesky
  const USDT_ADDRESS = "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98";

  try {
    // Deploy TipProtocol contract
    console.log("\n📦 Deploying TipProtocol contract...");
    const TipProtocol = await ethers.getContractFactory("TipProtocol");
    
    const tipProtocol = await TipProtocol.deploy();
    await tipProtocol.waitForDeployment();
    
    const contractAddress = await tipProtocol.getAddress();
    console.log("✅ TipProtocol deployed to:", contractAddress);

    // Wait for a few block confirmations before verification
    console.log("⏳ Waiting for block confirmations...");
    await tipProtocol.deploymentTransaction()?.wait(5);

    // Add USDT as a supported token
    console.log("\n🪙 Adding USDT as supported token...");
    const addTokenTx = await tipProtocol.addSupportedToken(USDT_ADDRESS);
    await addTokenTx.wait();
    console.log("✅ USDT added as supported token");

    // Verify the supported tokens
    const supportedTokens = await tipProtocol.getSupportedTokens();
    console.log("📋 Supported tokens:", supportedTokens);

    // Verify contract on explorer
    console.log("\n🔍 Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
        contract: "contracts/TipProtocol.sol:TipProtocol" // Adjust path if needed
      });
      console.log("✅ Contract verified successfully!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️ Contract is already verified");
      } else {
        console.error("❌ Verification failed:", error.message);
        console.log("🔧 You can verify manually later with:");
        console.log(`npx hardhat verify --network morphHolesky ${contractAddress}`);
      }
    }

    // Display deployment summary
    console.log("\n📊 DEPLOYMENT SUMMARY");
    console.log("=".repeat(50));
    console.log(`🏠 TipProtocol Address: ${contractAddress}`);
    console.log(`🌐 Network: Morph Holesky (Chain ID: 2810)`);
    console.log(`👤 Deployer: ${deployerAddress}`);
    console.log(`🪙 USDT Token: ${USDT_ADDRESS}`);
    console.log(`📱 Explorer: https://explorer-holesky.morphl2.io/address/${contractAddress}`);
    console.log("=".repeat(50));

    // Test basic functionality
    console.log("\n🧪 Testing basic contract functionality...");
    
    // Check if ETH is supported (should be true by default)
    const isEthSupported = await tipProtocol.supportedTokens(ethers.ZeroAddress);
    console.log("💎 ETH supported:", isEthSupported);
    
    // Check if USDT is supported
    const isUsdtSupported = await tipProtocol.supportedTokens(USDT_ADDRESS);
    console.log("🪙 USDT supported:", isUsdtSupported);
    
    // Check platform fee rate
    const platformFee = await tipProtocol.platformFeeRate();
    console.log("💰 Platform fee rate:", platformFee.toString(), "basis points");
    
    // Check daily spending limit
    const dailyLimit = await tipProtocol.DAILY_SPENDING_LIMIT();
    console.log("📊 Daily spending limit:", ethers.formatEther(dailyLimit), "ETH equivalent");

    console.log("\n🎉 Deployment completed successfully!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  }
}

// Enhanced error handling
main()
  .then(() => {
    console.log("✅ Script executed successfully");
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exitCode = 1;
  });