export async function fetchDexScreenerData(contract: string): Promise<{ liquidity: number; mcap: number }> {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${contract}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Ошибка при запросе к DexScreener');
    }
    const data = await response.json();
    const pair = data.pairs[0]; // Берем первую пару
    if (!pair) {
      throw new Error('Данные о паре не найдены');
    }
    const liquidity = pair.liquidity?.usd || 0;
    const mcap = pair.fdv || 0; // Fully Diluted Valuation как аналог MCAP
    return { liquidity, mcap };
  }