// hooks/useTipProtocol.ts
"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
  useWatchContractEvent,
} from "wagmi";
import { parseEther, formatEther, parseUnits, formatUnits } from "viem";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner"; // Assuming you have a toast notification library like sonner

// --- Configuration ---
// Import TipProtocol contract address and ABI from your existing file
import { TIP_PROTOCOL_ADDRESS, TIP_PROTOCOL_ABI } from "@/lib/contracts/tip-protocol";
const MORPH_HOLESKY_CHAIN_ID = 2810; 

// YOU MUST REPLACE THIS WITH YOUR ACTUAL DEPLOYED USDT CONTRACT ADDRESS ON MORPH HOLESKY
export const USDT_CONTRACT_ADDRESS: `0x${string}` =
  "0xC111f83472454148399F7cB4090B8E2B39fb1541"; 
// Bot's authorized operator address (from your bot/config.ts)
// This should be the public address of the wallet your bot uses to send transactions
export const BOT_OPERATOR_ADDRESS: `0x${string}` =
  "0xa4f7e9da12136de291aF8653395F926DA53496Fe"; // Replace with your bot's wallet address

// --- Custom ERC20 ABI for USDT ---
// Only include the functions we need for interacting with USDT (decimals, approve, allowance)
export const ERC20_ABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Types for better type safety
interface TipEvent {
  type: "sent" | "received";
  user: string;
  amount: string;
  token: string;
  message: string;
  hash: `0x${string}`;
  timestamp: string;
}

interface DepositWithdrawalEvent {
  type: "deposit" | "withdrawal";
  amount: string;
  token: string;
  hash: `0x${string}`;
  timestamp: string;
}

interface UserProfile {
  twitterHandle: string;
  isCreator: boolean;
  isTipper: boolean;
  totalTipsReceived: string;
  tipCountReceived: number;
  totalTipped: string;
  tipsSent: number;
  registeredAt: Date;
}

