"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search } from "lucide-react"

export function AnalyzeForm({ onSubmit }: { onSubmit: (projectId: string) => void }) {
  const [projectId, setProjectId] = useState("")

  const handleSubmit = () => {
    if (projectId.trim()) {
      onSubmit(projectId.trim())
    }
  }

  return (
    <Card className="bg-white shadow-md border-none">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Анализ проекта</CardTitle>
        <CardDescription>Введите ID проекта для анализа</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="ID проекта (например, ethereum)"
            className="pr-10 border-gray-200 focus:ring-purple-500 focus:border-purple-500"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button onClick={handleSubmit} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium">
          Анализировать
        </Button>
      </CardContent>
    </Card>
  )
}

export function AnalyzeResult({
  result,
}: {
  result: { contract: string; mcap: number; liquidity: number; moat: number }
}) {
  return (
    <Card className="mt-6 shadow-md border-none">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Результаты анализа</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Контракт</p>
            <p className="font-mono text-gray-900 break-all">{result.contract}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">MCAP</p>
            <p className="text-lg font-medium text-emerald-600">${result.mcap.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Ликвидность</p>
            <p className="text-lg font-medium text-amber-600">${result.liquidity.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Ров</p>
            <p className="text-lg font-medium text-purple-600">{result.moat.toFixed(4)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
