import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache to avoid redundant API calls
const CACHE_EXPIRY = 2 * 60 * 1000; // 2 minutes
interface CacheEntry {
  price: number;
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
    const cacheKey = `price_${mint}`;
    const cachedData = cache[cacheKey];
    const now = Date.now();
    
    if (cachedData && now - cachedData.timestamp < CACHE_EXPIRY) {
      return NextResponse.json({ usdPrice: cachedData.price });
    }
    
    // Get API key from environment variables
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Fetch price data from Moralis API
    const url = `https://solana-gateway.moralis.io/token/mainnet/${mint}/price`;
    const response = await fetch(url, {
      headers: {
        "accept": "application/json",
        "X-API-Key": apiKey
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error fetching token price: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract just the USD price
    const usdPrice = data.usdPrice;
    
    // Store in cache
    cache[cacheKey] = {
      price: usdPrice,
      timestamp: now
    };

    return NextResponse.json({ usdPrice });
  } catch (error) {
    console.error("Token price API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token price" },
      { status: 500 }
    );
  }
}
