// app/add-project/page.tsx
import { AddProjectForm } from "@/components/AddProjectForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AddProjectPage() {
  console.log("Rendering AddProjectPage"); // Отладка
  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" className="border-gray-300 hover:bg-gray-100">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Назад
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-gray-800">Добавить новый проект</h1>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border-gray-200">
        <AddProjectForm />
      </div>
    </main>
  );
}