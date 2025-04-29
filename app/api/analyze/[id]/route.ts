import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const CACHE_FILE = path.join(process.cwd(), 'data', 'cache.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Неверный ID' });
  }

  try {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    const contracts = cache[id]?.contracts || [];

    if (contracts.length === 0) {
      return res.status(404).json({ error: 'Контракты не найдены' });
    }

    const contract = contracts[0];
    const dexData = await fetchDexScreenerData(contract);
    return res.status(200).json({
      contract,
      mcap: dexData.mcap,
      liquidity: dexData.liquidity,
      volume: dexData.volume?.h24 || 0,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка при получении данных' });
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
    volume: pair.volume?.h24 || 0,
  };
}