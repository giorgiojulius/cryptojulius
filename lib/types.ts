// lib/types.ts
export interface Project {
    address: string;
    pairAddress: string;
    name: string;
    symbol: string;
    chainId: string;
    blockchain: string;
    currentPrice: number;
    ath: number | null; // ATH может отсутствовать
    marketCap: number;
    liquidity: number;
    volume24h: number;
    poolType: string;
    moatFactor: number;
    timestamp: number;
  }