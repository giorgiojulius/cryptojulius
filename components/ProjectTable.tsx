"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useProjectStore } from "@/store/useProjectStore"
import { calculateIntrinsicValue, calculateRecommendedBuyPrice } from "@/lib/analysis"
import { MARGIN_OF_SAFETY } from "@/lib/constants"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Save, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ProjectTable() {
  const { projects, removeProject, updateProject } = useProjectStore()
  const [deleteAddress, setDeleteAddress] = useState<string | null>(null)
  const [editMoat, setEditMoat] = useState<{ [key: string]: string }>({})

  const handleMoatChange = (address: string, value: string) => {
    setEditMoat((prev) => ({ ...prev, [address]: value }))
  }

  const handleMoatSave = (address: string) => {
    const value = Number.parseFloat(editMoat[address])
    if (isNaN(value) || value < 0 || value > 1) {
      alert("Фактор 'рва' должен быть числом от 0 до 1")
      return
    }
    updateProject(address, { moatFactor: value })
    setEditMoat((prev) => {
      const newState = { ...prev }
      delete newState[address]
      return newState
    })
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white shadow-md rounded-xl">
        <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">Пока не добавлено ни одного проекта.</p>
        <p className="text-gray-400 text-sm mt-2">Добавьте проект, чтобы начать анализ.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-gray-700 font-medium">Название</TableHead>
            <TableHead className="text-gray-700 font-medium">Символ</TableHead>
            <TableHead className="text-gray-700 font-medium">Текущая цена</TableHead>
            <TableHead className="text-gray-700 font-medium">ATH</TableHead>
            <TableHead className="text-gray-700 font-medium">Фактор "рва"</TableHead>
            <TableHead className="text-gray-700 font-medium">Внутренняя стоимость</TableHead>
            <TableHead className="text-gray-700 font-medium">Рекомендуемая цена</TableHead>
            <TableHead className="text-gray-700 font-medium w-[80px]">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const intrinsicValue = calculateIntrinsicValue(project.ath ?? project.currentPrice, project.moatFactor)
            const buyPrice = calculateRecommendedBuyPrice(intrinsicValue, MARGIN_OF_SAFETY)
            const isEditingMoat = editMoat[project.address] !== undefined

            // Determine if current price is below recommended buy price
            const isBuyOpportunity = project.currentPrice < buyPrice

            return (
              <TableRow key={project.address} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium text-gray-900">{project.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 font-medium">
                    {project.symbol}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  ${typeof project.currentPrice === "number" ? project.currentPrice.toFixed(3) : "N/A"}
                </TableCell>
                <TableCell className="font-medium text-amber-600">
                  {project.ath !== null ? `$${project.ath.toFixed(2)}` : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isEditingMoat ? editMoat[project.address] : project.moatFactor.toString()}
                      onChange={(e) => handleMoatChange(project.address, e.target.value)}
                      className="w-20 border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {isEditingMoat && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoatSave(project.address)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-emerald-600">${intrinsicValue.toFixed(3)}</TableCell>
                <TableCell className={`font-medium ${isBuyOpportunity ? "text-green-600" : "text-gray-900"}`}>
                  ${buyPrice.toFixed(3)}
                  {isBuyOpportunity && (
                    <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Выгодно</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteAddress(project.address)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    aria-label={`Удалить ${project.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <AlertDialog open={deleteAddress !== null} onOpenChange={() => setDeleteAddress(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Вы уверены, что хотите удалить проект{" "}
              <span className="font-medium text-gray-900">
                {projects.find((p) => p.address === deleteAddress)?.name || ""}
              </span>
              ? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteAddress) {
                  removeProject(deleteAddress)
                  setDeleteAddress(null)
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
