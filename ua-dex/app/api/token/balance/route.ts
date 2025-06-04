import { NextResponse } from "next/server";

interface TokenData {
  associatedTokenAddress: string;
  mint: string;
  amountRaw: string;
  amount: string;
  decimals: number;
  name: string;
  symbol: string;
  logo: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const mint = searchParams.get("mint");

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://solana-gateway.moralis.io/account/mainnet/${address}/tokens?excludeSpam=false`,
      {
        headers: {
          accept: "application/json",
          "X-API-Key": process.env.MORALIS_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const tokens = await response.json() as TokenData[];

    // If a specific mint is requested, filter for that token
    if (mint) {
      const token = tokens.find((token) => token.mint === mint);
      if (!token) {
        return NextResponse.json(
          { error: "Token not found for this address" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        amount: token.amount,
        amountRaw: token.amountRaw,
        decimals: token.decimals,
        symbol: token.symbol,
        name: token.name,
        logo: token.logo,
      });
    }

    // Otherwise return all tokens
    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch token balance" },
      { status: 500 }
    );
  }
}
