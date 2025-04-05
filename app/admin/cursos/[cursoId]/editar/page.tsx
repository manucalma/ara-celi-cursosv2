"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthCheck } from "@/components/admin/auth-check"
import { CursoForm } from "@/components/admin/curso-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import type { Curso } from "@/types"

interface EditarCursoPageProps {
  params: {
    cursoId: string
  }
}

export default function EditarCursoPage({ params }: EditarCursoPageProps) {
  // Extraer cursoId usando React.use() al inicio del componente
  const cursoId = React.use(params).cursoId;
  
  const [curso, setCurso] = useState<Curso | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const response = await fetch("/api/content")
        const data = await response.json()

        const cursoEncontrado = data.cursos.find((c) => c.id === cursoId)
        if (cursoEncontrado) {
          setCurso(cursoEncontrado)
        } else {
          router.push("/admin/cursos")
        }
      } catch (error) {
        console.error("Error al obtener el curso:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurso()
  }, [cursoId, router])

  const handleSubmit = async (cursoData: Omit<Curso, "contenido">) => {
    try {
      const response = await fetch("/api/content")
      const data = await response.json()

      // Actualizar el curso existente
      const cursoIndex = data.cursos.findIndex((c) => c.id === cursoId)
      if (cursoIndex === -1) {
        throw new Error("Curso no encontrado")
      }

      // Mantener el contenido existente
      data.cursos[cursoIndex] = {
        ...cursoData,
        contenido: data.cursos[cursoIndex].contenido,
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

      router.push("/admin/cursos")
    } catch (error) {
      console.error("Error al actualizar el curso:", error)
      alert("Error al actualizar el curso: " + error.message)
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

  if (!curso) {
    return (
      <AuthCheck>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Curso no encontrado</h1>
        </div>
      </AuthCheck>
    )
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
          <h1 className="text-3xl font-bold">Editar Curso</h1>
        </div>
        <CursoForm curso={curso} onSubmit={handleSubmit} />
      </div>
    </AuthCheck>
  )
}