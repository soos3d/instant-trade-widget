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

// Token metadata cache to avoid repeated lookups
const tokenMetadataCache = new Map<string, { name: string; symbol: string; logo: string; decimals: number }>();

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
    // Define the RPC endpoint - prefer environment variable or fallback to public endpoint
    const rpcEndpoint = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    
    // Construct the RPC request
    const rpcRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        address,
        // If mint is specified, filter by mint, otherwise get all tokens
        mint ? { mint } : { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { encoding: "jsonParsed" }
      ]
    };

    const response = await fetch(rpcEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(rpcRequest)
    });

    if (!response.ok) {
      throw new Error(`RPC error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(`Solana RPC error: ${result.error.message}`);
    }

    interface SolanaTokenAccount {
      pubkey: string;
      account: {
        data: {
          parsed: {
            info: {
              mint: string;
              tokenAmount: {
                amount: string;
                decimals: number;
                uiAmountString: string;
              };
            };
          };
        };
      };
    }

    // Process the RPC response
    const tokens = await Promise.all(result.result.value.map(async (account: SolanaTokenAccount) => {
      const data = account.account.data.parsed.info;
      const mintAddress = data.mint;
      const tokenAmount = data.tokenAmount;
      
      // Get or fetch token metadata
      let tokenMetadata = tokenMetadataCache.get(mintAddress);
      if (!tokenMetadata) {
        // For a production app, you'd want to implement proper token metadata lookup here
        // For now, we'll use placeholder metadata
        tokenMetadata = {
          name: `Token ${mintAddress.slice(0, 6)}`,
          symbol: `TKN-${mintAddress.slice(0, 3)}`,
          logo: "",
          decimals: tokenAmount.decimals
        };
        tokenMetadataCache.set(mintAddress, tokenMetadata);
      }

      return {
        associatedTokenAddress: account.pubkey,
        mint: mintAddress,
        amountRaw: tokenAmount.amount,
        amount: tokenAmount.uiAmountString,
        decimals: tokenAmount.decimals,
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        logo: tokenMetadata.logo
      } as TokenData;
    }));

    // If a specific mint was requested
    if (mint) {
      if (tokens.length === 0) {
        return NextResponse.json(
          { error: "Token not found for this address" },
          { status: 404 }
        );
      }
      const token = tokens[0];
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
