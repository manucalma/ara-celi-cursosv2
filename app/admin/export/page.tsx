"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthCheck } from "@/components/admin/auth-check"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"

export default function ExportPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Cargar los datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/content")
        const contentData = await response.json()
        setData(contentData)
      } catch (error) {
        console.error("Error al cargar los datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDownload = () => {
    if (!data) return

    // Crear un blob con los datos JSON
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })

    // Crear un enlace de descarga
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "content.json"
    document.body.appendChild(a)
    a.click()

    // Limpiar
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)
  }

  const handleBack = () => {
    router.push("/admin/dashboard")
  }

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Exportar Base de Datos</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
            <Button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !data}
            >
              <Download className="h-4 w-4" />
              Descargar JSON
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>content.json</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[600px] text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !data}
            >
              <Download className="h-4 w-4" />
              Descargar JSON
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AuthCheck>
  )
}

