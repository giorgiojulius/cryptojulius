// lib/api.ts
import axios from "axios";

const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex/search";
const COINGECKO_API = "https://api.coingecko.com/api/v3";

interface CoinGeckoContractResponse {
  id: string;
  image?: {
    small: string;
  };
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
  logoUrl: string | null;
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
  logoUrl: string | null;
}

/** Преобразование dexId в человекочитаемый формат */
function formatDexId(dexId: string): string {
  switch (dexId.toLowerCase()) {
    case "uniswap":
      return "Uniswap";
    case "pancakeswap":
      return "PancakeSwap";
    case "velodrome":
      return "Velodrome";
    case "aerodrome":
      return "Aerodrome";
    case "sushiswap":
      return "SushiSwap";
    default:
      return dexId.charAt(0).toUpperCase() + dexId.slice(1);
  }
}

/** Проверка валидности и доступности URL */
async function validateImageUrl(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    new URL(url);
    // Проверка доступности изображения
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Тайм-аут 3 секунды
    const response = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok && response.headers.get("content-type")?.startsWith("image/")) {
      return url;
    }
    console.warn(`URL недоступен или не является изображением: ${url}`);
    return null;
  } catch (error) {
    console.warn(`Ошибка при проверке URL: ${url}`, error);
    return null;
  }
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

    const filteredResults = await Promise.all(
      response.data.pairs.map(async (pair: any) => {
        const logoUrl = await validateImageUrl(pair.info?.imageUrl);
        console.log("DexScreener pair:", {
          address: pair.baseToken.address,
          imageUrl: pair.info?.imageUrl,
          isValid: !!logoUrl,
        });
        return {
          address: pair.baseToken.address,
          pairAddress: pair.pairAddress,
          name: pair.baseToken.name,
          symbol: pair.baseToken.symbol,
          chainId: pair.chainId,
          liquidityUsd: parseFloat(pair.liquidity?.usd || "0"),
          volume24h: parseFloat(pair.volume?.h24 || "0"),
          poolType: formatDexId(pair.dexId || "Unknown"),
          blockchain: pair.chainId === "ethereum" ? "Ethereum" : pair.chainId.charAt(0).toUpperCase() + pair.chainId.slice(1),
          logoUrl,
        };
      })
    );

    return filteredResults
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
      })
      .slice(0, 10);
  } catch (error) {
    console.error("Ошибка при поиске токенов:", error);
    return [];
  }
}

/**
 * Получение данных о токене/пуле по его адресу и chainId
 * @param address - адрес токена
 * @param chainId - идентификатор блокчейна
 * @param currentAth - текущее значение ATH (для надёжного обновления)
 * @returns объект с данными токена/пула
 */
export async function getTokenData(address: string, chainId: string, currentAth: number | null = null): Promise<TokenData> {
  try {
    const dexResponse = await axios.get(`${DEXSCREENER_API}?q=${address}&chainId=${chainId}`);
    const pair = dexResponse.data.pairs[0];
    if (!pair) {
      throw new Error("Пара токенов не найдена");
    }

    let ath: number | null = pair.athUsd ? parseFloat(pair.athUsd) : null;
    let logoUrl: string | null = await validateImageUrl(pair.info?.imageUrl);

    console.log("DexScreener token data:", {
      address: pair.baseToken.address,
      imageUrl: pair.info?.imageUrl,
      isValid: !!logoUrl,
      ath: ath,
      source: "DexScreener",
    });

    try {
      const platform = chainId === "ethereum" ? "ethereum" : chainId;
      const cgResponse = await axios.get<CoinGeckoContractResponse>(
        `${COINGECKO_API}/coins/${platform}/contract/${address}`
      );
      if (cgResponse.data.market_data?.ath?.usd) {
        const cgAth = cgResponse.data.market_data.ath.usd;
        ath = ath !== null ? Math.max(ath, cgAth) : cgAth;
      }
      if (cgResponse.data.image?.small && !logoUrl) {
        logoUrl = await validateImageUrl(cgResponse.data.image.small);
      }
      console.log("CoinGecko token data:", {
        address,
        logo: cgResponse.data.image?.small,
        isValid: !!logoUrl,
        ath: cgResponse.data.market_data?.ath?.usd,
        source: "CoinGecko",
      });
    } catch (cgError) {
      console.warn(`CoinGecko не вернул данные для ${address} на ${chainId}:`, cgError);
    }

    // Надёжное обновление ATH: сохраняем старое значение, если новое меньше или отсутствует
    let finalAth: number | null = currentAth;
    if (ath !== null) {
      if (currentAth === null || ath > currentAth) {
        finalAth = ath;
        console.log(`ATH обновлён для ${address}: ${currentAth} → ${finalAth}`);
      } else {
        console.log(`ATH не обновлён для ${address}: текущее ${currentAth}, новое ${ath}`);
      }
    } else {
      console.log(`ATH не обновлён для ${address}: API вернул null, текущее значение ${currentAth}`);
    }

    return {
      address: pair.baseToken.address,
      pairAddress: pair.pairAddress,
      name: pair.baseToken.name,
      symbol: pair.baseToken.symbol,
      chainId: pair.chainId,
      blockchain: pair.chainId === "ethereum" ? "Ethereum" : pair.chainId.charAt(0).toUpperCase() + pair.chainId.slice(1),
      currentPrice: parseFloat(pair.priceUsd),
      ath: finalAth,
      marketCap: parseFloat(pair.fdv),
      liquidity: parseFloat(pair.liquidity?.usd || "0"),
      volume24h: parseFloat(pair.volume?.h24 || "0"),
      poolType: formatDexId(pair.dexId || "Unknown"),
      logoUrl,
    };
  } catch (error) {
    console.error("Ошибка при получении данных токена:", error);
    throw error;
  }
}