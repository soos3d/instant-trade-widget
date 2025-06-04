"use client";

import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AccountRow } from "./AccountRow";
import { AccountInfo } from "../../lib/types";

interface AccountsDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  accountInfo: AccountInfo | null;
  address: string;
  loading: boolean;
  copiedAddress: string | null;
  copyToClipboard: (text: string) => Promise<void>;
  truncateAddress: (address: string, chars?: number) => string;
}

export function AccountsDialog({
  dialogOpen,
  setDialogOpen,
  accountInfo,
  address,
  loading,
  copiedAddress,
  copyToClipboard,
  truncateAddress,
}: AccountsDialogProps) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white border-gray-800 text-xs font-medium py-1.5 px-2 h-auto"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Addresses
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Account Addresses</DialogTitle>
        </DialogHeader>

        {accountInfo && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
              <span>Account Type</span>
              <span>Address</span>
            </div>

            <div className="space-y-3">
              <AccountRow
                address={accountInfo.evmUaAddress}
                onCopy={() => copyToClipboard(accountInfo.evmUaAddress)}
                copied={copiedAddress === accountInfo.evmUaAddress}
                badge="Universal EVM"
                badgeColor="bg-purple-500/20 text-purple-300 border-purple-500/30"
                truncateAddress={truncateAddress}
              />
              <AccountRow
                address={accountInfo.solanaUaAddress}
                onCopy={() => copyToClipboard(accountInfo.solanaUaAddress)}
                copied={copiedAddress === accountInfo.solanaUaAddress}
                badge="Universal Solana"
                badgeColor="bg-blue-500/20 text-blue-300 border-blue-500/30"
                truncateAddress={truncateAddress}
              />
              <AccountRow
                address={address}
                onCopy={() => copyToClipboard(address)}
                copied={copiedAddress === address}
                badge="Owner Address"
                badgeColor="bg-green-500/20 text-green-300 border-green-500/30"
                truncateAddress={truncateAddress}
              />
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent mr-2"></div>
            <span className="text-sm text-gray-400">Loading accounts...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
