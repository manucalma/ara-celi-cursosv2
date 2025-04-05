"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Edit,
  Eye,
  EyeOff,
  Plus,
  ArrowUp,
  ArrowDown,
  Video,
  FileText,
  FileAudio,
  FileIcon as FilePdf,
  Check,
  X,
  AlertTriangle,
} from "lucide-react"
import { ShareContent } from "@/components/admin/share-content"
import type { ContenidoItem, Curso } from "@/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TreeEditorProps {
  curso: Curso
  onUpdate: (curso: Curso) => Promise<void>
}

export function TreeEditor({ curso, onUpdate }: TreeEditorProps) {
  const router = useRouter()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalCurso, setOriginalCurso] = useState<string>("")

  useEffect(() => {
    // Guardar el estado original del curso para comparar cambios
    setOriginalCurso(JSON.stringify(curso))
  }, [])

  useEffect(() => {
    // Comprobar si hay cambios no guardados
    const currentCursoString = JSON.stringify(curso)
    setHasUnsavedChanges(currentCursoString !== originalCurso && originalCurso !== "")
  }, [curso, originalCurso])

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const handleEdit = (itemId: string) => {
    router.push(`/admin/cursos/${curso.id}/contenido/${itemId}/editar`)
  }

  const handleAddItem = (parentId?: string) => {
    const url = parentId
      ? `/admin/cursos/${curso.id}/contenido/nuevo?parentId=${parentId}`
      : `/admin/cursos/${curso.id}/contenido/nuevo`
    router.push(url)
  }

  const toggleActive = async (item: ContenidoItem) => {
    // Clonar el curso para no mutar el original
    const cursoCopy = JSON.parse(JSON.stringify(curso))

    const updateItem = (items: ContenidoItem[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === item.id) {
          items[i].activo = !items[i].activo
          return true
        }

        if (items[i].hijos && items[i].hijos.length > 0) {
          if (updateItem(items[i].hijos)) {
            return true
          }
        }
      }

      return false
    }

    updateItem(cursoCopy.contenido)
    await onUpdate(cursoCopy)
  }

  const toggleVisibility = async (item: ContenidoItem) => {
    // Clonar el curso para no mutar el original
    const cursoCopy = JSON.parse(JSON.stringify(curso))

    const updateItem = (items: ContenidoItem[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === item.id) {
          items[i].visible = !items[i].visible
          return true
        }

        if (items[i].hijos && items[i].hijos.length > 0) {
          if (updateItem(items[i].hijos)) {
            return true
          }
        }
      }

      return false
    }

    updateItem(cursoCopy.contenido)
    await onUpdate(cursoCopy)
  }

  const moveItemUp = async (item: ContenidoItem, parentItems: ContenidoItem[]) => {
    // Clonar el curso para no mutar el original
    const cursoCopy = JSON.parse(JSON.stringify(curso))

    const updateOrder = (items: ContenidoItem[]): boolean => {
      const index = items.findIndex((i) => i.id === item.id)
      if (index > 0) {
        // Intercambiar órdenes
        const tempOrden = items[index].orden
        items[index].orden = items[index - 1].orden
        items[index - 1].orden = tempOrden

        // Reordenar el array
        items.sort((a, b) => a.orden - b.orden)
        return true
      }

      for (const i of items) {
        if (i.hijos && i.hijos.length > 0) {
          if (updateOrder(i.hijos)) {
            return true
          }
        }
      }

      return false
    }

    updateOrder(cursoCopy.contenido)
    await onUpdate(cursoCopy)
  }

  const moveItemDown = async (item: ContenidoItem, parentItems: ContenidoItem[]) => {
    // Clonar el curso para no mutar el original
    const cursoCopy = JSON.parse(JSON.stringify(curso))

    const updateOrder = (items: ContenidoItem[]): boolean => {
      const index = items.findIndex((i) => i.id === item.id)
      if (index >= 0 && index < items.length - 1) {
        // Intercambiar órdenes
        const tempOrden = items[index].orden
        items[index].orden = items[index + 1].orden
        items[index + 1].orden = tempOrden

        // Reordenar el array
        items.sort((a, b) => a.orden - b.orden)
        return true
      }

      for (const i of items) {
        if (i.hijos && i.hijos.length > 0) {
          if (updateOrder(i.hijos)) {
            return true
          }
        }
      }

      return false
    }

    updateOrder(cursoCopy.contenido)
    await onUpdate(cursoCopy)
  }

  const renderContentTypeIcons = (item: ContenidoItem) => {
    return (
      <div className="flex items-center gap-1">
        <TooltipProvider>
          {item.videoUrl && (
            <Tooltip>
              <TooltipTrigger>
                <div className="text-blue-500">
                  <Video className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contiene video</p>
              </TooltipContent>
            </Tooltip>
          )}

          {item.audioUrl && (
            <Tooltip>
              <TooltipTrigger>
                <div className="text-green-500">
                  <FileAudio className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contiene audio</p>
              </TooltipContent>
            </Tooltip>
          )}

          {item.textoRich && (
            <Tooltip>
              <TooltipTrigger>
                <div className="text-amber-500">
                  <FileText className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contiene texto</p>
              </TooltipContent>
            </Tooltip>
          )}

          {item.pdfUrl && (
            <Tooltip>
              <TooltipTrigger>
                <div className="text-red-500">
                  <FilePdf className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contiene PDF</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    )
  }

  const renderTreeItems = (items: ContenidoItem[], level = 0, parentItems: ContenidoItem[] = []) => {
    return items
      .sort((a, b) => a.orden - b.orden)
      .map((item, index) => {
        const isExpanded = expandedItems[item.id]
        const hasChildren = item.hijos && item.hijos.length > 0

        return (
          <div key={item.id} className={`mt-2 ${level > 0 ? `ml-${level * 4}` : ""}`}>
            <Card className={`${!item.activo ? "opacity-60" : ""}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {hasChildren && (
                      <Button variant="ghost" size="sm" onClick={() => toggleExpand(item.id)} className="p-1 h-auto">
                        {isExpanded ? "▼" : "►"}
                      </Button>
                    )}
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {item.titulo}
                        {renderContentTypeIcons(item)}
                      </div>
                      <div className="text-sm text-gray-500">{item.descripcion}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(item)}
                            className={`p-1 h-auto ${item.activo ? "text-green-500" : "text-gray-400"}`}
                          >
                            {item.activo ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.activo ? "Activo" : "Inactivo"}</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleVisibility(item)}
                            className="p-1 h-auto"
                          >
                            {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.visible ? "Visible" : "Oculto"}</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item.id)} className="p-1 h-auto">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItemUp(item, parentItems)}
                            disabled={index === 0}
                            className="p-1 h-auto"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mover arriba</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItemDown(item, parentItems)}
                            disabled={index === parentItems.length - 1}
                            className="p-1 h-auto"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mover abajo</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddItem(item.id)}
                            className="p-1 h-auto"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Añadir elemento</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <ShareContent item={item} includeChildren={hasChildren} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {hasChildren && isExpanded && (
              <div className="pl-4 border-l-2 border-gray-200 ml-4 mt-2">
                {renderTreeItems(item.hijos, level + 1, item.hijos)}
              </div>
            )}
          </div>
        )
      })
  }

  return (
    <div className="space-y-4">
      {hasUnsavedChanges && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>Hay cambios sin guardar. Haz clic en "Guardar Cambios" para conservarlos.</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Árbol de Contenido</h2>
        <Button onClick={() => handleAddItem()} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Añadir Elemento Raíz
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Estructura del Curso</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/cursos/${curso.id}/editar`)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Curso
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {curso.contenido.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay contenido disponible para este curso.</p>
              <Button className="mt-4" onClick={() => handleAddItem()}>
                <Plus className="mr-2 h-4 w-4" />
                Añadir Contenido
              </Button>
            </div>
          ) : (
            <div className="space-y-2">{renderTreeItems(curso.contenido, 0, curso.contenido)}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

