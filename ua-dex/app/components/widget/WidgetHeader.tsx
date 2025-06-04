"use client";

import { RefreshCw, Wallet } from "lucide-react";
import { formatCurrency } from "../../../lib/utils";

interface WidgetHeaderProps {
  title: string;
  isConnected: boolean;
  balanceLoading: boolean;
  isRefreshing: boolean;
  totalBalanceUSD: number | null;
  fetchBalance: (isManualRefresh: boolean) => void;
}

export function WidgetHeader({
  title,
  isConnected,
  balanceLoading,
  isRefreshing,
  totalBalanceUSD,
  fetchBalance,
}: WidgetHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-purple-500/20 rounded-lg">
          <Wallet className="w-4 h-4 text-purple-400" />
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>

      {isConnected && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBalance(true)}
            disabled={isRefreshing}
            className={`p-1 rounded-full hover:bg-gray-800 transition-colors ${
              isRefreshing ? "animate-spin" : ""
            }`}
            title="Refresh balance"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing
                  ? "opacity-70"
                  : "text-gray-400 hover:text-white"
              }`}
            />
          </button>
          <div className="text-right">
            <p className="text-xs text-gray-400">Balance</p>
            {balanceLoading && !isRefreshing ? (
              <div className="h-5 w-20 bg-gray-800 rounded animate-pulse"></div>
            ) : (
              <p className="text-xs font-medium">
                {formatCurrency(totalBalanceUSD)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
