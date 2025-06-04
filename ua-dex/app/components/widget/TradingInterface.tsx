"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { TokenInfoCard } from "./TokenInfoCard";
import { BuyTabContent } from "./BuyTabContent";
import { SellTabContent } from "./SellTabContent";
import { AccountInfo } from "../../../lib/types";
import { UniversalAccount } from "@particle-network/universal-account-sdk";
import type { WalletClient } from "viem";

interface TokenInfo {
  name: string;
  symbol: string;
  price: number;
  logo: string;
  mint: string;
}

interface TradingInterfaceProps {
  tokenInfo: TokenInfo;
  isTokenLoading: boolean;
  activeTab: string;
  setActiveTab: (value: string) => void;
  usdAmount: string;
  tokenAddress: string;
  setUsdAmount: (value: string) => void;
  isBuying?: boolean; // Optional since BuyTabContent manages its own state
  universalAccount: UniversalAccount | null;
  walletClient: WalletClient | null;
  address: string | null; // Ensuring consistent null type with BuyTabContent
  onTransactionComplete?: () => void;
  accountInfo: AccountInfo | null;
}

export function TradingInterface({
  tokenInfo,
  isTokenLoading,
  activeTab,
  setActiveTab,
  usdAmount,
  tokenAddress,
  setUsdAmount,
  isBuying,
  universalAccount,
  walletClient,
  address,
  onTransactionComplete,
  accountInfo,
}: TradingInterfaceProps) {
  return (
    <div className="mt-4">
      <TokenInfoCard tokenInfo={tokenInfo} isTokenLoading={isTokenLoading} />

      <Tabs
        defaultValue="buy"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 bg-gray-900">
          <TabsTrigger value="buy" className="text-xs">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="text-xs">
            Sell
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-3 mt-3">
          {walletClient && (
            <BuyTabContent 
              usdAmount={usdAmount}
              tokenAddress={tokenAddress}
              setUsdAmount={setUsdAmount}
              isBuying={isBuying}
              universalAccount={universalAccount}
              walletClient={walletClient}
              address={address || null}
              onTransactionComplete={onTransactionComplete}
            />
          )}
          {!walletClient && (
            <div className="p-4 text-center text-gray-400">
              Wallet client not available. Please reconnect your wallet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="sell" className="space-y-3 mt-3">
          <SellTabContent 
            tokenAddress={tokenAddress}
            universalAccount={universalAccount}
            walletClient={walletClient}
            address={address}
            accountInfo={accountInfo}
            onTransactionComplete={onTransactionComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
