import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import the ConnectKitProvider configuration (exported as ParticleConnectKit)
import { ParticleConnectkit } from "./components/ConnectKit";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Universal Accounts DEX",
  description: "Demo showcasing a simple DEX using Universal Accounts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ParticleConnectkit>{children}</ParticleConnectkit>
      </body>
    </html>
  );
}
