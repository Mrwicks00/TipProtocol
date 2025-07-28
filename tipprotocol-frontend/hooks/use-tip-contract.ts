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
  "0xc727E73CCD6B6Dd1eB524d6e24d7CbC9FE15CdEc"; 
// Bot's authorized operator address (from your bot/config.ts)
// This should be the public address of the wallet your bot uses to send transactions
export const BOT_OPERATOR_ADDRESS: `0x${string}` =
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with your bot's wallet address

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

  const { data: usdtProtocolBalance, refetch: refetchUsdtProtocolBalance } = useReadContract({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    functionName: "getBalance",
    args: userAddress ? [userAddress, USDT_CONTRACT_ADDRESS] : undefined,
    query: { enabled: isConnected && !!userAddress },
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
    if (!usdtDecimals) {
      toast.error("USDT decimals not loaded yet. Please wait or refresh.");
      return;
    }
    const amountInWei = parseUnits(amountUsdt, usdtDecimals);

    await handleTransaction(
      () => writeTipProtocol({
        address: TIP_PROTOCOL_ADDRESS,
        abi: TIP_PROTOCOL_ABI,
        functionName: "tipCreator",
        args: [creatorTwitterHandle, USDT_CONTRACT_ADDRESS, amountInWei, message],
      }),
      `Tipping ${amountUsdt} USDT to @${creatorTwitterHandle} initiated!`
    );
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

  // --- Event Listeners (for real-time updates) ---
  const [recentTips, setRecentTips] = useState<TipEvent[]>([]);
  const [recentDeposits, setRecentDeposits] = useState<DepositWithdrawalEvent[]>([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState<DepositWithdrawalEvent[]>([]);

  useWatchContractEvent({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    eventName: "BalanceDeposited",
    chainId: MORPH_HOLESKY_CHAIN_ID, // Specify the exact chain
    // Enable only when user is connected and has address
    query: { 
      enabled: isConnected && !!userAddress 
    },
    onLogs: (logs) => {
      console.log("BalanceDeposited event received:", logs.length, "events"); // Debug log
      
      const newDeposits = logs
        .map((log) => {
          console.log("Raw log:", log); // Debug raw log
          
          const args = log.args as {
            user: `0x${string}`;
            token: `0x${string}`;
            amount: bigint;
          };
          
          console.log("Processing deposit event args:", args); // Debug log
          console.log("Comparing addresses:", {
            eventUser: args?.user,
            currentUser: userAddress,
            eventToken: args?.token,
            expectedToken: USDT_CONTRACT_ADDRESS,
            userMatch: args?.user?.toLowerCase() === userAddress?.toLowerCase(),
            tokenMatch: args?.token?.toLowerCase() === USDT_CONTRACT_ADDRESS?.toLowerCase()
          });
          
          // Use case-insensitive comparison for addresses
          if (!args || 
              args.user?.toLowerCase() !== userAddress?.toLowerCase() || 
              args.token?.toLowerCase() !== USDT_CONTRACT_ADDRESS?.toLowerCase()) {
            console.log("Deposit event filtered out");
            return null;
          }
  
          return {
            type: "deposit" as const,
            amount: formatUnits(args.amount, usdtDecimals || 6),
            token: "USDT",
            hash: log.transactionHash!,
            timestamp: new Date().toISOString(),
          };
        })
        .filter((deposit): deposit is DepositWithdrawalEvent => deposit !== null);
        
      console.log("New deposits processed:", newDeposits.length);
      if (newDeposits.length > 0) {
        setRecentDeposits((prev) => [...newDeposits, ...prev].slice(0, 3));
        refetchUsdtProtocolBalance();
      }
    },
    onError: (error) => {
      console.error("BalanceDeposited event error:", error);
    }
  });
  
  // 2. Fix the BalanceWithdrawn event listener
  useWatchContractEvent({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    eventName: "BalanceWithdrawn",
    chainId: MORPH_HOLESKY_CHAIN_ID, // Specify the exact chain
    query: { 
      enabled: isConnected && !!userAddress 
    },
    onLogs: (logs) => {
      console.log("BalanceWithdrawn event received:", logs.length, "events"); // Debug log
      
      const newWithdrawals = logs
        .map((log) => {
          console.log("Raw withdrawal log:", log); // Debug raw log
          
          const args = log.args as {
            user: `0x${string}`;
            token: `0x${string}`;
            amount: bigint;
          };
          
          console.log("Processing withdrawal event args:", args);
          console.log("Comparing addresses:", {
            eventUser: args?.user,
            currentUser: userAddress,
            eventToken: args?.token,
            expectedToken: USDT_CONTRACT_ADDRESS,
            userMatch: args?.user?.toLowerCase() === userAddress?.toLowerCase(),
            tokenMatch: args?.token?.toLowerCase() === USDT_CONTRACT_ADDRESS?.toLowerCase()
          });
          
          // Use case-insensitive comparison for addresses
          if (!args || 
              args.user?.toLowerCase() !== userAddress?.toLowerCase() || 
              args.token?.toLowerCase() !== USDT_CONTRACT_ADDRESS?.toLowerCase()) {
            console.log("Withdrawal event filtered out");
            return null;
          }
  
          return {
            type: "withdrawal" as const,
            amount: formatUnits(args.amount, usdtDecimals || 6),
            token: "USDT",
            hash: log.transactionHash!,
            timestamp: new Date().toISOString(),
          };
        })
        .filter((withdrawal): withdrawal is DepositWithdrawalEvent => withdrawal !== null);
        
      console.log("New withdrawals processed:", newWithdrawals.length);
      if (newWithdrawals.length > 0) {
        setRecentWithdrawals((prev) => [...newWithdrawals, ...prev].slice(0, 3));
        refetchUsdtProtocolBalance();
      }
    },
    onError: (error) => {
      console.error("BalanceWithdrawn event error:", error);
    }
  });
  
  // 3. Fix the TipSent event listener
  useWatchContractEvent({
    address: TIP_PROTOCOL_ADDRESS,
    abi: TIP_PROTOCOL_ABI,
    eventName: "TipSent",
    chainId: MORPH_HOLESKY_CHAIN_ID, // Specify the exact chain
    query: { 
      enabled: isConnected && !!userAddress 
    },
    onLogs: (logs) => {
      console.log("TipSent event received:", logs.length, "events"); // Debug log
      
      const newTips = logs
        .map((log) => {
          console.log("Raw tip log:", log); // Debug raw log
          
          const args = log.args as {
            tipper: `0x${string}`;
            creator: `0x${string}`;
            token: `0x${string}`;
            amount: bigint;
            message: string;
            creatorTwitterHandle: string;
          };
          
          console.log("Processing tip event args:", args);
          
          if (!args || args.token?.toLowerCase() !== USDT_CONTRACT_ADDRESS?.toLowerCase()) {
            console.log("Tip event filtered out - wrong token");
            return null;
          }
  
          const { tipper, creator, amount, message, creatorTwitterHandle } = args;
          const timestamp = new Date().toISOString();
  
          // Check if user is the tipper
          if (tipper?.toLowerCase() === userAddress?.toLowerCase()) {
            return {
              type: "sent" as const,
              user: `@${creatorTwitterHandle}`,
              amount: formatUnits(amount, usdtDecimals || 6),
              token: "USDT",
              message,
              hash: log.transactionHash!,
              timestamp,
            };
          } 
          // Check if user is the creator receiving the tip
          else if (creator?.toLowerCase() === userAddress?.toLowerCase()) {
            return {
              type: "received" as const,
              user: `(Tipper: ${tipper.slice(0, 6)}...${tipper.slice(-4)})`,
              amount: formatUnits(amount, usdtDecimals || 6),
              token: "USDT",
              message,
              hash: log.transactionHash!,
              timestamp,
            };
          }
          
          console.log("Tip event not for current user");
          return null;
        })
        .filter((tip): tip is TipEvent => tip !== null);
        
      console.log("New tips processed:", newTips.length);
      if (newTips.length > 0) {
        setRecentTips((prev) => [...newTips, ...prev].slice(0, 5));
        refetchAllData();
      }
    },
    onError: (error) => {
      console.error("TipSent event error:", error);
    }
  });
  

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