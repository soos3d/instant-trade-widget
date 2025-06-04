"use client";

import { Coins } from "lucide-react";

interface TokenInfo {
  name: string;
  symbol: string;
  price: number;
  logo: string;
  mint: string;
}

interface TokenInfoCardProps {
  tokenInfo: TokenInfo;
  isTokenLoading: boolean;
}

export function TokenInfoCard({ tokenInfo, isTokenLoading }: TokenInfoCardProps) {
  return (
    <div className="mb-4 p-2.5 bg-gray-900/50 rounded-lg border border-gray-800">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          {isTokenLoading ? (
            <div className="animate-pulse w-5 h-5 bg-blue-400/30 rounded-full"></div>
          ) : tokenInfo.logo ? (
            <>
              <div className="relative w-10 h-10">
                <img
                  src={tokenInfo.logo}
                  alt={tokenInfo.symbol}
                  className="w-10 h-10 rounded-full"
                  onError={() => {
                    // We'll handle errors with a fallback icon below
                    document
                      .getElementById("fallback-icon")
                      ?.classList.remove("hidden");
                  }}
                />
              </div>
              <Coins
                id="fallback-icon"
                className="w-5 h-5 text-blue-400 hidden"
              />
            </>
          ) : (
            <Coins className="w-10 h-10 text-blue-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              {isTokenLoading ? (
                <div className="w-24 h-4 bg-gray-800 rounded animate-pulse"></div>
              ) : (
                <h3 className="text-sm font-medium text-white">
                  {tokenInfo.name}
                  <span className="text-xs text-gray-400 ml-1">
                    {tokenInfo.symbol}
                  </span>
                </h3>
              )}
            </div>
            <div className="text-right">
              {isTokenLoading ? (
                <>
                  <div className="w-16 h-4 bg-gray-800 rounded animate-pulse mb-1"></div>
                  <div className="w-12 h-3 bg-gray-800 rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-white">
                    ${tokenInfo.price.toFixed(4)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
