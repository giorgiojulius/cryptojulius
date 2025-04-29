import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const TICKERS_FILE = path.join(process.cwd(), 'data', 'tickers.json');
const CACHE_FILE = path.join(process.cwd(), 'data', 'cache.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const tickers = JSON.parse(fs.readFileSync(TICKERS_FILE, 'utf-8'));
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));

    const data = await Promise.all(
      tickers.map(async (id: string) => {
        const contracts = cache[id]?.contracts || [];
        if (contracts.length === 0) return null;
        const contract = contracts[0];
        const dexData = await fetchDexScreenerData(contract);
        return { id, mcap: dexData.mcap, liquidity: dexData.liquidity };
      })
    );

    const filteredData = data.filter(d => d !== null);
    return res.status(200).json(filteredData);
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка при загрузке данных' });
  }
}

async function fetchDexScreenerData(contract: string) {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${contract}`;
  const response = await fetch(url);
  const data = await response.json();
  const pair = data.pairs[0] || {};
  return {
    mcap: pair.fdv || 0,
    liquidity: pair.liquidity?.usd || 0,
  };
}