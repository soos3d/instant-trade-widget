"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountRowProps {
  address: string;
  onCopy: () => void;
  copied?: boolean;
  badge: string;
  badgeColor: string;
  truncateAddress: (address: string, chars?: number) => string;
}

export function AccountRow({
  address,
  onCopy,
  copied,
  badge,
  badgeColor,
  truncateAddress,
}: AccountRowProps) {
  return (
    <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-3 hover:bg-gray-900/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded border ${badgeColor}`}
          >
            {badge}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-gray-300">
            {truncateAddress(address, 6)}
          </span>
          <Button
            onClick={onCopy}
            variant="ghost"
            size="sm"
            className="p-1 h-auto hover:bg-gray-800/50 text-gray-400 hover:text-white"
            title="Copy address"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
