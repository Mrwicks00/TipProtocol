"use client"

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { parseEther, formatEther } from "viem"
import { useState } from "react"

// TipProtocol contract ABI (simplified)
const TIP_CONTRACT_ABI = [
  {
    name: "sendTip",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "twitterHandle", type: "string" },
      { name: "message", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "getTotalTips",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getUserTips",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "amount", type: "uint256" },
          { name: "recipient", type: "address" },
          { name: "twitterHandle", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
  },
] as const

const TIP_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890" // Replace with actual contract

export function useTipContract() {
  const [isLoading, setIsLoading] = useState(false)

  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const sendTip = async (recipientAddress: string, twitterHandle: string, amount: string, message = "") => {
    try {
      setIsLoading(true)
      await writeContract({
        address: TIP_CONTRACT_ADDRESS,
        abi: TIP_CONTRACT_ABI,
        functionName: "sendTip",
        args: [recipientAddress as `0x${string}`, twitterHandle, message],
        value: parseEther(amount),
      })
    } catch (err) {
      console.error("Error sending tip:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendTip,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

export function useUserTips(userAddress?: string) {
  const { data: totalTips } = useReadContract({
    address: TIP_CONTRACT_ADDRESS,
    abi: TIP_CONTRACT_ABI,
    functionName: "getTotalTips",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  })

  const { data: userTips } = useReadContract({
    address: TIP_CONTRACT_ADDRESS,
    abi: TIP_CONTRACT_ABI,
    functionName: "getUserTips",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  })

  return {
    totalTips: totalTips ? formatEther(totalTips) : "0",
    userTips: userTips || [],
  }
}
