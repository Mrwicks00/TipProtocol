import { ethers } from "hardhat";

async function main() {
  console.log("🪙 Adding USDT support to TipProtocol...");

  // Contract addresses
  const TIP_PROTOCOL_ADDRESS = "0x63B083b69459502BCbF68F16c7C7115B6ec4dDe5";
  const USDT_ADDRESS = "0xC111f83472454148399F7cB4090B8E2B39fb1541";

  // Get the deployer account (must be contract owner)
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("👤 Using account:", deployerAddress);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployerAddress)));

  try {
    // Get contract instance
    console.log("\n📡 Connecting to TipProtocol contract...");
    const TipProtocol = await ethers.getContractFactory("TipProtocol");
    const tipProtocol = TipProtocol.attach(TIP_PROTOCOL_ADDRESS);

    // Check current owner
    const owner = await tipProtocol.owner();
    console.log("🏠 Contract owner:", owner);
    
    if (owner.toLowerCase() !== deployerAddress.toLowerCase()) {
      console.error("❌ Error: You are not the contract owner!");
      console.log(`   Contract owner: ${owner}`);
      console.log(`   Your address:   ${deployerAddress}`);
      return;
    }

    // Check if USDT is already supported
    console.log("\n🔍 Checking if USDT is already supported...");
    const isAlreadySupported = await tipProtocol.supportedTokens(USDT_ADDRESS);
    
    if (isAlreadySupported) {
      console.log("ℹ️ USDT is already supported!");
      return;
    }

    // Add USDT as supported token
    console.log("\n🪙 Adding USDT as supported token...");
    const addTokenTx = await tipProtocol.addSupportedToken(USDT_ADDRESS);
    console.log("📤 Transaction sent:", addTokenTx.hash);
    
    // Wait for confirmation
    console.log("⏳ Waiting for confirmation...");
    const receipt = await addTokenTx.wait();
    console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);

    // Verify USDT is now supported
    const isNowSupported = await tipProtocol.supportedTokens(USDT_ADDRESS);
    console.log("🔍 USDT supported after addition:", isNowSupported);

    // Get all supported tokens
    const supportedTokens = await tipProtocol.getSupportedTokens();
    console.log("📋 All supported tokens:", supportedTokens);

    console.log("\n🎉 USDT support added successfully!");
    console.log("=".repeat(50));
    console.log(`🏠 Contract: ${TIP_PROTOCOL_ADDRESS}`);
    console.log(`🪙 USDT Token: ${USDT_ADDRESS}`);
    console.log(`📱 Explorer: https://explorer-holesky.morphl2.io/tx/${addTokenTx.hash}`);
    console.log("=".repeat(50));

  } catch (error: any) {
    console.error("❌ Failed to add USDT support:", error.message);
    
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("💡 Make sure you're using the wallet that deployed the contract");
    }
    
    process.exitCode = 1;
  }
}

main()
  .then(() => {
    console.log("✅ Script completed successfully");
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exitCode = 1;
  });