export function useTipProtocol() {
  const { address: userAddress, isConnected } = useAccount();

  // State for transaction loading/success
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [isTxLoading, setIsTxLoading] = useState(false);
  
  const { isLoading: isConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
      query: { enabled: !!txHash },
    });

  const {
    writeContract: writeTipProtocol,
    isPending: isTipProtocolPending,
    error: tipProtocolError,
  } = useWriteContract();

  const {
    writeContract: writeERC20,
    isPending: isERC20Pending,
    error: erc20Error,
  } = useWriteContract();

  useEffect(() => {
    if (tipProtocolError || erc20Error) {
      console.error("Contract Write Error:", tipProtocolError || erc20Error);
      toast.error(
        `Transaction failed: ${
          (tipProtocolError as any)?.shortMessage || 
          (erc20Error as any)?.shortMessage || 
          (tipProtocolError as any)?.message || 
          (erc20Error as any)?.message ||
          "Unknown error"
        }`
      );
    }
  }, [tipProtocolError, erc20Error]);

  useEffect(() => {
    if (isTxSuccess) {
      toast.success("Transaction confirmed!");
      setTxHash(undefined); // Clear hash to reset for next transaction
    }
  }, [isTxSuccess]);

  // --- Read Functions ---
  const { data: userProfile, refetch: refetchUserProfile } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "getUserProfile",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: isConnected && !!userAddress },
  });

  const { data: isRegistered, refetch: refetchIsRegistered } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "isRegisteredUser",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: isConnected && !!userAddress },
  });

  const { data: usdtProtocolBalance, refetch: refetchUsdtProtocolBalance, error: balanceError } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "getBalance",
    args: userAddress ? [userAddress, USDT_CONTRACT_ADDRESS] : undefined,
    query: { 
      enabled: isConnected && !!userAddress,
      // Add retry logic
      retry: 3,
      retryDelay: 1000,
    },
  });


  const { data: isBotAuthorized, refetch: refetchBotAuthorization } =
    useReadContract({
      address: TIP_PROTOCOL_ADDRESS,
      abi: TIP_PROTOCOL_ABI,
      functionName: "authorizedOperators",
      args: userAddress ? [userAddress, BOT_OPERATOR_ADDRESS] : undefined,
      query: { enabled: isConnected && !!userAddress },
    });

  const { data: userSpendingLimit, refetch: refetchSpendingLimit } =
    useReadContract({
      address: TIP_PROTOCOL_ADDRESS,
      abi: TIP_PROTOCOL_ABI,
      functionName: "spendingLimits",
      args: userAddress ? [userAddress] : undefined,
      query: { enabled: isConnected && !!userAddress },
    });

  const { data: userDailySpent, refetch: refetchDailySpent } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "dailySpent",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: isConnected && !!userAddress },
  });

  const { data: usdtDecimals } = useReadContract({
    address: USDT_CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: { enabled: isConnected },
  });

  const { data: usdtAllowance, refetch: refetchUsdtAllowance } =
    useReadContract({
      address: USDT_CONTRACT_ADDRESS,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: userAddress ? [userAddress, TIP_PROTOCOL_ADDRESS] : undefined,
      query: { enabled: isConnected && !!userAddress },
    });

  const { data: usdtWalletBalance, refetch: refetchUsdtWalletBalance } = useReadContract({
    address: USDT_CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: isConnected && !!userAddress },
  });

  // Consolidate refetch calls for convenience
  const refetchAllData = () => {
    refetchUserProfile();
    refetchIsRegistered();
    refetchUsdtProtocolBalance();
    refetchBotAuthorization();
    refetchSpendingLimit();
    refetchDailySpent();
    refetchUsdtAllowance();
    refetchUsdtWalletBalance();
  };

  // --- Write Functions ---
  const handleTransaction = async (
    writeFunction: () => Promise<`0x${string}`>,
    successMessage: string
  ) => {
    setIsTxLoading(true);
    try {
      const hash = await writeFunction();
      if (hash) {
        setTxHash(hash);
        toast.info("Transaction sent! Waiting for confirmation...");
      }
    } catch (error: any) {
      console.error("Transaction failed:", error);
      toast.error(
        `Transaction failed: ${error.shortMessage || error.message}`
      );
      setTxHash(undefined);
    } finally {
      setIsTxLoading(false);
    }
  };

  // --- User Registration/Role functions ---
  const registerUser = async (
    twitterHandle: string,
    asCreator: boolean,
    asTipper: boolean
  ) => {
    await handleTransaction(
      () => writeTipProtocol({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "registerUser",
        args: [twitterHandle, asCreator, asTipper],
      }),
      "User registration initiated!"
    );
  };

  const becomeCreator = async () => {
    await handleTransaction(
      () => writeTipProtocol({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "becomeCreator",
      }),
      "Becoming a creator initiated!"
    );
  };

  const becomeTipper = async () => {
    await handleTransaction(
      () => writeTipProtocol({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "becomeTipper",
      }),
      "Becoming a tipper initiated!"
    );
  };

  

  // --- Tipping functions ---
  const tipCreator = async (
    creatorTwitterHandle: string,
    amountUsdt: string,
    message: string = ""
  ) => {
    console.group("🚀 STARTING TIP TRANSACTION");
    
    try {
      // 1. Validate inputs first
      const normalizedHandle = creatorTwitterHandle.trim().replace(/^@/, "");
      console.log("📝 Input validation:", {
        originalHandle: creatorTwitterHandle,
        normalizedHandle,
        amount: amountUsdt,
        message: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
        userIsTipper: currentUserProfile?.isTipper,
        userBalance: currentUsdtProtocolBalance
      });
  
      // 2. Pre-flight checks
      if (!userAddress) {
        throw new Error("Wallet not connected");
      }
  
      if (!currentUserProfile?.isTipper) {
        throw new Error("You must be registered as a tipper to send tips");
      }
  
      if (!normalizedHandle || !/^[a-zA-Z0-9_]{1,15}$/.test(normalizedHandle)) {
        throw new Error("Invalid Twitter handle format. Use only letters, numbers, and underscores (max 15 characters)");
      }
  
      const tipAmount = parseFloat(amountUsdt);
      if (isNaN(tipAmount) || tipAmount <= 0) {
        throw new Error("Tip amount must be a positive number");
      }
  
      if (tipAmount < 0.01) {
        throw new Error("Minimum tip amount is 0.01 USDT");
      }
  
      const userBalance = parseFloat(currentUsdtProtocolBalance);
      if (tipAmount > userBalance) {
        throw new Error(`Insufficient balance. You have ${userBalance} USDT, trying to tip ${tipAmount} USDT`);
      }
  
      // 3. Check USDT decimals
      if (!usdtDecimals) {
        console.error("USDT decimals not loaded");
        toast.error("USDT decimals not loaded yet. Please wait or refresh.");
        throw new Error("USDT decimals not loaded");
      }
  
      // 4. Convert amount to Wei
      const amountInWei = parseUnits(amountUsdt, usdtDecimals);
      console.log("💰 Amount conversion:", {
        inputAmount: amountUsdt,
        decimals: usdtDecimals,
        amountInWei: amountInWei.toString()
      });
  
      // 5. Check if recipient exists (optional pre-check)
      // You might want to add a function to check if creator exists before tipping
      console.log("🎯 Attempting to tip creator:", {
        handle: normalizedHandle,
        token: USDT_CONTRACT_ADDRESS,
        amount: amountInWei.toString(),
        message: message
      });
  
      // 6. Execute the transaction
      await handleTransaction(
        () => writeTipProtocol({
          address: TIP_PROTOCOL_ADDRESS,
          abi: TIP_PROTOCOL_ABI,
          functionName: "tipCreator",
          args: [normalizedHandle, USDT_CONTRACT_ADDRESS, amountInWei, message],
        }),
        `Tipping ${amountUsdt} USDT to @${normalizedHandle} initiated!`
      );
  
      console.log("✅ Tip transaction initiated successfully");
  
    } catch (error: any) {
      console.error("❌ Tip transaction failed:", error);
      
      // Enhanced error analysis
      let errorMessage = "Failed to send tip";
      
      if (error.message) {
        if (error.message.includes("Not a registered creator")) {
          errorMessage = `@${normalizedHandle} is not registered as a creator yet`;
        } else if (error.message.includes("Creator not found")) {
          errorMessage = `Creator @${normalizedHandle} not found. Check the spelling.`;
        } else if (error.message.includes("Cannot tip yourself")) {
          errorMessage = "You cannot tip yourself";
        } else if (error.message.includes("Insufficient balance")) {
          errorMessage = "Insufficient USDT balance in Tip Protocol";
        } else if (error.message.includes("Token not supported")) {
          errorMessage = "USDT token not supported (configuration error)";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected in your wallet";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient gas funds to complete transaction";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      throw error; // Re-throw for component to handle
      
    } finally {
      console.groupEnd();
    }
  };

  const debugBalanceIssue = () => {
    console.group("🔍 BALANCE DEBUG INFO");
    console.log("Raw usdtProtocolBalance from contract:", usdtProtocolBalance?.toString());
    console.log("USDT Decimals:", usdtDecimals);
    console.log("Formatted currentUsdtProtocolBalance:", currentUsdtProtocolBalance);
    console.log("User Address:", userAddress);
    console.log("USDT Contract Address:", USDT_CONTRACT_ADDRESS);
    console.log("Tip Protocol Address:", TIP_PROTOCOL_ADDRESS);
    
    // Check if the contract read is working
    console.log("Contract read status:", {
      hasBalance: usdtProtocolBalance !== undefined,
      hasDecimals: usdtDecimals !== undefined,
      balanceIsZero: usdtProtocolBalance === 0n,
      balanceValue: usdtProtocolBalance,
    });
    
    console.groupEnd();
  };
  
  useEffect(() => {
    if (balanceError) {
      console.error("Error reading USDT Protocol balance:", balanceError);
      toast.error("Failed to read USDT balance from contract");
    }
  }, [balanceError]);

  // Also add this helper function to check if a creator exists before tipping
  const checkCreatorExists = async (twitterHandle: string): Promise<boolean> => {
    try {
      const normalizedHandle = twitterHandle.trim().replace(/^@/, "");
      
      // Try to get creator from unified system first
      const { data: creatorData } = await useReadContract({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "getCreatorByTwitter",
        args: [normalizedHandle],
      });
      
      return creatorData && creatorData[0] !== "0x0000000000000000000000000000000000000000";
    } catch (error) {
      console.error("Error checking creator existence:", error);
      return false;
    }
  };

  // --- Balance Management ---
  const depositUSDT = async (amountUsdt: string) => {
    if (!usdtDecimals) {
      toast.error("USDT decimals not loaded yet. Please wait or refresh.");
      return;
    }
    const amountInWei = parseUnits(amountUsdt, usdtDecimals);
  
    if (usdtAllowance === undefined || userAddress === undefined || usdtWalletBalance === undefined) {
      toast.error("Could not check USDT allowance or wallet balance. Please ensure wallet is connected.");
      return;
    }
  
    if (amountInWei > usdtWalletBalance) {
      toast.error(`Insufficient USDT in your wallet. You have ${formatUnits(usdtWalletBalance, usdtDecimals)} USDT.`);
      return;
    }
  
    // Check if allowance is sufficient
    if (usdtAllowance < amountInWei) {
      toast.info("Approving USDT for Tip Protocol contract...");
      
      // First approve the tokens
      await handleTransaction(
        () => writeERC20({
          address: USDT_CONTRACT_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [TIP_PROTOCOL_ADDRESS, amountInWei],
        }),
        "USDT approval successful! Now proceeding with deposit..."
      );
      
      // Wait a moment for the approval to be confirmed, then refresh allowance
      setTimeout(async () => {
        await refetchUsdtAllowance();
        // After allowance is refreshed, automatically proceed with deposit
        toast.info("Approval confirmed! Now depositing...");
        
        await handleTransaction(
          () => writeTipProtocol({
            address: TIP_PROTOCOL_ADDRESS,
            abi: TIP_PROTOCOL_ABI,
            functionName: "depositToken",
            args: [USDT_CONTRACT_ADDRESS, amountInWei],
          }),
          `Deposit of ${amountUsdt} USDT completed!`
        );
      }, 3000); // Wait 3 seconds for approval confirmation
      
      return;
    }
  
    // Allowance is sufficient, proceed with deposit
    await handleTransaction(
      () => writeTipProtocol({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "depositToken",
        args: [USDT_CONTRACT_ADDRESS, amountInWei],
      }),
      `Deposit of ${amountUsdt} USDT initiated!`
    );
  };

  const withdrawUSDT = async (amountUsdt: string) => {
    if (!usdtDecimals) {
      toast.error("USDT decimals not loaded yet. Please wait or refresh.");
      return;
    }
    const amountInWei = parseUnits(amountUsdt, usdtDecimals);

    if (usdtProtocolBalance === undefined) {
      toast.error("Could not retrieve your Tip Protocol USDT balance.");
      return;
    }

    if (amountInWei > usdtProtocolBalance) {
      toast.error(`Insufficient USDT in Tip Protocol. You have ${formatUnits(usdtProtocolBalance, usdtDecimals)} USDT.`);
      return;
    }

    await handleTransaction(
      () => writeTipProtocol({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "withdrawToken",
        args: [USDT_CONTRACT_ADDRESS, amountInWei],
      }),
      `Withdrawal of ${amountUsdt} USDT initiated!`
    );
  };

  // --- Bot Management ---
  const authorizeBot = async (dailyLimitUsd: number) => {
    if (!usdtDecimals) {
      toast.error("USDT decimals not loaded yet. Please wait or refresh.");
      return;
    }
    const limitInWei = parseUnits(dailyLimitUsd.toString(), usdtDecimals);

    await handleTransaction(
      () => writeTipProtocol({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "authorizeOperator",
        args: [BOT_OPERATOR_ADDRESS, limitInWei],
      }),
      `Bot authorization for daily limit $${dailyLimitUsd} initiated!`
    );
  };

  const revokeBot = async () => {
    await handleTransaction(
      () => writeTipProtocol({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "revokeOperator",
        args: [BOT_OPERATOR_ADDRESS],
      }),
      "Bot de-authorization initiated!"
    );
  };

  // Replace the event listeners section in your useTipProtocol hook with this fixed version

// --- Event Listeners (for real-time updates) - FIXED VERSION ---
const [recentTips, setRecentTips] = useState<TipEvent[]>([]);
const [recentDeposits, setRecentDeposits] = useState<DepositWithdrawalEvent[]>([]);
const [recentWithdrawals, setRecentWithdrawals] = useState<DepositWithdrawalEvent[]>([]);

// 1. BalanceDeposited Event Listener
useWatchContractEvent({
  address: TIP_PROTOCOL_ADDRESS,
  abi: TIP_PROTOCOL_ABI,
  eventName: "BalanceDeposited",
  chainId: MORPH_HOLESKY_CHAIN_ID,
  query: { 
    enabled: isConnected && !!userAddress && !!usdtDecimals
  },
  onLogs: (logs) => {
    console.log("🏦 BalanceDeposited events received:", logs.length);
    
    const newDeposits = logs
      .filter((log) => {
        const args = log.args as {
          user?: `0x${string}`;
          token?: `0x${string}`;
          amount?: bigint;
        };
        
        // Check if this deposit is for the current user and USDT token
        const isUserMatch = args?.user?.toLowerCase() === userAddress?.toLowerCase();
        const isTokenMatch = args?.token?.toLowerCase() === USDT_CONTRACT_ADDRESS?.toLowerCase();
        
        console.log("Deposit filter check:", {
          eventUser: args?.user,
          currentUser: userAddress,
          eventToken: args?.token,
          expectedToken: USDT_CONTRACT_ADDRESS,
          userMatch: isUserMatch,
          tokenMatch: isTokenMatch
        });
        
        return isUserMatch && isTokenMatch;
      })
      .map((log) => {
        const args = log.args as {
          user: `0x${string}`;
          token: `0x${string}`;
          amount: bigint;
        };
        
        return {
          type: "deposit" as const,
          amount: formatUnits(args.amount, usdtDecimals!),
          token: "USDT",
          hash: log.transactionHash!,
          timestamp: new Date().toISOString(),
        };
      });
      
    console.log("✅ New deposits processed:", newDeposits.length);
    
    if (newDeposits.length > 0) {
      setRecentDeposits((prev) => {
        const combined = [...newDeposits, ...prev];
        return combined.slice(0, 10); // Keep last 10 deposits
      });
      
      // Refresh balance after deposit
      setTimeout(() => {
        refetchUsdtProtocolBalance();
      }, 1000);
    }
  },
  onError: (error) => {
    console.error("❌ BalanceDeposited event error:", error);
  }
});

// 2. BalanceWithdrawn Event Listener
useWatchContractEvent({
  address: TIP_PROTOCOL_ADDRESS,
  abi: TIP_PROTOCOL_ABI,
  eventName: "BalanceWithdrawn",
  chainId: MORPH_HOLESKY_CHAIN_ID,
  query: { 
    enabled: isConnected && !!userAddress && !!usdtDecimals
  },
  onLogs: (logs) => {
    console.log("💸 BalanceWithdrawn events received:", logs.length);
    
    const newWithdrawals = logs
      .filter((log) => {
        const args = log.args as {
          user?: `0x${string}`;
          token?: `0x${string}`;
          amount?: bigint;
        };
        
        const isUserMatch = args?.user?.toLowerCase() === userAddress?.toLowerCase();
        const isTokenMatch = args?.token?.toLowerCase() === USDT_CONTRACT_ADDRESS?.toLowerCase();
        
        console.log("Withdrawal filter check:", {
          eventUser: args?.user,
          currentUser: userAddress,
          eventToken: args?.token,
          expectedToken: USDT_CONTRACT_ADDRESS,
          userMatch: isUserMatch,
          tokenMatch: isTokenMatch
        });
        
        return isUserMatch && isTokenMatch;
      })
      .map((log) => {
        const args = log.args as {
          user: `0x${string}`;
          token: `0x${string}`;
          amount: bigint;
        };
        
        return {
          type: "withdrawal" as const,
          amount: formatUnits(args.amount, usdtDecimals!),
          token: "USDT",
          hash: log.transactionHash!,
          timestamp: new Date().toISOString(),
        };
      });
      
    console.log("✅ New withdrawals processed:", newWithdrawals.length);
    
    if (newWithdrawals.length > 0) {
      setRecentWithdrawals((prev) => {
        const combined = [...newWithdrawals, ...prev];
        return combined.slice(0, 10); // Keep last 10 withdrawals
      });
      
      // Refresh balance after withdrawal
      setTimeout(() => {
        refetchUsdtProtocolBalance();
      }, 1000);
    }
  },
  onError: (error) => {
    console.error("❌ BalanceWithdrawn event error:", error);
  }
});

// 3. TipSent Event Listener - MOST IMPORTANT FOR YOUR ISSUE
useWatchContractEvent({
  address: TIP_PROTOCOL_ADDRESS,
  abi: TIP_PROTOCOL_ABI,
  eventName: "TipSent",
  chainId: MORPH_HOLESKY_CHAIN_ID,
  query: { 
    enabled: isConnected && !!userAddress && !!usdtDecimals
  },
  onLogs: (logs) => {
    console.log("💰 TipSent events received:", logs.length);
    
    const newTips = logs
      .filter((log) => {
        const args = log.args as {
          tipper?: `0x${string}`;
          creator?: `0x${string}`;
          token?: `0x${string}`;
          amount?: bigint;
          message?: string;
          creatorTwitterHandle?: string;
        };
        
        // Check if this tip involves the current user (either as tipper or receiver)
        const isUserTipper = args?.tipper?.toLowerCase() === userAddress?.toLowerCase();
        const isUserCreator = args?.creator?.toLowerCase() === userAddress?.toLowerCase();
        const isCorrectToken = args?.token?.toLowerCase() === USDT_CONTRACT_ADDRESS?.toLowerCase();
        
        console.log("Tip filter check:", {
          eventTipper: args?.tipper,
          eventCreator: args?.creator,
          currentUser: userAddress,
          eventToken: args?.token,
          expectedToken: USDT_CONTRACT_ADDRESS,
          userIsTipper: isUserTipper,
          userIsCreator: isUserCreator,
          correctToken: isCorrectToken,
          shouldInclude: (isUserTipper || isUserCreator) && isCorrectToken
        });
        
        return (isUserTipper || isUserCreator) && isCorrectToken;
      })
      .map((log) => {
        const args = log.args as {
          tipper: `0x${string}`;
          creator: `0x${string}`;
          token: `0x${string}`;
          amount: bigint;
          message: string;
          creatorTwitterHandle: string;
        };
        
        const { tipper, creator, amount, message, creatorTwitterHandle } = args;
        const timestamp = new Date().toISOString();
        const formattedAmount = formatUnits(amount, usdtDecimals!);
        
        // Determine if user sent or received this tip
        if (tipper?.toLowerCase() === userAddress?.toLowerCase()) {
          // User sent this tip
          console.log("✅ User SENT tip:", {
            to: creatorTwitterHandle,
            amount: formattedAmount,
            message
          });
          
          return {
            type: "sent" as const,
            user: creatorTwitterHandle.startsWith('@') ? creatorTwitterHandle : `@${creatorTwitterHandle}`,
            amount: formattedAmount,
            token: "USDT",
            message: message || "",
            hash: log.transactionHash!,
            timestamp,
          };
        } else if (creator?.toLowerCase() === userAddress?.toLowerCase()) {
          // User received this tip
          console.log("✅ User RECEIVED tip:", {
            from: tipper,
            amount: formattedAmount,
            message
          });
          
          return {
            type: "received" as const,
            user: `${tipper.slice(0, 6)}...${tipper.slice(-4)}`,
            amount: formattedAmount,
            token: "USDT",
            message: message || "",
            hash: log.transactionHash!,
            timestamp,
          };
        }
        
        return null;
      })
      .filter((tip): tip is TipEvent => tip !== null);
      
    console.log("✅ New tips processed:", newTips.length);
    
    if (newTips.length > 0) {
      setRecentTips((prev) => {
        const combined = [...newTips, ...prev];
        console.log("🔄 Updating tips state. Previous:", prev.length, "New:", newTips.length, "Combined:", combined.length);
        return combined.slice(0, 20); // Keep last 20 tips
      });
      
      // Refresh all data after tip
      setTimeout(() => {
        console.log("🔄 Refreshing all data after tip event...");
        refetchAllData();
      }, 2000);
      
      // Show success toast for sent tips
      newTips.forEach(tip => {
        if (tip.type === "sent") {
          toast.success(`Tip sent to ${tip.user}! Amount: $${tip.amount} USDT`);
        } else if (tip.type === "received") {
          toast.success(`Tip received from ${tip.user}! Amount: $${tip.amount} USDT`);
        }
      });
    }
  },
  onError: (error) => {
    console.error("❌ TipSent event error:", error);
  }
});

// Add a debug function to manually check recent tips state
const debugRecentTips = () => {
  console.group("🐛 RECENT TIPS DEBUG");
  console.log("Recent Tips State:", recentTips);
  console.log("Recent Deposits State:", recentDeposits);
  console.log("Recent Withdrawals State:", recentWithdrawals);
  console.log("User Address:", userAddress);
  console.log("USDT Decimals:", usdtDecimals);
  console.log("Is Connected:", isConnected);
  console.groupEnd();
};


  const isLoading = isTxLoading || isConfirming || isTipProtocolPending || isERC20Pending;

  // Derive display data, converting bigints to formatted strings
  const currentUserProfile = useMemo(() => {
    if (userProfile && usdtDecimals !== undefined) {
      const [
        twitterHandle,
        isCreator,
        isTipper,
        totalTipsReceived,
        tipCountReceived,
        totalTipped,
        tipsSent,
        registeredAt,
      ] = userProfile as [string, boolean, boolean, bigint, bigint, bigint, bigint, bigint];
      
      return {
        twitterHandle,
        isCreator,
        isTipper,
        totalTipsReceived: formatUnits(totalTipsReceived, usdtDecimals),
        tipCountReceived: Number(tipCountReceived),
        totalTipped: formatUnits(totalTipped, usdtDecimals),
        tipsSent: Number(tipsSent),
        registeredAt: new Date(Number(registeredAt) * 1000),
      };
    }
    return undefined;
  }, [userProfile, usdtDecimals]);

  const currentUsdtProtocolBalance = 
    usdtProtocolBalance && usdtDecimals !== undefined
      ? formatUnits(usdtProtocolBalance, usdtDecimals)
      : "0";

  const currentUsdtWalletBalance = 
    usdtWalletBalance && usdtDecimals !== undefined
      ? formatUnits(usdtWalletBalance, usdtDecimals)
      : "0";

  const currentSpendingLimit = 
    userSpendingLimit && usdtDecimals !== undefined
      ? formatUnits(userSpendingLimit, usdtDecimals)
      : "0";
      
  const currentDailySpent = 
    userDailySpent && usdtDecimals !== undefined
      ? formatUnits(userDailySpent, usdtDecimals)
      : "0";

      useEffect(() => {
        const autoAuthorizeBotIfNeeded = async () => {
          // Only proceed if we have all the necessary data
          if (!isConnected || !userAddress || !currentUserProfile) {
            console.log("Skipping bot auth check - missing data:", { isConnected, userAddress: !!userAddress, currentUserProfile: !!currentUserProfile });
            return;
          }
      
          console.log("Checking bot authorization status:", {
            isTipper: currentUserProfile.isTipper,
            isBotAuthorized,
            botAddress: BOT_OPERATOR_ADDRESS
          });
      
          // Check if user is a tipper but bot is not authorized
          if (currentUserProfile.isTipper && !isBotAuthorized) {
            console.log("User is tipper but bot not authorized. Auto-authorizing...");
            
            try {
              // Call authorizeBot with a default limit (e.g., $50)
              await authorizeBot(50);
              console.log("Bot auto-authorization initiated");
              
              // Refresh the authorization status after a short delay
              setTimeout(() => {
                refetchBotAuthorization();
              }, 2000);
              
            } catch (error) {
              console.error("Failed to auto-authorize bot:", error);
            }
          } else {
            console.log("No auto-authorization needed:", {
              isTipper: currentUserProfile.isTipper,
              isBotAuthorized
            });
          }
        };
      
        // Only run this check after all data is loaded and user profile exists
        if (currentUserProfile && typeof isBotAuthorized === 'boolean') {
          // Add a small delay to ensure all contract reads are complete
          const timeoutId = setTimeout(autoAuthorizeBotIfNeeded, 1500);
          return () => clearTimeout(timeoutId);
        }
      }, [currentUserProfile, isBotAuthorized, isConnected, userAddress]);

      const checkAndAuthorizeBot = async () => {
        console.log("Manual bot authorization check triggered");
        
        if (!currentUserProfile?.isTipper) {
          toast.error("You must be registered as a tipper to authorize the bot");
          return;
        }
      
        if (isBotAuthorized) {
          toast.info("Bot is already authorized");
          return;
        }
      
        try {
          console.log("Manually authorizing bot...");
          await authorizeBot(50); // $50 daily limit
          
          // Refresh data after authorization
          setTimeout(() => {
            refetchAllData();
          }, 2000);
          
          toast.success("Bot authorization initiated! Please wait for confirmation.");
        } catch (error) {
          console.error("Manual bot authorization failed:", error);
          toast.error("Failed to authorize bot");
        }
      };


      const debugBotAuthorization = async () => {
        console.log("=== BOT AUTHORIZATION DEBUG ===");
        console.log("User Address:", userAddress);
        console.log("Bot Operator Address:", BOT_OPERATOR_ADDRESS);
        console.log("User Profile:", currentUserProfile);
        console.log("Is Bot Authorized:", isBotAuthorized);
        console.log("Current Spending Limit:", currentSpendingLimit);
        console.log("Current Daily Spent:", currentDailySpent);
        
        // Manually refetch the authorization status
        console.log("Manually checking authorization from contract...");
        try {
          await refetchBotAuthorization();
          console.log("Refetch complete");
        } catch (error) {
          console.error("Error refetching authorization:", error);
        }
        
        console.log("=== END DEBUG ===");
      };
      
      // Also add a function to check what the contract actually returns
      const checkContractAuthorizationDirect = async () => {
        if (!userAddress) return;
        
        try {
          // This will directly call the contract to check authorization
          const result = await refetchBotAuthorization();
          console.log("Direct contract authorization check result:", result);
          return result;
        } catch (error) {
          console.error("Error checking contract authorization:", error);
          return false;
        }
      };

  return {
    userAddress,
    isConnected,
    // Profile & Registration
    currentUserProfile,
    checkAndAuthorizeBot,
    isRegistered: isRegistered ?? false,
    registerUser,
    becomeCreator,
    becomeTipper,
    // Tipping
    tipCreator,
    debugBalanceIssue,
    // Balances
    usdtProtocolBalance: currentUsdtProtocolBalance,
    usdtWalletBalance: currentUsdtWalletBalance,
    depositUSDT,
    withdrawUSDT,
    // Bot Management
    isBotAuthorized: Boolean(isBotAuthorized),
    currentSpendingLimit,
    currentDailySpent,
    authorizeBot,
    revokeBot,
    debugBotAuthorization,
    checkContractAuthorizationDirect,
    // Transaction States
    isLoading,
    isTxSuccess,
    txHash,
    // Refetch functions
    refetchAllData,
    refetchUsdtAllowance,
    // Real-time events
    recentTips,
    recentDeposits,
    recentWithdrawals,
  };
}