"use client"

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { parseEther, formatEther } from "viem"
import { useState } from "react"
import { TIP_PROTOCOL_ADDRESS, TIP_PROTOCOL_ABI } from "@/lib/contracts/tip-protocol"

export function useTipProtocol() {
  const [isLoading, setIsLoading] = useState(false)

  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Register user function - calls the main registerUser function
  const registerUser = async (twitterHandle: string, asCreator: boolean, asTipper: boolean) => {
    try {
      setIsLoading(true)
      await writeContract({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "registerUser",
        args: [twitterHandle, asCreator, asTipper],
      })
    } catch (err) {
      console.error("Error registering user:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Register as creator only (backward compatibility)
  const registerCreator = async (twitterHandle: string) => {
    try {
      setIsLoading(true)
      await writeContract({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "registerCreator",
        args: [twitterHandle],
      })
    } catch (err) {
      console.error("Error registering creator:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Register as tipper only
  const registerTipper = async (twitterHandle: string) => {
    try {
      setIsLoading(true)
      await writeContract({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "registerTipper",
        args: [twitterHandle],
      })
    } catch (err) {
      console.error("Error registering tipper:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Authorize bot for gasless transactions
  const authorizeBot = async (botOperator: string) => {
    try {
      setIsLoading(true)
      await writeContract({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "authorizeBot",
        args: [botOperator as `0x${string}`],
      })
    } catch (err) {
      console.error("Error authorizing bot:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Deposit ETH function
  const depositETH = async (amount: string) => {
    try {
      setIsLoading(true)
      await writeContract({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "depositETH",
        value: parseEther(amount),
      })
    } catch (err) {
      console.error("Error depositing ETH:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Send tip function (for direct tipping)
  const sendTip = async (creatorTwitterHandle: string, amount: string, message = "") => {
    try {
      setIsLoading(true)
      await writeContract({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "tipCreator",
        args: [creatorTwitterHandle, "0x0000000000000000000000000000000000000000", parseEther(amount), message], // 0x0 for ETH
      })
    } catch (err) {
      console.error("Error sending tip:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    registerUser,
    registerCreator,
    registerTipper,
    authorizeBot,
    depositETH,
    sendTip,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

// Hook to get user profile
export function useUserProfile(userAddress?: string) {
  const { data: profile } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "getUserProfile",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  })

  const { data: balance } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "getBalance",
    args: userAddress
      ? [userAddress as `0x${string}`, "0x0000000000000000000000000000000000000000" as `0x${string}`]
      : undefined, // ETH balance
  })

  const { data: isRegistered } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "isRegisteredUser",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  })

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
