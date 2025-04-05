"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { MetadataViewer } from "@/components/metadata-viewer"

interface AdminMenuProps {
  cursoId?: string
  videoParam?: string
  onSave?: () => Promise<boolean>
  showSaveButton?: boolean
}

export function AdminMenu({ cursoId, videoParam, onSave, showSaveButton }: AdminMenuProps) {
  const [openDialog, setOpenDialog] = useState<"og-preview" | null>(null)
  const [ogPreview, setOgPreview] = useState({
    title: "",
    description: "",
    imageUrl: "",
    url: "",
  })
  const [apiKey, setApiKey] = useState("")
  const [isApiKeyValid, setIsApiKeyValid] = useState(false)
  const router = useRouter()

  const handleShowOgPreview = async () => {
    // Declare variables
    let cursoId
    let videoParam
    let setOgPreview
    let setOpenDialog

    try {
      // Obtener los datos del curso y contenido actual
      const response = await fetch("/api/content")
      const data = await response.json()

      let title = "ARA-CELI - Cursos"
      let description = "Plataforma de cursos del Hospital del Alma"
      let imageUrl = "/images/logo.png"
      let url = "https://ara-celi.org"

      if (cursoId) {
        const curso = data.cursos.find((c) => c.id === cursoId)
        if (curso) {
          title = `${curso.nombre} | ARA-CELI`
          description = curso.descripcion
          url = `https://ara-celi.org/cursos/${cursoId}`

          if (videoParam) {
            // Función recursiva para encontrar el contenido por urlParam
            const findContenidoByParam = (items, param) => {
              for (const item of items) {
                if (item.urlParam === param) {
                  return item
                }

                if (item.hijos && item.hijos.length > 0) {
                  const found = findContenidoByParam(item.hijos, param)
                  if (found) return found
                }
              }

              return null
            }

            const contenido = findContenidoByParam(curso.contenido, videoParam)

            if (contenido) {
              title = `${contenido.titulo} | ${curso.nombre} | ARA-CELI`
              description = contenido.descripcion
              if (contenido.coverUrl) {
                imageUrl = contenido.coverUrl
              }
              url = `https://ara-celi.org/cursos/${cursoId}/${videoParam}`
            }
          } else {
            // Buscar el primer elemento multimedia
            const findFirstMultimedia = (items) => {
              for (const item of items) {
                if (item.activo && item.visible && item.coverUrl) {
                  return item.coverUrl
                }

                if (item.hijos && item.hijos.length > 0) {
                  const found = findFirstMultimedia(item.hijos)
                  if (found) return found
                }
              }

              return null
            }

            const firstCover = findFirstMultimedia(curso.contenido)
            if (firstCover) {
              imageUrl = firstCover
            }
          }
        }
      }

      setOgPreview({
        title,
        description,
        imageUrl,
        url,
      })
    } catch (error) {
      console.error("Error al obtener los metadatos:", error)
    }

    setOpenDialog("og-preview")
  }

  const handleSave = async () => {
    if (onSave) {
      const success = await onSave()
      if (success) {
        router.refresh()
      }
    }
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        {showSaveButton && (
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
            Guardar Cambios
          </Button>
        )}
        <MetadataViewer url={`https://ara-celi.org/cursos/${cursoId}/${videoParam}`} />
      </div>

      <Dialog open={openDialog === "og-preview"} onOpenChange={(open) => setOpenDialog(open ? "og-preview" : null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vista Previa OpenGraph</DialogTitle>
            <DialogDescription>Así se verá la vista previa al compartir en redes sociales.</DialogDescription>
          </DialogHeader>

          <div className="bg-gray-100 rounded-lg p-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-video relative bg-gray-200">
                <img
                  src={ogPreview.imageUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-blue-600">{ogPreview.url}</h3>
                <h4 className="font-bold">{ogPreview.title}</h4>
                <p className="text-gray-600 text-sm line-clamp-2">{ogPreview.description}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

