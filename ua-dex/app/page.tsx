"use client";

import UniversalAccountsWidget from "./components/Widget";
import { useState } from "react";

export default function Home() {
  const [tokenAddress, setTokenAddress] = useState(
    "2nM6WQAUf4Jdmyd4kcSr8AURFoSDe9zsmRXJkFoKpump"
  );
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setTokenAddress(inputValue.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-lg mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Instant Swap Widget
          </h1>
        </div>

        {/* Contract Address Input */}
        <div className="mb-6 bg-gray-800 rounded-lg p-4">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
            <label
              htmlFor="contract-address"
              className="text-white text-sm font-medium"
            >
              Token Contract Address
            </label>
            <div className="flex">
              <input
                id="contract-address"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter token contract address"
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-md transition duration-200"
              >
                Update
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Current token: {tokenAddress.substring(0, 6)}...
              {tokenAddress.substring(tokenAddress.length - 4)}
            </p>
          </form>
        </div>

        <UniversalAccountsWidget
          projectId={process.env.NEXT_PUBLIC_UA_PROJECT_ID}
          title="Universal Swap"
          tokenAddress={tokenAddress}
        />
      </div>
    </div>
  );
}
