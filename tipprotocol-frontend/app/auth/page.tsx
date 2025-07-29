"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  Twitter,
  Shield,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  Bot,
  AlertTriangle,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { TwitterAuthComponent } from "@/components/twitter/twitter-auth";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { useTipProtocol, useUserProfile } from "@/hooks/use-tip-protocol";
import { morphHolesky } from "@/lib/chains/morph-holesky";
import type { TwitterUser } from "@/lib/twitter/types";

export default function AuthPage() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [twitterUser, setTwitterUser] = useState<TwitterUser | null>(null);
  const [registrationMethod, setRegistrationMethod] = useState<
    "twitter" | "manual"
  >("twitter");
  const [manualHandle, setManualHandle] = useState("");

  // Form validation states
  const [handleError, setHandleError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const botAuthAttempted = useRef(false);
  const registrationAttempted = useRef(false);
  const redirectAttempted = useRef(false);

  const { address, isConnected, chain } = useAccount();
  const {
    registerUser,
    authorizeBot,
    isLoading,
    isSuccess,
    error,
    isPending,
    isConfirming,
    currentStep,
    registrationComplete,
    botAuthComplete,
  } = useTipProtocol();
  const { isRegistered, profile } = useUserProfile(address);

  useEffect(() => {
    console.log("=== AuthPage Redirect Debug ===");
    console.log("isConnected:", isConnected);
    console.log("isRegistered:", isRegistered);
    console.log("profile:", profile);
    console.log("address:", address);
    console.log("registrationComplete:", registrationComplete);
    console.log("redirectAttempted:", redirectAttempted.current);

    // ONLY redirect if registration is complete AND not currently processing AND not already attempted
    if (
      isConnected &&
      isRegistered &&
      profile &&
      !isLoading &&
      !isPending &&
      !isConfirming &&
      !redirectAttempted.current &&
      registrationComplete // Use the new state from hook
    ) {
      console.log("User registration complete, redirecting to dashboard");
      redirectAttempted.current = true;

      // Use router instead of window.location for better UX
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    }
  }, [
    isConnected,
    isRegistered,
    profile,
    address,
    isLoading,
    isPending,
    isConfirming,
    registrationComplete,
  ]);

  // Bot operator address
  const BOT_OPERATOR_ADDRESS = "0x40817a62f10068332704cDC3b827EFE588AA8f0D";

  // Wait for wallet connection before proceeding
  useEffect(() => {
    if (isConnected && step === 1) {
      const timer = setTimeout(() => {
        setStep(2);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, step]);

  // Check if user is already registered and redirect
  useEffect(() => {
    if (isRegistered && profile) {
      window.location.href = "/dashboard";
    }
  }, [isRegistered, profile]);

  //BOT AUTHORIZATION

  useEffect(() => {
    const handleBotAuthorization = async () => {
      if (
        registrationComplete && // Use registrationComplete instead of isSuccess
        (userType === "tipper" || userType === "both") &&
        !error &&
        !botAuthAttempted.current &&
        !botAuthComplete // Check if bot auth is not already complete
      ) {
        console.log("Registration successful, now authorizing bot...");
        botAuthAttempted.current = true;

        try {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
          await authorizeBot(BOT_OPERATOR_ADDRESS);
          console.log("Bot authorization completed");
        } catch (err) {
          console.error("Bot authorization failed:", err);
          // Don't fail the whole registration for bot auth failure
          alert(
            "Registration successful, but bot authorization failed. You can authorize it later from dashboard."
          );
        }
      }
    };

    handleBotAuthorization();
  }, [registrationComplete, userType, authorizeBot, error, botAuthComplete]);

  // Enhanced Twitter handle validation with security checks
  const validateTwitterHandle = (
    handle: string
  ): { isValid: boolean; error: string; warning?: string } => {
    const cleanHandle = handle.replace("@", "").trim();

    if (!cleanHandle) {
      return { isValid: false, error: "Twitter handle is required" };
    }

    if (cleanHandle.length < 1 || cleanHandle.length > 15) {
      return {
        isValid: false,
        error: "Twitter handle must be 1-15 characters",
      };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanHandle)) {
      return {
        isValid: false,
        error:
          "Twitter handle can only contain letters, numbers, and underscores",
      };
    }

    if (/^[0-9]+$/.test(cleanHandle)) {
      return { isValid: false, error: "Twitter handle cannot be all numbers" };
    }

    // Check for suspicious patterns
    const numberCount = (cleanHandle.match(/[0-9]/g) || []).length;
    if (numberCount > cleanHandle.length * 0.6) {
      return {
        isValid: true,
        error: "",
        warning:
          "Handle contains many numbers - make sure this is your real username",
      };
    }

    // Check for bot-like patterns
    const suspiciousWords = ["bot", "fake", "spam", "test123", "user123"];
    const hasSuspiciousWord = suspiciousWords.some((word) =>
      cleanHandle.toLowerCase().includes(word)
    );
    if (hasSuspiciousWord) {
      return {
        isValid: true,
        error: "",
        warning:
          "Handle contains suspicious keywords - ensure this is your real account",
      };
    }

    return { isValid: true, error: "" };
  };

  // Real handle verification (optional enhancement)
  const verifyHandleExists = async (
    handle: string
  ): Promise<{ exists: boolean; verified: boolean; message: string }> => {
    try {
      const response = await fetch("/api/verify-twitter-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          exists: data.available && data.verified,
          verified: data.verified,
          message: data.message,
        };
      }
    } catch (error) {
      console.error("Handle verification failed:", error);
    }

    return {
      exists: false,
      verified: false,
      message: "Could not verify handle existence",
    };
  };

  // Handle manual input validation with enhanced security
  const handleManualInputChange = async (value: string) => {
    setManualHandle(value);
    setHandleError("");
    setVerificationResult(null);

    if (value.trim()) {
      const validation = validateTwitterHandle(value);
      if (!validation.isValid) {
        setHandleError(validation.error);
        return;
      }

      if (validation.warning) {
        setHandleError(validation.warning);
      }

      // Optional: Verify handle exists (uncomment to enable)
      // setIsValidating(true);
      // try {
      //   const verification = await verifyHandleExists(value);
      //   setVerificationResult(verification);
      //   if (!verification.exists) {
      //     setHandleError("This Twitter handle does not exist");
      //   }
      // } catch (error) {
      //   console.error('Verification failed:', error);
      // } finally {
      //   setIsValidating(false);
      // }
    }
  };

  // Simulate Twitter handle availability check (you'd want to implement real checking)
  const checkHandleAvailability = async (handle: string) => {
    setIsValidating(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, let's say handles with "test" are unavailable
    const isAvailable = !handle.toLowerCase().includes("test");

    setIsValidating(false);
    return isAvailable;
  };

  const handleTwitterSuccess = (user: TwitterUser) => {
    setTwitterUser(user);
    setTwitterHandle(user.username);
    setTimeout(() => setStep(4), 1000);
  };

  const handleManualSubmit = async () => {
    const validation = validateTwitterHandle(manualHandle);
    if (!validation.isValid) {
      setHandleError(validation.error);
      return;
    }

    // Optional: Check if handle is available
    // const isAvailable = await checkHandleAvailability(manualHandle);
    // if (!isAvailable) {
    //   setHandleError("This Twitter handle appears to be taken or invalid");
    //   return;
    // }

    setTwitterHandle(manualHandle.replace("@", ""));
    setStep(4);
  };

  const handleRegisterUser = async () => {
    // Prevent multiple registration attempts
    if (registrationAttempted.current || isLoading || isPending) {
      console.log("Registration already in progress or attempted");
      return;
    }

    const finalHandle =
      registrationMethod === "twitter"
        ? twitterHandle
        : manualHandle.replace("@", "");

    console.log("=== Registration Debug ===");
    console.log("finalHandle:", finalHandle);
    console.log("userType:", userType);
    console.log("address:", address);
    console.log("isConnected:", isConnected);
    console.log("isWrongNetwork:", isWrongNetwork);
    console.log("========================");

    if (!finalHandle || !userType) {
      console.error("Missing required fields:", { finalHandle, userType });
      alert("Please fill in all required fields");
      return;
    }

    if (!address || !isConnected) {
      console.error("Wallet not connected");
      alert("Please connect your wallet first");
      return;
    }

    if (isWrongNetwork) {
      console.error("Wrong network - please switch to Morph Holesky");
      alert("Please switch to Morph Holesky network");
      return;
    }

    registrationAttempted.current = true; // Mark as attempted

    try {
      const asCreator = userType === "creator" || userType === "both";
      const asTipper = userType === "tipper" || userType === "both";

      console.log("Registration params:", {
        twitterHandle: finalHandle,
        asCreator,
        asTipper,
        address,
        chainId: chain?.id,
        method: registrationMethod,
      });

      console.log("Starting user registration...");
      const registerResult = await registerUser(
        finalHandle,
        asCreator,
        asTipper
      );
      console.log("Register result:", registerResult);
    } catch (err: any) {
      console.error("Registration failed:", err);
      registrationAttempted.current = false; // Reset on error
      alert(`Registration failed: ${err.message || "Unknown error"}`);
    }
  };

  const isWrongNetwork = isConnected && chain?.id !== morphHolesky.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 to-background flex items-center justify-center p-4">
      {/* Simple header without full navbar */}
      <div className="absolute top-4 left-4">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center neon-glow">
            <span className="text-white font-bold">T</span>
          </div>
          <span className="text-xl font-bold text-foreground">TipProtocol</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Get Started
          </h1>
          <p className="text-muted-foreground">
            Connect your wallet and set up your profile on Morph Holesky
          </p>
        </div>

        <Tabs value={step.toString()} className="w-full">
          {/* Step 1: Wallet Connection */}
          <TabsContent value="1">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Wallet className="w-5 h-5 text-green-600" />
                  Connect Your Wallet
                </CardTitle>
                <CardDescription>
                  Connect to Morph Holesky testnet to get started with
                  TipProtocol
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <ConnectWalletButton className="w-full h-14 bg-green-500 hover:bg-green-600 neon-glow" />
                </div>

                {isConnected && !isWrongNetwork && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">
                      Wallet connected! Proceeding to next step...
                    </span>
                  </div>
                )}

                {isWrongNetwork && (
                  <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                        Wrong Network
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Please switch to Morph Holesky using the network
                        switcher in your wallet or the connect button above.
                      </p>
                    </div>
                  </div>
                )}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Morph Holesky Testnet
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        TipProtocol runs on Morph Holesky testnet. You'll need
                        testnet ETH for gas fees only. All tipping is done with
                        USDT tokens.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: User Type Selection */}
          <TabsContent value="2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Choose Your Role
                </CardTitle>
                <CardDescription>
                  Select how you plan to use TipProtocol
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    type: "creator",
                    title: "Creator",
                    description: "I want to receive tips from supporters",
                    icon: "🎨",
                  },
                  {
                    type: "tipper",
                    title: "Tipper",
                    description: "I want to tip my favorite creators",
                    icon: "💝",
                  },
                  {
                    type: "both",
                    title: "Both",
                    description: "I want to tip and receive tips",
                    icon: "🔄",
                  },
                ].map((option) => (
                  <Button
                    key={option.type}
                    variant={userType === option.type ? "default" : "outline"}
                    className={`w-full justify-start h-16 ${
                      userType === option.type
                        ? "bg-green-500 hover:bg-green-600 text-white neon-glow"
                        : "hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 border-border"
                    }`}
                    onClick={() => setUserType(option.type)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="text-left">
                        <div className="font-medium">{option.title}</div>
                        <div className="text-sm opacity-80">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}

                {userType && (
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 neon-glow"
                    onClick={() => setStep(3)}
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Twitter Integration - Now with Tabs */}
          <TabsContent value="3">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Twitter className="w-5 h-5 text-blue-500" />
                  Twitter Integration
                </CardTitle>
                <CardDescription>
                  Connect your Twitter account or enter your handle manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs
                  value={registrationMethod}
                  onValueChange={(value) =>
                    setRegistrationMethod(value as "twitter" | "manual")
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="twitter"
                      className="flex items-center gap-2"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter Auth
                    </TabsTrigger>
                    <TabsTrigger
                      value="manual"
                      className="flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Manual Entry
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                        Working
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="twitter" className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Twitter className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">
                        Connect Your Twitter Account
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        We'll use your Twitter profile to set up your
                        TipProtocol account and enable bot integration.
                      </p>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                            Currently Under Development
                          </p>
                          <p className="text-orange-700 dark:text-orange-300">
                            Twitter authentication is currently being debugged.
                            Please use manual entry for a reliable registration
                            experience.
                          </p>
                        </div>
                      </div>
                    </div>

                    <TwitterAuthComponent
                      onSuccess={handleTwitterSuccess}
                      onError={(error) => {
                        console.error("Twitter auth error:", error);
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">
                        Enter Your Twitter Handle
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Manually enter your Twitter username to continue with
                        registration.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter-handle">Twitter Handle</Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          @
                        </div>
                        <Input
                          id="twitter-handle"
                          type="text"
                          placeholder="yourusername"
                          value={manualHandle}
                          onChange={(e) =>
                            handleManualInputChange(e.target.value)
                          }
                          className={`pl-8 ${
                            handleError ? "border-red-500" : ""
                          }`}
                          disabled={isValidating}
                        />
                        {isValidating && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          </div>
                        )}
                      </div>
                      {handleError && (
                        <div
                          className={`flex items-center gap-2 text-sm ${
                            handleError.includes("make sure") ||
                            handleError.includes("ensure")
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {handleError.includes("make sure") ||
                          handleError.includes("ensure") ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {handleError}
                        </div>
                      )}
                      {manualHandle && !handleError && !isValidating && (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Valid Twitter handle format
                          {verificationResult?.verified && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Verified on Twitter
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                            Security Notice
                          </p>
                          <div className="text-amber-700 dark:text-amber-300 space-y-2">
                            <p>
                              Please enter your actual Twitter username. Using
                              someone else's handle may cause:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>Bot commands not working properly</li>
                              <li>Tips being sent to the wrong person</li>
                              <li>Account verification issues</li>
                              <li>Potential account suspension</li>
                            </ul>
                            <p className="text-xs font-medium">
                              Tip: You can find your username in your Twitter
                              profile URL: twitter.com/YOUR_USERNAME
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleManualSubmit}
                      disabled={!manualHandle || !!handleError || isValidating}
                      className="w-full bg-green-500 hover:bg-green-600 neon-glow"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          Continue with @{manualHandle || "username"}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        What we'll use this for:
                      </p>
                      <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Link your wallet to your Twitter profile</li>
                        <li>• Enable @TipBot mentions for sending tips</li>
                        <li>• Display your profile in the creator directory</li>
                        <li>• Process tip notifications and confirmations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Complete Registration */}
          <TabsContent value="4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Complete Registration
                </CardTitle>
                <CardDescription>
                  Register your account on the TipProtocol smart contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Show Twitter Profile Preview */}
                {registrationMethod === "twitter" && twitterUser ? (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
                        <img
                          src={
                            twitterUser.profile_image_url || "/placeholder.svg"
                          }
                          alt={twitterUser.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {twitterUser.name}
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          @{twitterUser.username}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      This profile will be used throughout TipProtocol
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          Manual Registration
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          @
                          {registrationMethod === "manual"
                            ? manualHandle
                            : twitterHandle}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Registering with manually entered Twitter handle
                    </p>
                  </div>
                )}

                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-900 dark:text-green-100">
                      Registration Summary
                    </span>
                  </div>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>
                      • Twitter: @
                      {registrationMethod === "twitter"
                        ? twitterHandle
                        : manualHandle}
                    </li>
                    <li>
                      • Role:{" "}
                      {userType === "both" ? "Creator & Tipper" : userType}
                    </li>
                    <li>• Network: Morph Holesky</li>
                    <li>• Wallet: {address?.slice(0, 10)}...</li>
                    <li>
                      • Method:{" "}
                      {registrationMethod === "twitter"
                        ? "Twitter OAuth"
                        : "Manual Entry"}
                    </li>
                    {(userType === "tipper" || userType === "both") && (
                      <li>
                        • Bot Integration: Will be enabled after registration
                      </li>
                    )}
                  </ul>
                </div>

                {(userType === "tipper" || userType === "both") && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        Twitter Bot Integration
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      After registration, you can tip creators by mentioning
                      @TipBot in Twitter replies:
                      <br />
                      <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded mt-1 inline-block">
                        @TipBot tip @creator $5 Great content!
                      </code>
                      <br />
                      <span className="text-xs mt-1 inline-block">
                        Bot will be automatically authorized with USDT support
                        after registration.
                      </span>
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-700 dark:text-red-300">
                      {error.message ||
                        "Registration failed. Please try again."}
                    </span>
                  </div>
                )}

                {registrationComplete ? ( 
                  <Link href="/dashboard">
                    <Button className="w-full bg-green-500 hover:bg-green-600 neon-glow">
                      Registration Complete! Go to Dashboard
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleRegisterUser}
                    disabled={
                      isLoading ||
                      isPending ||
                      isConfirming ||
                      registrationAttempted.current || // ADD THIS CHECK
                      (!twitterHandle && !manualHandle) ||
                      !userType
                    }
                    className="w-full bg-green-500 hover:bg-green-600 neon-glow"
                  >
                    {isLoading || isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {currentStep || "Preparing transaction..."}
                      </>
                    ) : isConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Confirming registration...
                      </>
                    ) : (
                      <>
                        Register & Complete Setup
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= step
                    ? "bg-green-500 neon-glow"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
