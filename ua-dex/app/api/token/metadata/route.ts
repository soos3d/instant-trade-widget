import { NextRequest, NextResponse } from "next/server";

// Define the token metadata interface
interface TokenMetadata {
  mint: string;
  standard: string;
  name: string;
  symbol: string;
  logo?: string;
  decimals: string;
  metaplex?: {
    metadataUri: string;
    masterEdition: boolean;
    isMutable: boolean;
    sellerFeeBasisPoints: number;
    updateAuthority: string;
    primarySaleHappened: number;
  };
  fullyDilutedValue?: string;
  totalSupply?: string;
  totalSupplyFormatted?: string;
  links?: Record<string, string> | null;
  description?: string | null;
  // Additional fields we add
  price?: number;
  priceChange?: number;
}

// Simple in-memory cache to avoid redundant API calls
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
interface CacheEntry {
  data: TokenMetadata;
  timestamp: number;
}
const cache: Record<string, CacheEntry> = {};

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const mint = searchParams.get("mint");

    if (!mint) {
      return NextResponse.json(
        { error: "Token mint address is required" },
        { status: 400 }
      );
    }
    
    // Check cache first
    const cacheKey = `metadata_${mint}`;
    const cachedData = cache[cacheKey];
    const now = Date.now();
    
    if (cachedData && now - cachedData.timestamp < CACHE_EXPIRY) {
      return NextResponse.json(cachedData.data);
    }
    
    // Get API key from environment variables
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Fetch data from Moralis API
    const url = `https://solana-gateway.moralis.io/token/mainnet/${mint}/metadata`;
    const response = await fetch(url, {
      headers: {
        "accept": "application/json",
        "X-API-Key": apiKey
      }
    });
console.log(response);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Error fetching token metadata: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Enhance the response with mock price data (to be replaced with real API later)
    const enhancedData = {
      ...data,
      price: 2.34,
      priceChange: 3.45
    };

    // Store in cache
    cache[cacheKey] = {
      data: enhancedData,
      timestamp: now
    };

    return NextResponse.json(enhancedData);
  } catch (error) {
    console.error("Token metadata API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token metadata" },
      { status: 500 }
    );
  }
}
