"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Curso } from "@/types"

interface CursoFormProps {
  curso?: Curso
  onSubmit: (curso: Omit<Curso, "contenido">) => Promise<void>
}

export function CursoForm({ curso, onSubmit }: CursoFormProps) {
  const [formData, setFormData] = useState({
    id: curso?.id || "",
    nombre: curso?.nombre || "",
    subtitulo: curso?.subtitulo || "",
    descripcion: curso?.descripcion || "",
    publico: curso?.publico ?? true,
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, publico: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      router.push("/admin/cursos")
    } catch (error) {
      console.error("Error al guardar el curso:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{curso ? "Editar Curso" : "Nuevo Curso"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID del Curso (para URL)</Label>
            <Input
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              disabled={!!curso}
              placeholder="delacrisisalcielo"
            />
            <p className="text-xs text-gray-500">Este ID se usará en la URL: /cursos/[id]</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Curso</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="De la Crisis al Cielo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitulo">Subtítulo</Label>
            <Input
              id="subtitulo"
              name="subtitulo"
              value={formData.subtitulo}
              onChange={handleChange}
              placeholder="LOS 9 PASOS DE ARA-CELI"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción del curso..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="publico" checked={formData.publico} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="publico">Curso Público</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/cursos")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Curso"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

