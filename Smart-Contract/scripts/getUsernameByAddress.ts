import { ethers } from "hardhat";
import { Contract } from "ethers";

const TIP_PROTOCOL_ADDRESS = "0x63B083b69459502BCbF68F16c7C7115B6ec4dDe5";

async function getUsernameByAddress(userAddress: string) {
  const [signer] = await ethers.getSigners();
  console.log(`Checking username for address: ${userAddress}`);

  const tipProtocolAbi = [
    "function users(address user) external view returns (string twitterHandle, bool isCreator, bool isTipper, uint256 totalTipsReceived, uint256 tipCountReceived, uint256 totalTipped, uint256 tipsSent, uint256 registeredAt, bool isActive)",
    "function getUserProfile(address user) external view returns (string twitterHandle, bool isCreator, bool isTipper, uint256 totalTipsReceived, uint256 tipCountReceived, uint256 totalTipped, uint256 tipsSent, uint256 registeredAt)"
  ];

  const tipProtocol = new ethers.Contract(TIP_PROTOCOL_ADDRESS, tipProtocolAbi, signer);

  try {
    // Query users mapping
    const userProfile = await tipProtocol.users(userAddress);
    if (!userProfile.isActive) {
      console.log(`No active user found for address: ${userAddress}`);
    } else {
      console.log(`User found for address: ${userAddress}`);
      console.log(`Details:`, {
        twitterHandle: userProfile.twitterHandle,
        isCreator: userProfile.isCreator,
        isTipper: userProfile.isTipper,
        totalTipsReceived: ethers.formatUnits(userProfile.totalTipsReceived, 6),
        tipCountReceived: userProfile.tipCountReceived.toString(),
        totalTipped: ethers.formatUnits(userProfile.totalTipped, 6),
        tipsSent: userProfile.tipsSent.toString(),
        registeredAt: new Date(Number(userProfile.registeredAt) * 1000).toISOString(),
        isActive: userProfile.isActive
      });
    }

    // Optionally, confirm with getUserProfile
    const profile = await tipProtocol.getUserProfile(userAddress);
    console.log(`getUserProfile result:`, {
      twitterHandle: profile.twitterHandle,
      isCreator: profile.isCreator,
      isTipper: profile.isTipper
    });

    return userProfile.twitterHandle || null;
  } catch (error) {
    console.error(`Error checking user ${userAddress}:`, error);
    return null;
  }
}

async function checkRegistration(twitterHandle: string) {
  const [signer] = await ethers.getSigners();
  console.log(`Checking registration for ${twitterHandle}`);

  const tipProtocolAbi = [
    "function getCreatorByTwitter(string memory twitterHandle) external view returns (address creatorAddress, (string twitterHandle, bool isRegistered, uint256 totalTipsReceived, uint256 tipCount, uint256 registeredAt) creator)",
    "function twitterToUser(string memory twitterHandle) external view returns (address)"
  ];

  const tipProtocol = new ethers.Contract(TIP_PROTOCOL_ADDRESS, tipProtocolAbi, signer);

  // Check twitterToUser mapping
  const userAddress = await tipProtocol.twitterToUser(twitterHandle);
  console.log(`twitterToUser(${twitterHandle}): ${userAddress}`);

  // Check getCreatorByTwitter
  try {
    const [creatorAddress, creatorData] = await tipProtocol.getCreatorByTwitter(twitterHandle);
    if (creatorAddress === ethers.ZeroAddress || !creatorData.isRegistered) {
      console.log(`No creator found for Twitter handle: ${twitterHandle}`);
    } else {
      console.log(`Creator found for Twitter handle: ${twitterHandle}`);
      console.log(`Address: ${creatorAddress}`);
      console.log(`Details:`, {
        twitterHandle: creatorData.twitterHandle,
        isRegistered: creatorData.isRegistered,
        totalTipsReceived: ethers.formatUnits(creatorData.totalTipsReceived, 6),
        tipCount: creatorData.tipCount.toString(),
        registeredAt: new Date(Number(creatorData.registeredAt) * 1000).toISOString()
      });
    }
  } catch (error) {
    console.error(`Error checking creator ${twitterHandle}:`, error);
  }
}

async function listRegisteredCreators() {
  const [signer] = await ethers.getSigners();
  const tipProtocolAbi = [
    "event CreatorRegistered(address indexed creator, string twitterHandle, uint256 timestamp)",
    "event UserRegistered(address indexed user, string twitterHandle, bool asCreator, bool asTipper, uint256 timestamp)"
  ];
  const tipProtocol = new ethers.Contract(TIP_PROTOCOL_ADDRESS, tipProtocolAbi, signer);

  console.log("Fetching CreatorRegistered events...");
  const creatorFilter = tipProtocol.filters.CreatorRegistered();
  const creatorEvents = await tipProtocol.queryFilter(creatorFilter);
  console.log("Registered Creators:");
  for (const event of creatorEvents) {
    console.log(`Twitter Handle: ${event.args.twitterHandle}, Address: ${event.args.creator}, Timestamp: ${new Date(Number(event.args.timestamp) * 1000).toISOString()}`);
  }

  console.log("\nFetching UserRegistered events (with creator role)...");
  const userFilter = tipProtocol.filters.UserRegistered(null, null, true);
  const userEvents = await tipProtocol.queryFilter(userFilter);
  for (const event of userEvents) {
    console.log(`Twitter Handle: ${event.args.twitterHandle}, Address: ${event.args.user}, IsCreator: ${event.args.asCreator}, IsTipper: ${event.args.asTipper}, Timestamp: ${new Date(Number(event.args.timestamp) * 1000).toISOString()}`);
  }
}

async function main() {
  // Replace with the address you want to check
  const userAddress = "0xB24023434c3670E100068C925A87fE8F500d909a"; // Replace with the address to query
  const twitterHandle = "mrrwiicks"; // Check fokomoli registration

  console.log("=== Checking Username by Address ===");
  await getUsernameByAddress(userAddress);

  console.log("\n=== Checking fokomoli Registration ===");
  await checkRegistration(twitterHandle);

  console.log("\n=== Listing All Registered Creators ===");
  await listRegisteredCreators();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });