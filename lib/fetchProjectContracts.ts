import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'data', 'cache.json');

// Интерфейс для ответа CoinGecko
interface CoinGeckoResponse {
  platforms?: Record<string, string>;
}

export async function fetchProjectContracts(projectId: string): Promise<string[]> {
  // Проверка кэша
  if (fs.existsSync(CACHE_FILE)) {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    if (cache[projectId] && Array.isArray(cache[projectId].contracts)) {
      return cache[projectId].contracts;
    }
  }

  // Запрос к CoinGecko
  const url = `https://api.coingecko.com/api/v3/coins/${projectId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Ошибка при запросе к CoinGecko');
    }
    const data: CoinGeckoResponse = await response.json();

    // Получение и фильтрация контрактов
    const contracts: string[] = data.platforms
      ? Object.values(data.platforms).filter((contract): contract is string => typeof contract === 'string')
      : [];

    // Сохранение в кеш
    const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')) : {};
    cache[projectId] = { contracts };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

    return contracts;
  } catch (error) {
    console.error(error);
    throw new Error('API CoinGecko недоступен или неверный ID проекта');
  }
}