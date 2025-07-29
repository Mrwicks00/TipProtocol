import { ethers } from "hardhat";
import { parseUnits } from "ethers";
import * as fs from "fs";

async function main() {
    console.log("🚀 Starting USDT deployment on Morph Holesky...\n");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);
    
    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

    // Contract parameters
    const TOKEN_NAME = "Tether USD";
    const TOKEN_SYMBOL = "USDT";
    const DECIMALS = 6;
    const INITIAL_SUPPLY = parseUnits("1000000", DECIMALS); // 1M USDT initial supply
    const INITIAL_OWNER = deployer.address; // Deploy as owner

    console.log("📋 Contract Parameters:");
    console.log("   Name:", TOKEN_NAME);
    console.log("   Symbol:", TOKEN_SYMBOL);
    console.log("   Decimals:", DECIMALS);
    console.log("   Initial Supply:", ethers.formatUnits(INITIAL_SUPPLY, DECIMALS), TOKEN_SYMBOL);
    console.log("   Initial Owner:", INITIAL_OWNER);
    console.log("");

    try {
        // Deploy the USDT contract
        console.log("⏳ Deploying USDT contract...");
        const USDT = await ethers.getContractFactory("USDT");
        
        const usdt = await USDT.deploy(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            DECIMALS,
            INITIAL_SUPPLY,
            INITIAL_OWNER
        );

        await usdt.waitForDeployment();
        const usdtAddress = await usdt.getAddress();

        console.log("✅ USDT deployed successfully!");
        console.log("📍 Contract Address:", usdtAddress);
        console.log("");

        // Verify deployment by calling contract functions
        console.log("🔍 Verifying deployment...");
        
        const contractInfo = await usdt.getContractInfo();
        console.log("   Token Name:", contractInfo.tokenName);
        console.log("   Token Symbol:", contractInfo.tokenSymbol);
        console.log("   Decimals:", contractInfo.tokenDecimals.toString());
        console.log("   Total Supply:", ethers.formatUnits(contractInfo.tokenTotalSupply, DECIMALS), TOKEN_SYMBOL);
        console.log("   Max Supply:", ethers.formatUnits(contractInfo.maxSupply, DECIMALS), TOKEN_SYMBOL);
        console.log("   Owner:", contractInfo.contractOwner);
        console.log("   Is Paused:", contractInfo.isPaused);
        console.log("");

        // Check deployer's balance
        const deployerBalance = await usdt.balanceOf(deployer.address);
        console.log("💳 Deployer USDT Balance:", ethers.formatUnits(deployerBalance, DECIMALS), TOKEN_SYMBOL);
        console.log("");

        // Optional: Mint additional tokens for testing
        console.log("🎯 Minting additional test tokens...");
        const additionalMint = parseUnits("500000", DECIMALS); // 500K more
        const mintTx = await usdt.mint(deployer.address, additionalMint);
        await mintTx.wait();
        
        const newBalance = await usdt.balanceOf(deployer.address);
        console.log("✅ Additional tokens minted!");
        console.log("💳 New Deployer Balance:", ethers.formatUnits(newBalance, DECIMALS), TOKEN_SYMBOL);
        console.log("");

        // Contract deployment summary
        console.log("📋 DEPLOYMENT SUMMARY");
        console.log("=====================");
        console.log("🏷️  Contract Name: USDT (Tether USD)");
        console.log("📍 Contract Address:", usdtAddress);
        console.log("🌐 Network: Morph Holesky");
        console.log("👤 Owner:", INITIAL_OWNER);
        console.log("💰 Total Supply:", ethers.formatUnits(await usdt.totalSupply(), DECIMALS), TOKEN_SYMBOL);
        console.log("🔧 Decimals:", DECIMALS);
        console.log("");

        // Instructions for next steps
        console.log("📝 NEXT STEPS");
        console.log("=============");
        console.log("1. Save the contract address:", usdtAddress);
        console.log("2. Add to your frontend/backend configuration");
        console.log("3. Consider verifying the contract on block explorer");
        console.log("4. Set up proper access controls if needed");
        console.log("");

        // Export contract addresses for other scripts
        interface DeploymentInfo {
            network: string;
            contracts: {
                USDT: {
                    address: string;
                    name: string;
                    symbol: string;
                    decimals: number;
                    deployedAt: string;
                    deploymentBlock: number;
                    owner: string;
                };
            };
        }

        const deploymentInfo: DeploymentInfo = {
            network: "morph-holesky",
            contracts: {
                USDT: {
                    address: usdtAddress,
                    name: TOKEN_NAME,
                    symbol: TOKEN_SYMBOL,
                    decimals: DECIMALS,
                    deployedAt: new Date().toISOString(),
                    deploymentBlock: await ethers.provider.getBlockNumber(),
                    owner: INITIAL_OWNER
                }
            }
        };

        // Save deployment info to file
        const deploymentPath = `./deployments/morph-holesky-${Date.now()}.json`;
        
        // Create deployments directory if it doesn't exist
        if (!fs.existsSync('./deployments')) {
            fs.mkdirSync('./deployments');
        }
        
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log("💾 Deployment info saved to:", deploymentPath);

        console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉");

    } catch (error) {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    }
}

// Handle script execution
main()
    .then(() => process.exit(0))
    .catch((error: any) => {
        console.error("💥 Script execution failed:");
        console.error(error);
        process.exit(1);
    });

// Export for use in other scripts
export default main;