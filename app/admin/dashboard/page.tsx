import Link from "next/link"
import { AuthCheck } from "@/components/admin/auth-check"
import { getContentData } from "@/lib/content-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileJson, Video, BookOpen, ArrowLeft } from "lucide-react"

export default async function DashboardPage() {
  const data = await getContentData()

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/admin" passHref>
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Cursos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data.cursos.length}</p>
              <p className="text-gray-500 mt-1">Cursos disponibles</p>
              <Button asChild className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/admin/cursos">Gestionar Cursos</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="mr-2 h-5 w-5" />
                Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {data.cursos.reduce((total, curso) => {
                  const countVideos = (items) => {
                    let count = 0
                    for (const item of items) {
                      if (item.videoUrl) count++
                      if (item.hijos && item.hijos.length > 0) {
                        count += countVideos(item.hijos)
                      }
                    }
                    return count
                  }

                  return total + countVideos(curso.contenido)
                }, 0)}
              </p>
              <p className="text-gray-500 mt-1">Videos totales</p>
              <Button asChild className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/admin/contenido">Gestionar Contenido</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileJson className="mr-2 h-5 w-5" />
                Exportar Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">Exportar la base de datos en formato JSON</p>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/admin/export">Ver JSON</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthCheck>
  )
}

