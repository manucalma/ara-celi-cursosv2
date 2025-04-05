"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { formatRichText } from "@/lib/format-utils"
import type { ContenidoItem } from "@/types"

interface ContenidoFormProps {
  cursoId: string
  parentId?: string
  item?: ContenidoItem
  onSubmit: (item: Omit<ContenidoItem, "hijos">) => Promise<void>
}

export function ContenidoForm({ cursoId, parentId, item, onSubmit }: ContenidoFormProps) {
  const [formData, setFormData] = useState({
    id: item?.id || "",
    titulo: item?.titulo || "",
    descripcion: item?.descripcion || "",
    orden: item?.orden || 0,
    activo: item?.activo ?? true,
    visible: item?.visible ?? true,
    urlParam: item?.urlParam || "",
    videoUrl: item?.videoUrl || "",
    coverUrl: item?.coverUrl || "",
    whatsappText: item?.whatsappText || "",
    audioUrl: item?.audioUrl || "",
    textoRich: item?.textoRich || "",
    pdfUrl: item?.pdfUrl || "",
  })
  const [loading, setLoading] = useState(false)
  const [previewText, setPreviewText] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (formData.textoRich) {
      setPreviewText(formatRichText(formData.textoRich))
    }
  }, [formData.textoRich])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      router.push(`/admin/cursos/${cursoId}/contenido`)
    } catch (error) {
      console.error("Error al guardar el contenido:", error)
    } finally {
      setLoading(false)
    }
  }

  const insertEmoji = (emoji: string) => {
    const textarea = document.getElementById("textoRich") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const text = textarea.value
    const newText = text.substring(0, start) + emoji + text.substring(end)

    setFormData((prev) => ({ ...prev, textoRich: newText }))

    // Establecer el cursor después del emoji insertado
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  const insertEmojiCode = (code: string) => {
    insertEmoji(`:${code}:`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? "Editar Contenido" : "Nuevo Contenido"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="general">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="contenido">Contenido</TabsTrigger>
              <TabsTrigger value="compartir">Compartir</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID del Contenido</Label>
                <Input
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  required
                  disabled={!!item}
                  placeholder="dia01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  placeholder="Día 01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción del contenido..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orden">Orden</Label>
                <Input
                  id="orden"
                  name="orden"
                  type="number"
                  value={formData.orden}
                  onChange={handleNumberChange}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urlParam">Parámetro URL</Label>
                <Input
                  id="urlParam"
                  name="urlParam"
                  value={formData.urlParam}
                  onChange={handleChange}
                  required
                  placeholder="dia-01"
                />
                <p className="text-xs text-gray-500">Este parámetro se usará en la URL: /cursos/{cursoId}/[urlParam]</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => handleSwitchChange("activo", checked)}
                />
                <Label htmlFor="activo">Activo</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="visible"
                  checked={formData.visible}
                  onCheckedChange={(checked) => handleSwitchChange("visible", checked)}
                />
                <Label htmlFor="visible">Visible</Label>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">URL del Video (Bunny.net)</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://iframe.mediadelivery.net/play/403497/video-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverUrl">URL de la Imagen de Portada</Label>
                <Input
                  id="coverUrl"
                  name="coverUrl"
                  value={formData.coverUrl}
                  onChange={handleChange}
                  placeholder="/images/covers/01-cover.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioUrl">URL del Audio</Label>
                <Input
                  id="audioUrl"
                  name="audioUrl"
                  value={formData.audioUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/audio.mp3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdfUrl">URL del PDF</Label>
                <Input
                  id="pdfUrl"
                  name="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/documento.pdf"
                />
              </div>
            </TabsContent>

            <TabsContent value="contenido" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="textoRich">Texto Enriquecido</Label>
                <Textarea
                  id="textoRich"
                  name="textoRich"
                  value={formData.textoRich}
                  onChange={handleChange}
                  placeholder="Contenido en formato de texto enriquecido..."
                  rows={10}
                />
                <p className="text-xs text-gray-500">
                  Puedes usar formato similar a WhatsApp: *negrita*, _cursiva_, ~tachado~, ```código```
                </p>

                <Collapsible className="mt-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 w-full justify-between">
                      <span>Emoticonos disponibles</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm mb-2">Haz clic en un emoticono para insertarlo:</p>
                      <div className="grid grid-cols-8 gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertEmoji("😊")}
                          className="text-xl"
                          type="button"
                        >
                          😊
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertEmoji("❤️")}
                          className="text-xl"
                          type="button"
                        >
                          ❤️
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertEmoji("👍")}
                          className="text-xl"
                          type="button"
                        >
                          👍
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertEmoji("🙏")}
                          className="text-xl"
                          type="button"
                        >
                          🙏
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertEmoji("✨")}
                          className="text-xl"
                          type="button"
                        >
                          ✨
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertEmoji("🌈")}
                          className="text-xl"
                          type="button"
                        >
                          🌈
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertEmoji("🔥")}
                          className="text-xl"
                          type="button"
                        >
                          🔥
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertEmoji("💡")}
                          className="text-xl"
                          type="button"
                        >
                          💡
                        </Button>
                      </div>

                      <p className="text-sm mt-4 mb-2">O usa códigos de emoticonos:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => insertEmojiCode("smile")} type="button">
                          :smile: → 😊
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => insertEmojiCode("heart")} type="button">
                          :heart: → ❤️
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => insertEmojiCode("thumbsup")} type="button">
                          :thumbsup: → 👍
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => insertEmojiCode("pray")} type="button">
                          :pray: → 🙏
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => insertEmojiCode("sparkles")} type="button">
                          :sparkles: → ✨
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => insertEmojiCode("rainbow")} type="button">
                          :rainbow: → 🌈
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => insertEmojiCode("fire")} type="button">
                          :fire: → 🔥
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => insertEmojiCode("idea")} type="button">
                          :idea: → 💡
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {formData.textoRich && (
                  <div className="mt-4">
                    <Label>Vista previa:</Label>
                    <div
                      className="mt-2 p-4 border rounded-md prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewText }}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="compartir" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsappText">Texto para Compartir</Label>
                <Textarea
                  id="whatsappText"
                  name="whatsappText"
                  value={formData.whatsappText}
                  onChange={handleChange}
                  placeholder="Mira el Día 1 del curso De la Crisis al Cielo: https://ara-celi.org/delacrisisalcielo/dia-01"
                  rows={6}
                />
                <p className="text-xs text-gray-500">
                  Este texto se usará al compartir este contenido en WhatsApp y Telegram.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/cursos/${cursoId}/contenido`)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Guardando..." : "Guardar Contenido"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

