export interface UniversalAccountsWidgetProps {
  projectId?: string;
  title?: string;
  tokenAddress?: string;
}
  
export interface AccountInfo {
  evmUaAddress: string;
  solanaUaAddress: string;
}

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  realDecimals?: number;
  chainId: number;
  address: string;
  price?: number;
  image?: string;
}

export interface FeeAmount {
  token: Token;
  amount: string;
  amountInUSD: string;
}

export interface FeeTotals {
  feeTokenAmountInUSD: string;
  gasFeeTokenAmountInUSD: string;
  transactionFeeTokenAmountInUSD: string;
  transactionServiceFeeTokenAmountInUSD: string;
  transactionLPFeeTokenAmountInUSD: string;
  solanaRentFeeAmountInUSD?: string;
}

export interface TransactionFees {
  totals: FeeTotals;
  feeTokens: FeeAmount[];
  freeGasFee: boolean;
  freeServiceFee: boolean;
}

export interface TransactionFeeEstimate {
  fees: TransactionFees;
  // Parsed fee values for direct display
  parsedFees?: {
    gasFeeInUSD: string;
    serviceFeeInUSD: string;
    lpFeeInUSD: string;
    totalFeeInUSD: string;
  };
}