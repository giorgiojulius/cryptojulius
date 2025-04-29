import { ProjectTable } from "@/components/ProjectTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-6 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Julius Crypto Analysis</h1>
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
          <Link href="/add-project">Добавить проект</Link>
        </Button>
      </div>
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
        <ProjectTable />
      </div>
    </main>
  )
}
