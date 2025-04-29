import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function TickerManager() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [newTicker, setNewTicker] = useState('');

  // Загрузка тикеров при монтировании компонента
  useEffect(() => {
    fetch('/api/tickers')
      .then(res => res.json())
      .then(data => setTickers(data));
  }, []);

  // Добавление нового тикера
  const addTicker = async () => {
    if (newTicker.trim()) {
      await fetch('/api/tickers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: newTicker.trim() }),
      });
      setTickers([...tickers, newTicker.trim()]);
      setNewTicker('');
    }
  };

  // Удаление тикера
  const removeTicker = async (ticker: string) => {
    await fetch('/api/tickers/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
    });
    setTickers(tickers.filter(t => t !== ticker));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Управление тикерами</h2>
      <ul className="list-disc pl-5">
        {tickers.map(ticker => (
          <li key={ticker} className="flex justify-between items-center">
            {ticker}
            <Button
              onClick={() => removeTicker(ticker)}
              className="ml-2 bg-red-500 hover:bg-red-600 text-white"
            >
              Удалить
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex space-x-2">
        <Input
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
          placeholder="Новый тикер"
        />
        <Button onClick={addTicker} className="bg-green-500 hover:bg-green-600 text-white">
          Добавить
        </Button>
      </div>
    </div>
  );
}