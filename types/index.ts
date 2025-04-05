export interface ContenidoItem {
  id: string
  titulo: string
  descripcion: string
  orden: number
  activo: boolean
  visible: boolean
  urlParam: string
  videoUrl?: string
  coverUrl?: string
  whatsappText?: string
  audioUrl?: string
  textoRich?: string
  pdfUrl?: string
  hijos: ContenidoItem[]
}

export interface Curso {
  id: string
  nombre: string
  subtitulo: string
  descripcion: string
  publico: boolean
  contenido: ContenidoItem[]
}

export interface ContentData {
  cursos: Curso[]
}

export interface OpenGraphPreview {
  title: string
  description: string
  imageUrl: string
  url: string
}

