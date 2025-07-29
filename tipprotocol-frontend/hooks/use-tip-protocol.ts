"use client"

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { useEffect, useRef } from "react"
import { parseEther, formatEther } from "viem"
import { useState } from "react"
import { TIP_PROTOCOL_ADDRESS, TIP_PROTOCOL_ABI } from "@/lib/contracts/tip-protocol"

export function useTipProtocol() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [botAuthComplete, setBotAuthComplete] = useState(false);

  // Use refs to track if operations are in progress
  const registrationInProgress = useRef(false);
  const botAuthInProgress = useRef(false);

  const { writeContract, data: hash, error, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash,
    confirmations: 1
  });

  // Reset states when starting new operations
  const resetStates = () => {
    setIsLoading(false);
    setCurrentStep("");
    reset(); // Reset wagmi write contract state
  };

  const registerUser = async (twitterHandle: string, asCreator: boolean, asTipper: boolean) => {
    // Prevent multiple simultaneous registration attempts
    if (registrationInProgress.current) {
      console.log("Registration already in progress, skipping...");
      return;
    }

    try {
      registrationInProgress.current = true;
      setIsLoading(true);
      setRegistrationComplete(false);
      setCurrentStep("Preparing registration...");
      
      console.log("=== Contract Call Debug ===");
      console.log("TIP_PROTOCOL_ADDRESS:", TIP_PROTOCOL_ADDRESS);
      console.log("twitterHandle:", twitterHandle);
      console.log("asCreator:", asCreator);
      console.log("asTipper:", asTipper);
      console.log("==========================");
      
      // Validate inputs
      if (!twitterHandle || twitterHandle.trim() === "") {
        throw new Error("Twitter handle is required");
      }

      if (!asCreator && !asTipper) {
        throw new Error("Must register as either creator or tipper");
      }

      setCurrentStep("Sending transaction...");
      
      const result = await writeContract({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "registerUser",
        args: [twitterHandle.trim(), asCreator, asTipper],
        gas: BigInt(500000),
      });

      console.log("Registration transaction hash:", result);
      setCurrentStep("Transaction sent, waiting for confirmation...");
      return result;
      
    } catch (err: any) {
      console.error("Error registering user:", err);
      setCurrentStep("");
      registrationInProgress.current = false;
      
      // Better error messages
      let errorMessage = "Registration failed";
      
      if (err.message?.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas fees";
      } else if (err.message?.includes("already registered")) {
        errorMessage = "User is already registered";
      } else if (err.message?.includes("Twitter handle already taken")) {
        errorMessage = "Twitter handle is already taken";
      } else if (err.message?.includes("execution reverted")) {
        errorMessage = "Contract execution failed - check if handle is already taken";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const authorizeBot = async (botOperator: string) => {
    // Prevent multiple simultaneous bot auth attempts
    if (botAuthInProgress.current) {
      console.log("Bot authorization already in progress, skipping...");
      return;
    }

    try {
      botAuthInProgress.current = true;
      setIsLoading(true);
      setBotAuthComplete(false);
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
        gas: BigInt(100000),
      });

      setCurrentStep("Bot authorization submitted...");
      return result;
      
    } catch (err: any) {
      console.error("Error authorizing bot:", err);
      setCurrentStep("");
      botAuthInProgress.current = false;
      throw new Error(err.message || "Bot authorization failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash) {
      console.log("Transaction confirmed:", hash);
      
      if (registrationInProgress.current) {
        console.log("Registration completed successfully");
        setRegistrationComplete(true);
        registrationInProgress.current = false;
        setCurrentStep("Registration completed!");
        
        // Clear the step after a delay
        setTimeout(() => setCurrentStep(""), 2000);
      }
      
      if (botAuthInProgress.current) {
        console.log("Bot authorization completed successfully");
        setBotAuthComplete(true);
        botAuthInProgress.current = false;
        setCurrentStep("Bot authorization completed!");
        
        // Clear the step after a delay
        setTimeout(() => setCurrentStep(""), 2000);
      }
    }
  }, [isSuccess, hash]);

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      console.error("Transaction error:", error);
      registrationInProgress.current = false;
      botAuthInProgress.current = false;
      setCurrentStep("");
    }
  }, [error]);

  return {
    registerUser,
    authorizeBot,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess: registrationComplete || botAuthComplete,
    error,
    hash,
    currentStep,
    isPending,
    isConfirming,
    registrationComplete,
    botAuthComplete,
    resetStates
  };
}

// Hook to get user profile
export function useUserProfile(userAddress?: string) {
  const [lastFetchedAddress, setLastFetchedAddress] = useState<string>();
  
  // Only fetch when address changes to prevent infinite loops
  const shouldFetch = userAddress && userAddress !== lastFetchedAddress;
  
  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "getUserProfile",
    args: shouldFetch ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(shouldFetch),
      staleTime: 30000, // Cache for 30 seconds
      refetchOnWindowFocus: false, // Prevent excessive refetching
    }
  })

  const { data: balance, isLoading: balanceLoading, error: balanceError } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "getBalance",
    args: shouldFetch
      ? [userAddress as `0x${string}`, "0x0000000000000000000000000000000000000000" as `0x${string}`]
      : undefined,
    query: {
      enabled: Boolean(shouldFetch),
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  })

  const { data: isRegistered, isLoading: registeredLoading, error: registeredError, refetch: refetchRegistered } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "isRegisteredUser",
    args: shouldFetch ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(shouldFetch),
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  })

  // Update last fetched address when we actually fetch
  useEffect(() => {
    if (shouldFetch) {
      setLastFetchedAddress(userAddress);
    }
  }, [shouldFetch, userAddress]);

  // Method to manually refetch data
  const refetchUserData = () => {
    refetchProfile();
    refetchRegistered();
  };

  // Debug logging (less frequent)
  useEffect(() => {
    if (userAddress && profile !== undefined) {
      console.log("=== useUserProfile Update ===");
      console.log("userAddress:", userAddress);
      console.log("isRegistered:", Boolean(isRegistered));
      console.log("profile exists:", !!profile);
      console.log("=============================");
    }
  }, [userAddress, profile, isRegistered]);

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
    isLoading: profileLoading || registeredLoading,
    errors: { profileError, balanceError, registeredError },
    refetchUserData
  }
}

// Hook to get creator by Twitter handle (for bot usage)
export function useCreatorByTwitter(twitterHandle?: string) {
  const { data: creatorData } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "getCreatorByTwitter",
    args: twitterHandle ? [twitterHandle] : undefined,
    query: {
      enabled: Boolean(twitterHandle),
      staleTime: 60000, // Cache for 1 minute
      refetchOnWindowFocus: false,
    }
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