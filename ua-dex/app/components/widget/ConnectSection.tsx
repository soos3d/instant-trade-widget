"use client";

import { ConnectButton } from "@particle-network/connectkit";
import { Button } from "../../../components/ui/button";
import { AccountsDialog } from "../AccountsDialog";
import { AccountInfo } from "../../../lib/types";

interface ConnectSectionProps {
  isConnected: boolean;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  accountInfo: AccountInfo | null;
  address: string | undefined;
  loading: boolean;
  copiedAddress: string | null;
  copyToClipboard: (text: string) => Promise<void>;
  truncateAddress: (address: string, chars?: number) => string;
  disconnect: () => void;
}

export function ConnectSection({
  isConnected,
  dialogOpen,
  setDialogOpen,
  accountInfo,
  address,
  loading,
  copiedAddress,
  copyToClipboard,
  truncateAddress,
  disconnect,
}: ConnectSectionProps) {
  return (
    <div className="mb-3">
      {!isConnected ? (
        <div className="w-full">
          <ConnectButton />
        </div>
      ) : (
        <div className="flex gap-2">
          <AccountsDialog
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            accountInfo={accountInfo}
            address={address!}
            loading={loading}
            copiedAddress={copiedAddress}
            copyToClipboard={copyToClipboard}
            truncateAddress={truncateAddress}
          />
          <Button
            onClick={() => disconnect()}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-2 h-auto"
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}
