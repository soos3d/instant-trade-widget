"use client";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { truncateAddress } from "../../../lib/utils";
import { TransactionFeeEstimate } from "../../../lib/types";
import {
  UniversalAccount,
  CHAIN_ID,
} from "@particle-network/universal-account-sdk";
import { useState, useCallback, useEffect } from "react";
import { WalletClient } from "viem";
import { formatUnits } from "ethers";

interface BuyTabContentProps {
  usdAmount: string;
  tokenAddress: string;
  setUsdAmount: (value: string) => void;
  isBuying?: boolean; // Optional now since we manage it internally
  universalAccount: UniversalAccount | null;
  walletClient: WalletClient;
  address: string | null;
  onTransactionComplete?: () => void; // Optional callback for post-transaction actions
}

export function BuyTabContent({
  usdAmount,
  tokenAddress,
  setUsdAmount,
  universalAccount,
  walletClient,
  address,
  onTransactionComplete,
  isBuying: externalIsBuying,
}: BuyTabContentProps) {
  // Local buying state - use external if provided, otherwise manage internally
  const [localIsBuying, setLocalIsBuying] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [feeEstimate, setFeeEstimate] = useState<TransactionFeeEstimate | null>(null);
  const [isEstimatingFee, setIsEstimatingFee] = useState(false);
  
  const isBuying =
    externalIsBuying !== undefined ? externalIsBuying : localIsBuying;

  // Function to estimate transaction fees
  const estimateFees = useCallback(
    async (amount: string) => {
      if (!amount || isNaN(parseFloat(amount)) || !universalAccount) {
        setFeeEstimate(null);
        return;
      }

      try {
        setIsEstimatingFee(true);
        console.log("Estimating fees for amount:", amount);
        const transaction = await universalAccount.createBuyTransaction({
          token: { chainId: CHAIN_ID.SOLANA_MAINNET, address: tokenAddress },
          amountInUSD: amount,
        });

        console.log("Buy transaction fee data:", transaction);

        // Extract fee information from the transaction
        if (transaction.feeQuotes && transaction.feeQuotes.length > 0) {
          const feeQuote = transaction.feeQuotes[0];
          const fee = feeQuote.fees.totals;

          console.log(
            // Parse the fee values for easier display
            `Total fee in USD: $${parseFloat(
              formatUnits(fee.feeTokenAmountInUSD, 18)
            ).toFixed(4)}`
          );
          console.log(
            `Gas fee in USD: $${parseFloat(
              formatUnits(fee.gasFeeTokenAmountInUSD, 18)
            ).toFixed(4)}`
          );
          console.log(
            `Service fee in USD: $${parseFloat(
              formatUnits(fee.transactionServiceFeeTokenAmountInUSD, 18)
            ).toFixed(4)}`
          );
          console.log(
            `LP fee in USD: $${parseFloat(
              formatUnits(fee.transactionLPFeeTokenAmountInUSD, 18)
            ).toFixed(4)}`
          );

          // Store the fee estimate with pre-parsed values
          setFeeEstimate({
            fees: {
              totals: feeQuote.fees.totals,
              feeTokens: feeQuote.fees.feeTokens.map((tokenData) => ({
                token: {
                  symbol: tokenData.token.symbol || "",
                  name: tokenData.token.name || "",
                  decimals: tokenData.token.decimals,
                  realDecimals: tokenData.token.realDecimals,
                  chainId: tokenData.token.chainId,
                  address: tokenData.token.address,
                  image: tokenData.token.image,
                },
                amount: tokenData.amount,
                amountInUSD: tokenData.amountInUSD,
              })),
              freeGasFee: feeQuote.fees.freeGasFee,
              freeServiceFee: feeQuote.fees.freeServiceFee,
            },
            // Include pre-parsed values for direct display
            parsedFees: {
              gasFeeInUSD: parseFloat(
                formatUnits(fee.gasFeeTokenAmountInUSD, 18)
              ).toFixed(4),
              serviceFeeInUSD: parseFloat(
                formatUnits(fee.transactionServiceFeeTokenAmountInUSD, 18)
              ).toFixed(4),
              lpFeeInUSD: parseFloat(
                formatUnits(fee.transactionLPFeeTokenAmountInUSD, 18)
              ).toFixed(4),
              totalFeeInUSD: parseFloat(
                formatUnits(fee.feeTokenAmountInUSD, 18)
              ).toFixed(4),
            },
          });
        }
      } catch (error) {
        console.error("Error estimating fees:", error);
        setFeeEstimate(null);
      } finally {
        setIsEstimatingFee(false);
      }
    },
    [universalAccount, tokenAddress]
  );

  // Effect to trigger fee estimation when amount changes
  useEffect(() => {
    if (usdAmount && parseFloat(usdAmount) > 0) {
      estimateFees(usdAmount);
    } else {
      setFeeEstimate(null);
    }
  }, [usdAmount, estimateFees]);

  const handleBuyToken = async (amount: string) => {
    if (
      !amount ||
      isNaN(parseFloat(amount)) ||
      !universalAccount ||
      !walletClient ||
      !address
    )
      return;

    try {
      setLocalIsBuying(true);
      const transaction = await universalAccount.createBuyTransaction({
        token: { chainId: CHAIN_ID.SOLANA_MAINNET, address: tokenAddress },
        amountInUSD: amount,
      });

      console.log("Buy transaction created:", transaction);

      // Sign the transaction's root hash using connected wallet
      const signature = await walletClient.signMessage({
        account: address as `0x${string}`,
        message: { raw: transaction.rootHash as `0x${string}` },
      });

      // Send the signed transaction via Universal Account SDK
      const sendResult = await universalAccount.sendTransaction(
        transaction,
        signature
      );

      setTransactionId(sendResult.transactionId);

      // Call the completion callback if provided
      if (onTransactionComplete) {
        onTransactionComplete();
      }
    } catch (error) {
      console.error("Error creating buy transaction:", error);
    } finally {
      setLocalIsBuying(false);
    }
  };
  return (
    <div>
      <Label htmlFor="buy-amount" className="text-xs text-gray-400">
        Amount (USD)
      </Label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            id="buy-amount"
            type="number"
            placeholder="0.00"
            className="bg-gray-900 border-gray-800 text-white text-sm"
            value={usdAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUsdAmount(e.target.value)
            }
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-9 w-9 p-0 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors rounded-full flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault();
              setUsdAmount("");
            }}
            disabled={!usdAmount}
            title="Clear amount"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => handleBuyToken(usdAmount)}
          disabled={
            isBuying ||
            !usdAmount ||
            isNaN(parseFloat(usdAmount)) ||
            !universalAccount
          }
        >
          {isBuying ? "Buying..." : "Buy"}
        </Button>
      </div>

      {tokenAddress && (
        <div className="mt-2 text-xs text-gray-500">
          <p>Token: {truncateAddress(tokenAddress)}</p>
        </div>
      )}

      {/* Fee Estimate or Transaction Success Display */}
      <div className="mt-3 text-xs">
        {transactionId ? (
          <div className="bg-green-900/50 rounded p-2 border border-green-800">
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
        ) : isEstimatingFee ? (
          <p className="text-gray-400">Calculating fees...</p>
        ) : feeEstimate ? (
          <div className="bg-gray-900 rounded p-2 border border-gray-800">
            <h4 className="text-gray-300 font-semibold mb-1">
              Estimated Fees:
            </h4>
            <div className="flex justify-between">
              <span className="text-gray-400">Gas:</span>
              <span className="text-white">
                ${feeEstimate.parsedFees?.gasFeeInUSD || "0.0000"} USD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Service Fee:</span>
              <span className="text-white">
                ${feeEstimate.parsedFees?.serviceFeeInUSD || "0.0000"} USD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">LP Fee:</span>
              <span className="text-white">
                ${feeEstimate.parsedFees?.lpFeeInUSD || "0.0000"} USD
              </span>
            </div>
            <div className="flex justify-between mt-1 pt-1 border-t border-gray-700">
              <span className="text-gray-300">Total Fee:</span>
              <span className="text-white font-medium">
                ${feeEstimate.parsedFees?.totalFeeInUSD || "0.0000"} USD
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
