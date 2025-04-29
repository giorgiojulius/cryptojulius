// lib/api.ts
import axios from "axios";

const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex/search";
const COINGECKO_API = "https://api.coingecko.com/api/v3";

interface CoinGeckoContractResponse {
  id: string;
  market_data?: {
    ath: {
      usd: number;
    };
  };
}

/** Результат поиска токена/пула */
export interface TokenSearchResult {
  address: string;
  pairAddress: string;
  name: string;
  symbol: string;
  chainId: string;
  liquidityUsd: number;
  volume24h: number;
  poolType: string;
  blockchain: string;
}

/** Данные о токене/пуле */
export interface TokenData {
  address: string;
  pairAddress: string;
  name: string;
  symbol: string;
  chainId: string;
  blockchain: string;
  currentPrice: number;
  ath: number | null;
  marketCap: number;
  liquidity: number;
  volume24h: number;
  poolType: string;
}

/**
 * Поиск токенов/пулов по имени или символу через DexScreener API
 * @param query - строка для поиска (например, "uni")
 * @returns массив результатов поиска, отсортированный по релевантности
 */
export async function searchTokens(query: string): Promise<TokenSearchResult[]> {
  try {
    const response = await axios.get(`${DEXSCREENER_API}?q=${query}`);
    const queryLower = query.toLowerCase();

    const filteredResults = response.data.pairs
      .map((pair: any) => ({
        address: pair.baseToken.address,
        pairAddress: pair.pairAddress,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        chainId: pair.chainId,
        liquidityUsd: parseFloat(pair.liquidity?.usd || "0"),
        volume24h: parseFloat(pair.volume?.h24 || "0"),
        poolType: pair.info?.type || "Unknown",
        blockchain: pair.chainId === "ethereum" ? "Ethereum" : pair.chainId.charAt(0).toUpperCase() + pair.chainId.slice(1),
      }))
      .filter((token: TokenSearchResult) => {
        const nameLower = token.name.toLowerCase();
        const symbolLower = token.symbol.toLowerCase();
        return nameLower.includes(queryLower) || symbolLower.includes(queryLower);
      })
      .sort((a: TokenSearchResult, b: TokenSearchResult) => {
        const aNameLower = a.name.toLowerCase();
        const bNameLower = b.name.toLowerCase();
        const aExact = aNameLower === queryLower || a.symbol.toLowerCase() === queryLower ? -1 : 0;
        const bExact = bNameLower === queryLower || b.symbol.toLowerCase() === queryLower ? -1 : 0;
        return aExact - bExact || aNameLower.localeCompare(bNameLower);
      });

    return filteredResults.slice(0, 10);
  } catch (error) {
    console.error("Ошибка при поиске токенов:", error);
    return [];
  }
}

/**
 * Получение данных о токене/пуле по его адресу и chainId
 * @param address - адрес токена
 * @param chainId - идентификатор блокчейна
 * @returns объект с данными токена/пула
 */
export async function getTokenData(address: string, chainId: string): Promise<TokenData> {
  try {
    // Запрос к DexScreener для базовых данных
    const dexResponse = await axios.get(`${DEXSCREENER_API}?q=${address}&chainId=${chainId}`);
    const pair = dexResponse.data.pairs[0];
    if (!pair) {
      throw new Error("Пара токенов не найдена");
    }

    // Попытка получить ATH из CoinGecko
    let ath: number | null = pair.athUsd ? parseFloat(pair.athUsd) : null;
    try {
      const platform = chainId === "ethereum" ? "ethereum" : chainId; // Сопоставление chainId с платформой CoinGecko
      const cgResponse = await axios.get<CoinGeckoContractResponse>(
        `${COINGECKO_API}/coins/${platform}/contract/${address}`
      );
      if (cgResponse.data.market_data?.ath?.usd) {
        ath = cgResponse.data.market_data.ath.usd;
      }
    } catch (cgError) {
      console.warn(`CoinGecko не вернул ATH для ${address} на ${chainId}:`, cgError);
      // Используем athUsd из DexScreener, если доступно
    }

    return {
      address: pair.baseToken.address,
      pairAddress: pair.pairAddress,
      name: pair.baseToken.name,
      symbol: pair.baseToken.symbol,
      chainId: pair.chainId,
      blockchain: pair.chainId === "ethereum" ? "Ethereum" : pair.chainId.charAt(0).toUpperCase() + pair.chainId.slice(1),
      currentPrice: parseFloat(pair.priceUsd),
      ath,
      marketCap: parseFloat(pair.fdv),
      liquidity: parseFloat(pair.liquidity?.usd || "0"),
      volume24h: parseFloat(pair.volume?.h24 || "0"),
      poolType: pair.info?.type || "Unknown",
    };
  } catch (error) {
    console.error("Ошибка при получении данных токена:", error);
    throw error;
  }
}