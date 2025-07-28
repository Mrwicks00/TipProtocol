"use client"

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { useEffect } from "react"
import { parseEther, formatEther } from "viem"
import { useState } from "react"
import { TIP_PROTOCOL_ADDRESS, TIP_PROTOCOL_ABI } from "@/lib/contracts/tip-protocol"

export function useTipProtocol() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash,
    confirmations: 1 // Wait for at least 1 confirmation
  });

  // Register user function with better validation
// In your use-tip-protocol.ts, update the registerUser function:
const registerUser = async (twitterHandle: string, asCreator: boolean, asTipper: boolean) => {
  try {
    setIsLoading(true);
    setCurrentStep("Preparing registration...");
    
    // Validate inputs
    if (!twitterHandle || twitterHandle.trim() === "") {
      throw new Error("Twitter handle is required");
    }

    if (!asCreator && !asTipper) {
      throw new Error("Must register as either creator or tipper");
    }

    setCurrentStep("Registering user...");
    
    const result = await writeContract({
      address: TIP_PROTOCOL_ADDRESS,
      abi: TIP_PROTOCOL_ABI,
      functionName: "registerUser",
      args: [twitterHandle.trim(), asCreator, asTipper],
      gas: BigInt(300000),
    });

    setCurrentStep("Registration submitted successfully!");
    return result;
    
  } catch (err: any) {
    console.error("Error registering user:", err);
    setCurrentStep("");
    
    if (err.message?.includes("User rejected")) {
      throw new Error("Transaction was rejected by user");
    } else if (err.message?.includes("insufficient funds")) {
      throw new Error("Insufficient funds for gas fees");
    } else if (err.message?.includes("already registered")) {
      throw new Error("User is already registered");
    } else {
      throw new Error(err.message || "Registration failed");
    }
  } finally {
    setIsLoading(false);
    setCurrentStep("");
  }
};
  // Authorize bot function with validation
  const authorizeBot = async (botOperator: string) => {
    try {
      setIsLoading(true);
      setCurrentStep("Authorizing bot...");
      
      // Validate bot operator address
      if (!botOperator || botOperator === "0x1234567890123456789012345678901234567890") {
        throw new Error("Invalid bot operator address");
      }

      if (!botOperator.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address format");
      }

      setCurrentStep("Waiting for wallet confirmation...");
      
      const result = await writeContract({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "authorizeBot",
        args: [botOperator as `0x${string}`],
        gas: BigInt(100000), // Adjust based on your contract's needs
      });

      setCurrentStep("Bot authorization submitted...");
      return result;
      
    } catch (err: any) {
      console.error("Error authorizing bot:", err);
      setCurrentStep("");
      throw new Error(err.message || "Bot authorization failed");
    } finally {
      setIsLoading(false);
      setCurrentStep("");
    }
  };

  return {
    registerUser,
    authorizeBot,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error,
    hash,
    currentStep,
  };
}



// Hook to get user profile
export function useUserProfile(userAddress?: string) {
  const { data: profile, isLoading: profileLoading, error: profileError } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "getUserProfile",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  })

  const { data: balance, isLoading: balanceLoading, error: balanceError } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "getBalance",
    args: userAddress
      ? [userAddress as `0x${string}`, "0x0000000000000000000000000000000000000000" as `0x${string}`]
      : undefined, // ETH balance
  })

  const { data: isRegistered, isLoading: registeredLoading, error: registeredError } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "isRegisteredUser",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  })

  const { data: legacyCreator } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "creators",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  })
  
  const { data: legacyTipper } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "tippers", 
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  })

  // Debug logging
  useEffect(() => {
    console.log("=== useUserProfile Debug ===");
    console.log("userAddress:", userAddress);
    console.log("profile raw data:", profile);
    console.log("isRegistered raw data:", isRegistered);
    console.log("profileLoading:", profileLoading);
    console.log("registeredLoading:", registeredLoading);
    console.log("profileError:", profileError);
    console.log("registeredError:", registeredError);
    console.log("processed isRegistered:", Boolean(isRegistered));
    console.log("legacyCreator:", legacyCreator);
    console.log("legacyTipper:", legacyTipper);
    console.log("============================");
  }, [userAddress, profile, isRegistered, profileLoading, legacyCreator, legacyTipper, registeredLoading, profileError, registeredError]);

  return {
    profile: profile
      ? {
          twitterHandle: profile[0],
          isCreator: profile[1],
          isTipper: profile[2],
          totalTipsReceived: formatEther(profile[3]),
          tipCountReceived: Number(profile[4]),
          totalTipped: formatEther(profile[5]),
          tipsSent: Number(profile[6]),
          registeredAt: Number(profile[7]),
        }
      : null,
    balance: balance ? formatEther(balance) : "0",
    isRegistered: Boolean(isRegistered),
    // Add loading states for debugging
    isLoading: profileLoading || registeredLoading,
    errors: { profileError, balanceError, registeredError }
  }
}

// Hook to get creator by Twitter handle (for bot usage)
export function useCreatorByTwitter(twitterHandle?: string) {
  const { data: creatorData } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "getCreatorByTwitter",
    args: twitterHandle ? [twitterHandle] : undefined,
  })

  return {
    creatorAddress: creatorData?.[0],
    creator: creatorData?.[1]
      ? {
          twitterHandle: creatorData[1].twitterHandle,
          isRegistered: creatorData[1].isRegistered,
          totalTipsReceived: formatEther(creatorData[1].totalTipsReceived),
          tipCount: Number(creatorData[1].tipCount),
          registeredAt: Number(creatorData[1].registeredAt),
        }
      : null,
  }
}
