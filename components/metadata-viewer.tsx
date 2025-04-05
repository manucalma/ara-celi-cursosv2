"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, X } from "lucide-react"
import type { OpenGraphPreview } from "@/types"

interface MetadataViewerProps {
  url?: string
}

export function MetadataViewer({ url = "" }: MetadataViewerProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [metadata, setMetadata] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [ogData, setOgData] = useState<OpenGraphPreview>({
    title: "Cargando...",
    description: "Cargando...",
    imageUrl: "/placeholder.svg",
    url: url || pathname || "https://ara-celi.org",
  })

  const fetchMetadata = async () => {
    setLoading(true)
    try {
      // Obtener la ruta actual
      const currentPath = pathname || ""
      const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "https://ara-celi.org")

      // Analizar la ruta para determinar qué contenido mostrar
      const pathParts = currentPath.split("/").filter(Boolean)

      // Obtener los datos de contenido
      const response = await fetch("/api/content")
      const data = await response.json()

      let title = "ARA-CELI - Cursos"
      let description = "Plataforma de cursos del Hospital del Alma"
      let imageUrl = "/images/logo.png"

      // Si estamos en una página de curso
      if (pathParts.length >= 2 && pathParts[0] === "cursos") {
        const cursoId = pathParts[1]
        const curso = data.cursos.find((c: any) => c.id === cursoId)

        if (curso) {
          title = `${curso.nombre} | ARA-CELI`
          description = curso.descripcion

          // Si estamos en una página de video específica
          if (pathParts.length >= 3) {
            const videoParam = pathParts[2]

            // Función recursiva para encontrar el contenido por urlParam
            const findContenidoByParam = (items: any[], param: string): any | null => {
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
            }
          } else {
            // Estamos en la página principal del curso, buscar el primer elemento multimedia
            const findFirstMultimedia = (items: any[]): string | null => {
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

      // Actualizar los datos de OpenGraph
      setOgData({
        title,
        description,
        imageUrl,
        url: currentUrl,
      })

      // Generar el código HTML de los metadatos
      const metaTags = `
<!-- Metadatos OpenGraph básicos -->
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${imageUrl.startsWith("http") ? imageUrl : `https://ara-celi.org${imageUrl}`}" />
<meta property="og:url" content="${currentUrl}" />
<meta property="og:type" content="website" />

<!-- Metadatos específicos para Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${imageUrl.startsWith("http") ? imageUrl : `https://ara-celi.org${imageUrl}`}" />

<!-- Metadatos adicionales -->
<meta property="og:site_name" content="ARA-CELI Hospital del Alma" />
<meta property="og:locale" content="es_ES" />
      `

      setMetadata(metaTags)
    } catch (error) {
      console.error("Error al obtener los metadatos:", error)
      // En caso de error, usar datos predeterminados
      setMetadata(`
<!-- Metadatos OpenGraph básicos -->
<meta property="og:title" content="ARA-CELI - Cursos" />
<meta property="og:description" content="Plataforma de cursos del Hospital del Alma" />
<meta property="og:image" content="https://ara-celi.org/images/logo.png" />
<meta property="og:url" content="${url || pathname || "https://ara-celi.org"}" />
<meta property="og:type" content="website" />

<!-- Metadatos específicos para Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="ARA-CELI - Cursos" />
<meta name="twitter:description" content="Plataforma de cursos del Hospital del Alma" />
<meta name="twitter:image" content="https://ara-celi.org/images/logo.png" />

<!-- Metadatos adicionales -->
<meta property="og:site_name" content="ARA-CELI Hospital del Alma" />
<meta property="og:locale" content="es_ES" />
      `)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setOpen(true)
    fetchMetadata()
  }

  const handleCopyToClipboard = () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(metadata)
        alert("Metadatos copiados al portapapeles")
      } else {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement("textarea")
        textArea.value = metadata
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        alert("Metadatos copiados al portapapeles")
      }
    } catch (error) {
      console.error("Error al copiar al portapapeles:", error)
      alert("No se pudo copiar al portapapeles. Intente seleccionar y copiar manualmente.")
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="flex items-center gap-1 h-8 px-2 text-xs"
        title="Mostrar metadatos OpenGraph"
      >
        <span className="font-mono bg-gray-200 px-1 rounded">M</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Metadatos OpenGraph</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="code" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="code">Código</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                <TabsTrigger value="facebook">Facebook</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="code" className="h-full flex flex-col space-y-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-[200px]">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <pre className="bg-gray-100 p-4 rounded-md overflow-auto flex-1 text-sm whitespace-pre-wrap word-break-all">
                        {metadata}
                      </pre>
                      <div className="flex justify-end mt-4">
                        <Button
                          onClick={handleCopyToClipboard}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Copy className="h-4 w-4" />
                          Copiar al portapapeles
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="whatsapp" className="h-full overflow-auto">
                  <div className="border rounded-lg p-4">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="aspect-video relative bg-gray-200">
                          <img
                            src={ogData.imageUrl || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-blue-600">{ogData.url}</h3>
                          <h4 className="font-bold">{ogData.title}</h4>
                          <p className="text-gray-600 text-sm line-clamp-2">{ogData.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="facebook" className="h-full overflow-auto">
                  <div className="border rounded-lg p-4">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="aspect-[1.91/1] relative bg-gray-200">
                          <img
                            src={ogData.imageUrl || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="text-xs text-gray-500 uppercase">ara-celi.org</h3>
                          <h4 className="font-bold">{ogData.title}</h4>
                          <p className="text-gray-600 text-sm line-clamp-2">{ogData.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

