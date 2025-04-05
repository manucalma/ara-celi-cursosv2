"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share, Check, Copy } from "lucide-react"
import type { ContenidoItem } from "@/types"

interface ShareContentProps {
  item: ContenidoItem
  includeChildren?: boolean
}

export function ShareContent({ item, includeChildren = false }: ShareContentProps) {
  const [open, setOpen] = useState(false)
  const [shareText, setShareText] = useState(item.whatsappText || "")
  const [shared, setShared] = useState<Record<string, boolean>>({
    whatsapp: false,
    telegram: false,
    facebook: false,
  })
  const [activeTab, setActiveTab] = useState("whatsapp")

  const generateShareText = () => {
    let text = item.whatsappText || `${item.titulo}: ${item.descripcion}`

    if (includeChildren && item.hijos && item.hijos.length > 0) {
      text += "\n\nContenido incluido:"
      item.hijos.forEach((child, index) => {
        if (child.activo && child.visible) {
          text += `\n${index + 1}. ${child.titulo}`
        }
      })
    }

    return text
  }

  const handleOpen = () => {
    setShareText(generateShareText())
    setOpen(true)
    setShared({
      whatsapp: false,
      telegram: false,
      facebook: false,
    })
  }

  const handleShareWhatsApp = () => {
    try {
      const encodedText = encodeURIComponent(shareText)
      window.open(`https://wa.me/?text=${encodedText}`, "_blank") ||
        window.location.assign(`https://wa.me/?text=${encodedText}`)
      setShared((prev) => ({ ...prev, whatsapp: true }))
    } catch (error) {
      console.error("Error al compartir en WhatsApp:", error)
      alert("No se pudo abrir WhatsApp. Intente copiar el texto y compartirlo manualmente.")
    }
  }

  const handleShareTelegram = () => {
    try {
      const encodedText = encodeURIComponent(shareText)
      window.open(`https://t.me/share/url?url=https://ara-celi.org&text=${encodedText}`, "_blank") ||
        window.location.assign(`https://t.me/share/url?url=https://ara-celi.org&text=${encodedText}`)
      setShared((prev) => ({ ...prev, telegram: true }))
    } catch (error) {
      console.error("Error al compartir en Telegram:", error)
      alert("No se pudo abrir Telegram. Intente copiar el texto y compartirlo manualmente.")
    }
  }

  const handleShareFacebook = () => {
    try {
      // Facebook no permite personalizar el texto, solo la URL
      const url = encodeURIComponent("https://ara-celi.org")
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank") ||
        window.location.assign(`https://www.facebook.com/sharer/sharer.php?u=${url}`)
      setShared((prev) => ({ ...prev, facebook: true }))
    } catch (error) {
      console.error("Error al compartir en Facebook:", error)
      alert("No se pudo abrir Facebook. Intente copiar la URL y compartirla manualmente.")
    }
  }

  const handleCopyToClipboard = () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(shareText)
        alert("Texto copiado al portapapeles")
      } else {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement("textarea")
        textArea.value = shareText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        alert("Texto copiado al portapapeles")
      }
    } catch (error) {
      console.error("Error al copiar al portapapeles:", error)
      alert("No se pudo copiar al portapapeles. Intente seleccionar y copiar manualmente.")
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen} className="flex items-center gap-1">
        <Share className="h-4 w-4" />
        Compartir
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compartir Contenido</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="whatsapp" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="telegram">Telegram</TabsTrigger>
              <TabsTrigger value="facebook">Facebook</TabsTrigger>
            </TabsList>

            <TabsContent value="whatsapp" className="space-y-4">
              <Textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                rows={8}
                placeholder="Texto para compartir en WhatsApp..."
              />
              {includeChildren && (
                <p className="text-sm text-gray-500">
                  Incluye información de {item.hijos?.filter((c) => c.activo && c.visible).length || 0} elementos hijos.
                </p>
              )}
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleCopyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar
                </Button>
                <Button onClick={handleShareWhatsApp} variant={shared.whatsapp ? "outline" : "default"}>
                  {shared.whatsapp ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Compartido
                    </>
                  ) : (
                    <>
                      <Share className="mr-2 h-4 w-4" />
                      Compartir en WhatsApp
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="telegram" className="space-y-4">
              <Textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                rows={8}
                placeholder="Texto para compartir en Telegram..."
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleCopyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar
                </Button>
                <Button onClick={handleShareTelegram} variant={shared.telegram ? "outline" : "default"}>
                  {shared.telegram ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Compartido
                    </>
                  ) : (
                    <>
                      <Share className="mr-2 h-4 w-4" />
                      Compartir en Telegram
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="facebook" className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-md">
                <p className="text-sm text-gray-600">
                  Facebook no permite personalizar el texto al compartir. Se compartirá la URL y Facebook extraerá los
                  metadatos OpenGraph.
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleShareFacebook} variant={shared.facebook ? "outline" : "default"}>
                  {shared.facebook ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Compartido
                    </>
                  ) : (
                    <>
                      <Share className="mr-2 h-4 w-4" />
                      Compartir en Facebook
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

