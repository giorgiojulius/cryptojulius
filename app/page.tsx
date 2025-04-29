// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ProjectTable } from "@/components/ProjectTable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Анализ проектов</h1>
          <Link href="/add-project">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
              Добавить проект
            </button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Как рассчитывается "ров"?</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded-md max-w-xs">
                <p>
                  Фактор "рва" (Moat Factor) рассчитывается как: <br />
                  <code className="bg-gray-700 px-1 rounded">
                    All Time Low после All Time High / All Time High
                  </code>
                  <br />
                  Это отражает устойчивость проекта к рыночным колебаниям.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <ProjectTable />

        <Card className="shadow-md border-none bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Geostocks by Giorgio Julius</h3>
              <p className="text-sm opacity-90">
                Исследуйте другой проект от Giorgio Julius — платформу для анализа и управления активами.
              </p>
              <Link
                href="https://geostocks.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 bg-white text-purple-600 font-semibold px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Перейти на Geostocks
              </Link>
            </div>
            <Image
              src="/gj.jpg"
              alt="Giorgio Julius logo"
              width={48}
              height={48}
              className="rounded-full"
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}