"use client";

import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { useState, useEffect, useCallback } from "react";
import {
  UniversalAccount,
  CHAIN_ID,
} from "@particle-network/universal-account-sdk";
import type { WalletClient } from "viem";
import { AccountInfo } from "../../../lib/types";

interface TokenBalance {
  associatedTokenAddress: string;
  mint: string;
  amountRaw: string;
  amount: string;
  decimals: number;
  name: string;
  symbol: string;
  logo: string;
}

interface SellTabContentProps {
  tokenAddress: string;
  universalAccount: UniversalAccount | null;
  walletClient: WalletClient | null;
  address: string | null;
  accountInfo: AccountInfo | null;
  onTransactionComplete?: () => void;
}

export function SellTabContent({
  tokenAddress,
  universalAccount,
  walletClient,
  address,
  accountInfo,
  onTransactionComplete,
}: SellTabContentProps) {
  const [isSelling, setIsSelling] = useState(false);
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null
  );
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Function to check token balance with retries
  const checkTokenBalance = useCallback(async () => {
    const MAX_RETRIES = 10;
    const RETRY_INTERVAL = 1000; // 1 second
    let retryCount = 0;
    let shouldContinue = true;

    const fetchTokenBalance = async () => {
      if (!accountInfo?.solanaUaAddress || !tokenAddress || !shouldContinue)
        return;

      try {
        console.log(
          `Attempt ${retryCount + 1}/${MAX_RETRIES} - Fetching balance...`
        );
        const response = await fetch(
          `/api/token/balance?address=${accountInfo.solanaUaAddress}`
        );

        if (response.ok) {
          const tokens = await response.json();
          console.log(
            `Available tokens:`,
            tokens.map((t: TokenBalance) => ({
              symbol: t.symbol,
              balance: t.amount,
              mint: t.mint,
            }))
          );

          const targetToken = tokens.find(
            (token: TokenBalance) => token.mint === tokenAddress
          );

          if (targetToken) {
            console.log("Found target token:", {
              symbol: targetToken.symbol,
              balance: targetToken.amount,
              mint: targetToken.mint,
              decimals: targetToken.decimals,
            });
            setTokenBalance(targetToken);
            shouldContinue = false;
          } else if (retryCount >= MAX_RETRIES - 1) {
            console.log("Max retries reached, giving up");
            setTokenBalance(null);
            shouldContinue = false;
          }
        } else {
          console.error("Failed to fetch token balance");
          shouldContinue = false;
        }
      } catch (error) {
        console.error("Error fetching token balance:", error);
        shouldContinue = false;
      } finally {
        if (!shouldContinue) {
          setIsLoadingBalance(false);
        }
        retryCount++;
      }
    };

    setIsLoadingBalance(true);

    // Start the retry interval
    const retryInterval = setInterval(() => {
      if (shouldContinue && retryCount < MAX_RETRIES) {
        fetchTokenBalance();
      } else {
        clearInterval(retryInterval);
      }
    }, RETRY_INTERVAL);

    // Initial fetch
    await fetchTokenBalance();

    // Return cleanup function
    return retryInterval;
  }, [accountInfo?.solanaUaAddress, tokenAddress]);

  // Initial balance check on mount
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    checkTokenBalance().then((id) => (intervalId = id));
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [accountInfo?.solanaUaAddress, tokenAddress, checkTokenBalance]);

  const handleSellToken = async (percentage: number) => {
    if (!universalAccount || !walletClient || !address) {
      console.log("Missing required dependencies:", {
        hasUniversalAccount: !!universalAccount,
        hasWalletClient: !!walletClient,
        hasAddress: !!address,
      });
      return;
    }

    try {
      console.log("Starting sell transaction:", {
        percentage,
        tokenAddress,
        chainId: CHAIN_ID.SOLANA_MAINNET,
        userAddress: address,
      });

      setIsSelling(true);
      setSelectedPercentage(percentage);

      if (!tokenBalance) {
        throw new Error("No token balance available");
      }

      // Calculate amount to sell based on token balance and percentage
      const amountToSell = (
        Number(tokenBalance.amount) *
        (percentage / 100)
      ).toFixed(tokenBalance.decimals);
      console.log("Calculating sell amount:", {
        totalBalance: tokenBalance.amount,
        percentage,
        amountToSell,
      });

      const transaction = await universalAccount.createSellTransaction({
        token: { chainId: CHAIN_ID.SOLANA_MAINNET, address: tokenAddress },
        amount: amountToSell,
      });
      console.log("Sell transaction created:", {
        transactionId: transaction.transactionId,
        rootHash: transaction.rootHash,
        amountToSell,
      });

      // Sign the transaction's root hash using connected wallet
      if (!address.startsWith("0x")) {
        throw new Error("Invalid address format");
      }

      console.log("Signing transaction with address:", address);
      const signature = await walletClient.signMessage({
        account: address as `0x${string}`,
        message: { raw: transaction.rootHash as `0x${string}` },
      });
      console.log("Transaction signed successfully");

      // Send the signed transaction
      console.log("Sending signed transaction...");
      const sendResult = await universalAccount.sendTransaction(
        transaction,
        signature
      );
      console.log("Transaction sent successfully:", {
        transactionId: sendResult.transactionId,
        status: sendResult.status,
      });

      setTransactionId(sendResult.transactionId);

      // Transaction completed successfully
      console.log("Sell transaction completed successfully");

      // Call the completion callback if provided
      if (onTransactionComplete) {
        onTransactionComplete();
      }
    } catch (error) {
      console.error("Error selling token:", {
        error,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        percentage,
        tokenAddress,
      });
    } finally {
      setIsSelling(false);
      console.log("Sell transaction process completed");
    }
  };

  return (
    <div>
      {/* Token Balance Display */}
      <div className="mb-6 p-3 bg-gray-900 rounded-lg border border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <Label className="text-xs text-gray-400 block mb-1.5">
              Available Balance
            </Label>
            {isLoadingBalance ? (
              <div className="h-6 w-32 bg-gray-800 rounded animate-pulse"></div>
            ) : tokenBalance ? (
              <div className="text-white text-sm font-medium">
                {tokenBalance.amount} {tokenBalance.symbol}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No balance found</div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => checkTokenBalance()}
            disabled={isLoadingBalance}
            className="text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            {isLoadingBalance ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>

      <Label className="text-xs text-gray-400 block mb-3">
        Select amount to sell
      </Label>
      <div className="grid grid-cols-2 gap-2">
        {[25, 50, 75, 100].map((percentage) => (
          <Button
            key={percentage}
            size="sm"
            variant="outline"
            className={`${
              selectedPercentage === percentage
                ? "bg-white text-red-600"
                : "bg-transparent text-white border-white"
            } hover:bg-white hover:text-red-600 transition-colors text-sm font-medium w-full`}
            onClick={() => handleSellToken(percentage)}
            disabled={isSelling}
          >
            {percentage}%
          </Button>
        ))}
      </div>

      {/* Transaction Success Display */}
      {transactionId && (
        <div className="mt-3 text-xs bg-green-900/50 rounded p-2 border border-green-800">
          <h4 className="text-green-300 font-semibold mb-1">
            Transaction Submitted Successfully!
          </h4>
          <p className="text-green-200 mb-2">
            View your transaction on UniversalX:
          </p>
          <a
            href={`https://universalx.app/activity/details?id=${transactionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 underline break-all"
          >
            https://universalx.app/activity/details?id/{transactionId}
          </a>
        </div>
      )}
    </div>
  );
}
