"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthCheck } from "@/components/admin/auth-check"
import { AdminMenu } from "@/components/admin/admin-menu"
import { ShareContent } from "@/components/admin/share-content"
import { VideoPlayer } from "@/components/video-player"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft, Home } from 'lucide-react'
import type { ContenidoItem, Curso } from "@/types"
import { formatRichText } from "@/lib/format-utils"

interface PreviewPageProps {
  params: {
    cursoId: string
    videoParam: string
  }
}

export default function PreviewPage({ params }: PreviewPageProps) {
  // Extraer cursoId y videoParam usando React.use()
  const { cursoId, videoParam } = React.use(params)
  
  const [curso, setCurso] = useState<Curso | null>(null)
  const [contenido, setContenido] = useState<ContenidoItem | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/content")
        const data = await response.json()

        const cursoEncontrado = data.cursos.find((c: Curso) => c.id === cursoId)
        if (!cursoEncontrado) {
          router.push("/admin/cursos")
          return
        }

        setCurso(cursoEncontrado)

        // Buscar el contenido por el parámetro de URL
        const findContenidoByParam = (items: ContenidoItem[], param: string): ContenidoItem | null => {
          for (const item of items) {
            if (item.urlParam === param || item.urlParam.replace(/-/g, "_") === param) {
              return item
            }

            if (item.hijos && item.hijos.length > 0) {
              const found = findContenidoByParam(item.hijos, param)
              if (found) return found
            }
          }

          return null
        }

        const contenidoEncontrado = findContenidoByParam(cursoEncontrado.contenido, videoParam)
        if (contenidoEncontrado) {
          setContenido(contenidoEncontrado)
        } else {
          router.push(`/admin/cursos/${cursoId}/contenido`)
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [cursoId, videoParam, router])

  const handleEdit = () => {
    if (contenido) {
      router.push(`/admin/cursos/${cursoId}/contenido/${contenido.id}/editar`)
    }
  }

  const handleBack = () => {
    router.push(`/admin/cursos/${cursoId}/contenido`)
  }

  const handleGoHome = () => {
    router.push(`/cursos/${cursoId}`)
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

  if (!curso || !contenido) {
    return (
      <AuthCheck>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Contenido no encontrado</h1>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </AuthCheck>
    )
  }

  // Verificar si es un video individual o una fase
  const isPhase = contenido.hijos && contenido.hijos.length > 0

  // Si es una fase, obtener todos los videos hijos
  const phaseVideos = isPhase ? contenido.hijos : []

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button variant="outline" onClick={handleGoHome}>
              <Home className="mr-2 h-4 w-4" />
              Ver en Frontend
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{contenido.titulo}</h1>
              <p className="text-gray-600">Vista previa</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShareContent item={contenido} includeChildren={isPhase} />
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <AdminMenu cursoId={cursoId} videoParam={videoParam} />
          </div>
        </div>

        {isPhase ? (
          // Mostrar todos los videos de la fase
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {phaseVideos.map((item) => (
              <Card key={item.id} className={`${!item.activo ? "opacity-60" : ""}`}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{item.titulo}</span>
                    <div className="flex items-center gap-2">
                      {!item.activo && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Inactivo</span>
                      )}
                      {!item.visible && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Oculto</span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {item.videoUrl && item.coverUrl ? (
                    <VideoPlayer videoUrl={item.videoUrl} coverUrl={item.coverUrl} title={item.titulo} isAdmin={true} />
                  ) : (
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">Sin video</p>
                    </div>
                  )}

                  <p className="text-gray-600 mt-4">{item.descripcion}</p>

                  {item.textoRich && (
                    <div className="mt-4 prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: formatRichText(item.textoRich) }} />
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <ShareContent item={item} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Mostrar un solo video
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{contenido.titulo}</span>
                <div className="flex items-center gap-2">
                  {!contenido.activo && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Inactivo</span>
                  )}
                  {!contenido.visible && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Oculto</span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {contenido.videoUrl && contenido.coverUrl ? (
                <VideoPlayer
                  videoUrl={contenido.videoUrl}
                  coverUrl={contenido.coverUrl}
                  title={contenido.titulo}
                  isAdmin={true}
                />
              ) : (
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Sin video</p>
                </div>
              )}

              <div className="mt-6">
                <p className="text-gray-600">{contenido.descripcion}</p>

                {contenido.textoRich && (
                  <div className="mt-4 prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: formatRichText(contenido.textoRich) }} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthCheck>
  )
}