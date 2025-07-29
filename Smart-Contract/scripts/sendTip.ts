import { ethers } from "hardhat";
import { Contract } from "ethers";
import { parseUnits, isAddress } from "ethers";

const TIP_PROTOCOL_ADDRESS = "0x40eBEbB20919818DbAdF3c67648AD2afBF28eF70";
const USDT_ADDRESS = "0xc727E73CCD6B6Dd1eB524d6e24d7CbC9FE15CdEc";

async function getRegisteredCreator(twitterHandle: string) {
  const [signer] = await ethers.getSigners();

  // ABI for getCreatorByTwitter function
  const tipProtocolAbi = [
    "function getCreatorByTwitter(string memory twitterHandle) external view returns (address creatorAddress, (string twitterHandle, bool isRegistered, uint256 totalTipsReceived, uint256 tipCount, uint256 registeredAt) creator)"
  ];

  // Connect to TipProtocol contract
  const tipProtocol = new ethers.Contract(
    TIP_PROTOCOL_ADDRESS,
    tipProtocolAbi,
    signer
  );

  try {
    const [creatorAddress, creatorData] = await tipProtocol.getCreatorByTwitter(twitterHandle);
    if (creatorAddress === ethers.ZeroAddress || !creatorData.isRegistered) {
      console.log(`No creator found for Twitter handle: ${twitterHandle}`);
      return null;
    }
    console.log(`Creator found for Twitter handle: ${twitterHandle}`);
    console.log(`Address: ${creatorAddress}`);
    console.log(`Details:`, {
      twitterHandle: creatorData.twitterHandle,
      isRegistered: creatorData.isRegistered,
      totalTipsReceived: ethers.formatUnits(creatorData.totalTipsReceived, 6),
      tipCount: creatorData.tipCount.toString(),
      registeredAt: new Date(Number(creatorData.registeredAt) * 1000).toISOString()
    });
    return { creatorAddress, creatorData };
  } catch (error) {
    console.error(`Error checking creator ${twitterHandle}:`, error);
    return null;
  }
}

async function sendTip(
  creatorTwitterHandle: string,
  amount: string,
  message: string
) {
  const [signer] = await ethers.getSigners();
  const tipperAddress = await signer.getAddress();
  
  if (!isAddress(tipperAddress)) {
    throw new Error("Invalid tipper address");
  }

  // Check if creator exists
  const creator = await getRegisteredCreator(creatorTwitterHandle);
  if (!creator) {
    throw new Error(`Creator with Twitter handle ${creatorTwitterHandle} not found`);
  }

  // ABI for tipCreator function
  const tipProtocolAbi = [
    "function tipCreator(string memory creatorTwitterHandle, address token, uint256 amount, string memory message) external"
  ];

  // Connect to TipProtocol contract
  const tipProtocol = new ethers.Contract(
    TIP_PROTOCOL_ADDRESS,
    tipProtocolAbi,
    signer
  );

  // Connect to USDT contract
  const usdtAbi = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)"
  ];
  
  const usdt = new ethers.Contract(USDT_ADDRESS, usdtAbi, signer);

  // Convert amount to USDT decimals (6)
  const amountWei = parseUnits(amount, 6);

  // Check and set allowance
  const allowance = await usdt.allowance(tipperAddress, TIP_PROTOCOL_ADDRESS);
  if (allowance < amountWei) {
    console.log("Approving USDT spend...");
    const approveTx = await usdt.approve(TIP_PROTOCOL_ADDRESS, amountWei);
    await approveTx.wait();
    console.log("Approval successful");
  }

  // Send tip
  console.log(`Sending tip from ${tipperAddress}...`);
  const tx = await tipProtocol.tipCreator(
    creatorTwitterHandle,
    USDT_ADDRESS,
    amountWei,
    message
  );
  
  const receipt = await tx.wait();
  console.log(`Tip sent! Transaction hash: ${receipt.transactionHash}`);
}

async function main() {
  // Replace with a Twitter handle you suspect is registered
  const creatorTwitterHandle = "johndoe"; // Replace with a valid handle
  const amount = "1.0"; // 1 USDT
  const message = "Thanks for the great content!";

  // Check creator first
  console.log(`Checking creator: ${creatorTwitterHandle}`);
  await getRegisteredCreator(creatorTwitterHandle);

  // Send tip
  await sendTip(creatorTwitterHandle, amount, message);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });