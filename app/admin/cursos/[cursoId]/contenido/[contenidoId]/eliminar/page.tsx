"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthCheck } from "@/components/admin/auth-check"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import type { ContenidoItem } from "@/types"

interface EliminarContenidoPageProps {
  params: {
    cursoId: string
    contenidoId: string
  }
}

export default function EliminarContenidoPage({ params }: EliminarContenidoPageProps) {
  const [contenido, setContenido] = useState<ContenidoItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchContenido = async () => {
      try {
        const response = await fetch("/api/content")
        const data = await response.json()

        const curso = data.cursos.find((c) => c.id === params.cursoId)
        if (!curso) {
          router.push("/admin/cursos")
          return
        }

        const findContenidoById = (items: ContenidoItem[]): ContenidoItem | null => {
          for (const item of items) {
            if (item.id === params.contenidoId) {
              return item
            }

            if (item.hijos && item.hijos.length > 0) {
              const found = findContenidoById(item.hijos)
              if (found) return found
            }
          }

          return null
        }

        const contenidoEncontrado = findContenidoById(curso.contenido)
        if (contenidoEncontrado) {
          setContenido(contenidoEncontrado)
        } else {
          router.push(`/admin/cursos/${params.cursoId}/contenido`)
        }
      } catch (error) {
        console.error("Error al obtener el contenido:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContenido()
  }, [params.cursoId, params.contenidoId, router])

  const handleDelete = async () => {
    try {
      setDeleting(true)

      const response = await fetch("/api/content")
      const data = await response.json()

      const curso = data.cursos.find((c) => c.id === params.cursoId)
      if (!curso) {
        throw new Error("Curso no encontrado")
      }

      const removeContenido = (items: ContenidoItem[]): boolean => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === params.contenidoId) {
            items.splice(i, 1)
            return true
          }

          if (items[i].hijos && items[i].hijos.length > 0) {
            if (removeContenido(items[i].hijos)) {
              return true
            }
          }
        }

        return false
      }

      if (!removeContenido(curso.contenido)) {
        throw new Error("Contenido no encontrado")
      }

      // Guardar los cambios
      await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token",
        },
        body: JSON.stringify(data),
      })

      router.push(`/admin/cursos/${params.cursoId}/contenido`)
    } catch (error) {
      console.error("Error al eliminar el contenido:", error)
      alert("Error al eliminar el contenido: " + error.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <AuthCheck>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </AuthCheck>
    )
  }

  if (!contenido) {
    return (
      <AuthCheck>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Contenido no encontrado</h1>
        </div>
      </AuthCheck>
    )
  }

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/cursos/${params.cursoId}/contenido`)}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Eliminar Contenido</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">¿Estás seguro de que deseas eliminar este contenido?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Estás a punto de eliminar el contenido <strong>{contenido.titulo}</strong>. Esta acción no se puede
              deshacer.
            </p>

            {contenido.hijos && contenido.hijos.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-md mb-4">
                <p className="text-yellow-800">
                  ¡Advertencia! Este contenido tiene {contenido.hijos.length} elementos hijos que también serán
                  eliminados.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => router.push(`/admin/cursos/${params.cursoId}/contenido`)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthCheck>
  )
}

