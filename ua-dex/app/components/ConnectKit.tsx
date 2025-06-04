"use client";

import React from "react";
import { ConnectKitProvider, createConfig } from "@particle-network/connectkit";
import {
  wallet,
  type EntryPosition,
} from "@particle-network/connectkit/wallet";
import { mainnet } from "@particle-network/connectkit/chains";
import { authWalletConnectors } from "@particle-network/connectkit/auth";
import {
  evmWalletConnectors,
  coinbaseWallet,
  injected,
  walletConnect,
} from "@particle-network/connectkit/evm";

const config = createConfig({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
  appId: process.env.NEXT_PUBLIC_APP_ID!,
  appearance: {
    recommendedWallets: [
      { walletId: "metaMask", label: "Popular" },
      { walletId: "rabby", label: "Recommended" },
      { walletId: "phantom", label: "Popular" },
    ],
    splitEmailAndPhone: false,
    collapseWalletList: false,
    hideContinueButton: false,
    connectorsOrder: ["social", "wallet", "email", "phone"],
    language: "en-US",
    collapsePasskeyButton: true,
  },
  walletConnectors: [
    evmWalletConnectors({
      metadata: { name: "UA DEX" },
      connectorFns: [
        injected({ target: "metaMask" }),
        injected({ target: "okxWallet" }),
        injected({ target: "phantom" }),
        injected({ target: "trustWallet" }),
        injected({ target: "bitKeep" }),
        walletConnect({
          showQrModal: false,
        }),
        coinbaseWallet(),
      ],
      multiInjectedProviderDiscovery: true,
    }),

    authWalletConnectors({
      authTypes: [
        "google",
        "apple",
        "github",
        "facebook",
        "twitter",
        "microsoft",
        "discord",
        "twitch",
        "linkedin",
        "email",
        "phone",
      ],
      fiatCoin: "USD",
      promptSettingConfig: {
        promptMasterPasswordSettingWhenLogin: 0,
        promptPaymentPasswordSettingWhenSign: 0,
      },
    }),
  ],
  plugins: [
    wallet({
      entryPosition: "bottom-right" as EntryPosition,
      visible: false,
      customStyle: {
        fiatCoin: "USD",
      },
    }),
  ],
  chains: [mainnet],
});

// Wrap your application with this component.
export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
  return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};
