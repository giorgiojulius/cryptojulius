// app/page.tsx
import { ProjectTable } from "@/components/ProjectTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Julius Crypto Analysis</h1>
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
          <Link href="/add-project">Добавить проект</Link>
        </Button>
      </div>
      <div className="bg-white shadow-md rounded-lg border-none">
        <ProjectTable />
      </div>
    </main>
  );
}