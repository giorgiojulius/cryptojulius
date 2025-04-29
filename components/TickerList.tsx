'use client'

import { useState, useEffect } from 'react';

interface TickerData {
  id: string;
  mcap: number;
  liquidity: number;
}

export function TickerList({ onSelect }: { onSelect: (id: string) => void }) {
  const [tickers, setTickers] = useState<TickerData[]>([]);

  useEffect(() => {
    fetch('/api/tickers/data')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: TickerData, b: TickerData) => b.mcap - a.mcap);
        setTickers(sorted);
      })
      .catch(() => console.error('Ошибка загрузки тикеров'));
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Добавленные криптовалюты</h2>
      <ul className="space-y-2">
        {tickers.map(ticker => (
          <li
            key={ticker.id}
            className="flex justify-between items-center p-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition"
            onClick={() => onSelect(ticker.id)}
          >
            <span className="font-medium text-gray-800">{ticker.id}</span>
            <span className="text-gray-600">MCAP: ${ticker.mcap.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}