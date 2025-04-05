"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthCheck } from "@/components/admin/auth-check"
import { AdminMenu } from "@/components/admin/admin-menu"
import { TreeEditor } from "@/components/admin/tree-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from 'lucide-react'
import type { Curso } from "@/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ContenidoPageProps {
  params: {
    cursoId: string
  }
}

export default function ContenidoPage({ params }: ContenidoPageProps) {
  // Extraer cursoId usando React.use()
  const cursoId = React.use(params).cursoId
  
  const [curso, setCurso] = useState<Curso | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const response = await fetch("/api/content")
        const data = await response.json()

        const cursoEncontrado = data.cursos.find((c: Curso) => c.id === cursoId)
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

  const handleUpdateCurso = async (updatedCurso: Curso) => {
    try {
      const response = await fetch("/api/content")
      const data = await response.json()

      const cursoIndex = data.cursos.findIndex((c: Curso) => c.id === cursoId)
      if (cursoIndex === -1) {
        throw new Error("Curso no encontrado")
      }

      data.cursos[cursoIndex] = updatedCurso

      await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token",
        },
        body: JSON.stringify(data),
      })

      setCurso(updatedCurso)
      setSaveSuccess(true)

      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)

      return true
    } catch (error) {
      console.error("Error al actualizar el curso:", error)
      alert("Error al actualizar el curso: " + error.message)
      return false
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
        {saveSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Cambios guardados</AlertTitle>
            <AlertDescription>Los cambios se han guardado correctamente.</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/cursos")} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Cursos
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{curso.nombre}</h1>
              <p className="text-gray-600">Gestión de Contenido</p>
            </div>
          </div>
          <AdminMenu
            cursoId={cursoId}
            onSave={async () => {
              if (curso) {
                return handleUpdateCurso(curso)
              }
              return false
            }}
            showSaveButton={true}
          />
        </div>

        <TreeEditor curso={curso} onUpdate={handleUpdateCurso} />
      </div>
    </AuthCheck>
  )
}