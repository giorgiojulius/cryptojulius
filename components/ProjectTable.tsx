// components/ProjectTable.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProjectStore } from "@/store/useProjectStore";
import {
  calculateIntrinsicValue,
  calculateRecommendedBuyPrice,
  calculateMarginOfSafety,
} from "@/lib/analysis";
import { getTokenData } from "@/lib/api";
import { MARGIN_OF_SAFETY } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Save, AlertCircle, RefreshCw } from "lucide-react";
import Image from "next/image";

// Функция для создания задержки
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ProjectTable() {
  const { projects, removeProject, updateProject, updateMultipleProjects } = useProjectStore();
  const [deleteAddress, setDeleteAddress] = useState<string | null>(null);
  const [editMoat, setEditMoat] = useState<{ [key: string]: string }>({});
  const [logoErrors, setLogoErrors] = useState<{ [key: string]: boolean }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleMoatChange = (address: string, value: string) => {
    setEditMoat((prev) => ({ ...prev, [address]: value }));
  };

  const handleMoatSave = (address: string) => {
    const value = Number.parseFloat(editMoat[address]);
    if (isNaN(value) || value < 0 || value > 1) {
      alert("Фактор 'рва' должен быть числом от 0 до 1");
      return;
    }
    updateProject(address, { moatFactor: value });
    setEditMoat((prev) => {
      const newState = { ...prev };
      delete newState[address];
      return newState;
    });
  };

  const handleLogoError = (address: string, logoUrl: string | null) => {
    console.log(`Ошибка загрузки логотипа для ${address}: ${logoUrl ?? "URL отсутствует"}`);
    setLogoErrors((prev) => ({ ...prev, [address]: true }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updatedProjects = [];
      for (const project of projects) {
        try {
          console.log(`Обновление данных для ${project.address} (${project.name})`);
          const updatedData = await getTokenData(project.address, project.chainId, project.ath);
          updatedProjects.push({ ...project, ...updatedData });
          console.log(`Данные для ${project.address} успешно обновлены`);
          // Пауза 1 секунда между запросами
          await delay(2000);
        } catch (error) {
          console.error(`Ошибка при обновлении данных для ${project.address}:`, error);
          updatedProjects.push(project); // Сохраняем старые данные, если обновление не удалось
          await delay(1000); // Пауза даже при ошибке, чтобы не перегружать API
        }
      }
      updateMultipleProjects(updatedProjects);
    } catch (error) {
      console.error("Ошибка при обновлении проектов:", error);
      alert("Не удалось обновить данные. Проверьте консоль для деталей.");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white shadow-md rounded-xl">
        <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">Пока не добавлено ни одного проекта.</p>
        <p className="text-gray-400 text-sm mt-2">Добавьте проект, чтобы начать анализ.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Обновление..." : "Обновить данные"}
        </Button>
      </div>

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
              <TableHead className="text-gray-700 font-medium">Маржа безопасности</TableHead>
              <TableHead className="text-gray-700 font-medium w-[80px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const intrinsicValue = calculateIntrinsicValue(
                project.ath ?? project.currentPrice,
                project.moatFactor
              );
              const buyPrice = calculateRecommendedBuyPrice(intrinsicValue, MARGIN_OF_SAFETY);
              const marginOfSafety = calculateMarginOfSafety(intrinsicValue, project.currentPrice);
              const isEditingMoat = editMoat[project.address] !== undefined;
              const isBuyOpportunity = project.currentPrice < buyPrice;

              return (
                <TableRow key={project.address} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {project.logoUrl && !logoErrors[project.address] ? (
                        <Image
                          src={project.logoUrl}
                          alt={`${project.name} logo`}
                          width={24}
                          height={24}
                          className="rounded-full"
                          loading="lazy"
                          onError={() => handleLogoError(project.address, project.logoUrl)}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                          N/A
                        </div>
                      )}
                      {project.name}
                    </div>
                  </TableCell>
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
                  <TableCell className="font-medium text-gray-900">
                    {marginOfSafety !== null ? `${marginOfSafety.toFixed(2)}%` : "N/A"}
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
              );
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
                    removeProject(deleteAddress);
                    setDeleteAddress(null);
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
    </div>
  );
}