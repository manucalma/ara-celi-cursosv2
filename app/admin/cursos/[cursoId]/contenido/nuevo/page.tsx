"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthCheck } from "@/components/admin/auth-check"
import { ContenidoForm } from "@/components/admin/contenido-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import type { ContenidoItem } from "@/types"

interface NuevoContenidoPageProps {
  params: {
    cursoId: string
  }
}

export default function NuevoContenidoPage({ params }: NuevoContenidoPageProps) {
  // Extraer cursoId usando React.use() al inicio del componente
  const cursoId = React.use(params).cursoId;
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const parentId = searchParams.get("parentId")

  const handleSubmit = async (contenidoData: Omit<ContenidoItem, "hijos">) => {
    try {
      const response = await fetch("/api/content")
      const data = await response.json()

      const curso = data.cursos.find((c) => c.id === cursoId)
      if (!curso) {
        throw new Error("Curso no encontrado")
      }

      // Crear el nuevo item de contenido
      const newItem: ContenidoItem = {
        ...contenidoData,
        hijos: [],
      }

      // Si hay un parentId, añadir como hijo
      if (parentId) {
        const addToParent = (items: ContenidoItem[]): boolean => {
          for (let i = 0; i < items.length; i++) {
            if (items[i].id === parentId) {
              items[i].hijos.push(newItem)
              return true
            }

            if (items[i].hijos && items[i].hijos.length > 0) {
              if (addToParent(items[i].hijos)) {
                return true
              }
            }
          }

          return false
        }

        if (!addToParent(curso.contenido)) {
          throw new Error("Padre no encontrado")
        }
      } else {
        // Añadir al nivel principal
        curso.contenido.push(newItem)
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

      router.push(`/admin/cursos/${cursoId}/contenido`)
    } catch (error) {
      console.error("Error al crear el contenido:", error)
      alert("Error al crear el contenido: " + error.message)
    }
  }

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/cursos/${cursoId}/contenido`)}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Nuevo Contenido</h1>
        </div>
        <ContenidoForm cursoId={cursoId} parentId={parentId || undefined} onSubmit={handleSubmit} />
      </div>
    </AuthCheck>
  )
}