import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const TICKERS_FILE = path.join(process.cwd(), 'data', 'tickers.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  const { ticker } = req.body;

  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Неверный тикер' });
  }

  try {
    const tickers = fs.existsSync(TICKERS_FILE)
      ? JSON.parse(fs.readFileSync(TICKERS_FILE, 'utf-8'))
      : [];
    if (!tickers.includes(ticker)) {
      tickers.push(ticker);
      fs.writeFileSync(TICKERS_FILE, JSON.stringify(tickers, null, 2));
    }
    return res.status(200).json({ message: 'Тикер добавлен' });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка при добавлении тикера' });
  }
}