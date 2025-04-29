// components/AddProjectForm.tsx
"use client";

import { useState, useCallback } from "react";
import { searchTokens, getTokenData } from "@/lib/api";
import { useProjectStore } from "@/store/useProjectStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import Image from "next/image";

const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

export function AddProjectForm() {
  console.log("Rendering AddProjectForm");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [moatFactor, setMoatFactor] = useState("0.2");
  const [logoErrors, setLogoErrors] = useState<{ [key: string]: boolean }>({});
  const { addProject } = useProjectStore();

  const handleSearch = useCallback(async () => {
    console.log("Performing search for:", query);
    const results = await searchTokens(query);
    setSearchResults(results);
  }, [query]);

  const handleSelectToken = useCallback(async (token: any) => {
    console.log("Selecting token:", token);
    try {
      const data = await getTokenData(token.address, token.chainId);
      console.log("Selected token data:", data);
      setSelectedToken(data);
    } catch (error) {
      console.error("Ошибка при выборе токена:", error);
      alert("Не удалось загрузить данные токена");
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedToken) {
      const parsedMoatFactor = Number.parseFloat(moatFactor);
      if (isNaN(parsedMoatFactor) || parsedMoatFactor < 0 || parsedMoatFactor > 1) {
        alert("Фактор 'рва' должен быть числом от 0 до 1");
        return;
      }
      const project = {
        ...selectedToken,
        moatFactor: parsedMoatFactor,
        timestamp: Date.now(),
      };
      console.log("Adding project:", project);
      addProject(project);
      setSelectedToken(null);
      setQuery("");
      setSearchResults([]);
      setMoatFactor("0.2");
    }
  }, [selectedToken, moatFactor, addProject]);

  const handleLogoError = (address: string) => {
    setLogoErrors((prev) => ({ ...prev, [address]: true }));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {selectedToken && (
        <Card className="shadow-md border-none bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-gray-900">Выбранный токен</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-white border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-gray-900">
                  {selectedToken.logoUrl && !logoErrors[selectedToken.address] ? (
                    <Image
                      src={selectedToken.logoUrl}
                      alt={`${selectedToken.name} logo`}
                      width={24}
                      height={24}
                      className="rounded-full"
                      loading="lazy"
                      onError={() => handleLogoError(selectedToken.address)}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                  )}
                  {selectedToken.name}{" "}
                  <Badge variant="outline" className="ml-2">
                    {selectedToken.symbol}
                  </Badge>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {selectedToken.blockchain}
                </Badge>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Адрес:</span>
                  <span className="font-mono text-gray-900">{shortenAddress(selectedToken.address)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">DEX:</span>
                  <span className="text-gray-900">{selectedToken.poolType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Текущая цена:</span>
                  <span className="text-emerald-600 font-medium">${selectedToken.currentPrice.toFixed(3)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">ATH:</span>
                  <span className="text-amber-600 font-medium">
                    {selectedToken.ath !== null ? `$${selectedToken.ath.toFixed(2)}` : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moatFactor" className="text-gray-700">
                Фактор 'рва' (0–1)
              </Label>
              <Input
                id="moatFactor"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={moatFactor}
                onChange={(e) => setMoatFactor(e.target.value)}
                placeholder="Введите фактор 'рва'"
                className="border-gray-200 focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-xs text-gray-500">
                Фактор 'рва' определяет устойчивость проекта к конкуренции и рыночным колебаниям
              </p>
            </div>

            <Button onClick={handleSubmit} className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Добавить проект
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md border-none">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Поиск токена</CardTitle>
          <CardDescription>Найдите токен по названию или символу</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="search"
                placeholder="Введите название или символ"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-10 border-gray-200 focus:ring-purple-500 focus:border-purple-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
              Найти
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Результаты поиска</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {searchResults.map((token) => (
                <li
                  key={token.pairAddress}
                  onClick={() => handleSelectToken(token)}
                  className="cursor-pointer p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition border border-gray-200 hover:border-purple-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      {token.logoUrl && !logoErrors[token.address] ? (
                        <Image
                          src={token.logoUrl}
                          alt={`${token.name} logo`}
                          width={24}
                          height={24}
                          className="rounded-full"
                          loading="lazy"
                          onError={() => handleLogoError(token.address)}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                      )}
                      {token.name}{" "}
                      <Badge variant="outline" className="ml-2">
                        {token.symbol}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      {token.blockchain}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Адрес: {shortenAddress(token.address)}</span>
                    <span>Пул: {shortenAddress(token.pairAddress)}</span>
                    <span>DEX: {token.poolType}</span>
                  </div>
                  <div className="mt-2 text-sm flex gap-4">
                    <span className="text-emerald-600">Ликвидность: {formatNumber(token.liquidityUsd)}</span>
                    <span className="text-amber-600">Объём (24ч): {formatNumber(token.volume24h)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}