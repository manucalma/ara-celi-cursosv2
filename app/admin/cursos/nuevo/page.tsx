"use client"

import { useRouter } from "next/navigation"
import { AuthCheck } from "@/components/admin/auth-check"
import { CursoForm } from "@/components/admin/curso-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Curso } from "@/types"

export default function NuevoCursoPage() {
  const router = useRouter()

  const handleSubmit = async (cursoData: Omit<Curso, "contenido">) => {
    try {
      const response = await fetch("/api/content")
      const data = await response.json()

      // Verificar si ya existe un curso con el mismo ID
      if (data.cursos.some((c) => c.id === cursoData.id)) {
        throw new Error("Ya existe un curso con este ID")
      }

      // Añadir el nuevo curso
      const newCurso: Curso = {
        ...cursoData,
        contenido: [],
      }

      data.cursos.push(newCurso)

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
      console.error("Error al crear el curso:", error)
      alert("Error al crear el curso: " + error.message)
    }
  }

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/cursos")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Nuevo Curso</h1>
        </div>
        <CursoForm onSubmit={handleSubmit} />
      </div>
    </AuthCheck>
  )
}

