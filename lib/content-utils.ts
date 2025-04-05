import type { ContentData, ContenidoItem, Curso } from "@/types"
import { put, list } from "@vercel/blob"
import { getBlob } from "@vercel/blob/client"

const CONTENT_BLOB_KEY = "content.json"

export async function getContentData(): Promise<ContentData> {
  try {
    // Intentar obtener el contenido desde Vercel Blob
    try {
      // Listar los blobs para ver si existe nuestro archivo
      const blobs = await list()
      const contentBlob = blobs.blobs.find(blob => blob.pathname === CONTENT_BLOB_KEY)
      
      if (contentBlob) {
        // Si existe, obtenerlo
        const response = await fetch(contentBlob.url)
        const text = await response.text()
        return JSON.parse(text)
      }
    } catch (blobError) {
      console.error("Error accessing Vercel Blob:", blobError)
    }
    
    // Si no existe el blob o hubo un error, cargar el contenido inicial
    const initialData = await fetch("/api/content.json").then((res) => res.json())
    
    // Guardar el contenido inicial en Blob para futuras operaciones
    await saveContentData(initialData)
    
    return initialData
  } catch (error) {
    console.error("Error reading content data:", error)
    // Fallback a un objeto vacío
    return { cursos: [] }
  }
}

export async function saveContentData(data: ContentData): Promise<boolean> {
  try {
    // Convertir los datos a JSON
    const jsonContent = JSON.stringify(data, null, 2)
    
    // Crear un Blob de JavaScript
    const blob = new Blob([jsonContent], { type: "application/json" })
    
    // Guardar en Vercel Blob
    await put(CONTENT_BLOB_KEY, blob, {
      contentType: "application/json",
      access: "public",
    })
    
    return true
  } catch (error) {
    console.error("Error writing content data:", error)
    return false
  }
}

export function findCursoById(data: ContentData, cursoId: string): Curso | undefined {
  return data.cursos.find((curso) => curso.id === cursoId)
}

export function normalizeParam(param: string): string {
  // Manejar caso de parámetro vacío o nulo
  if (!param) return ""

  // Normaliza los parámetros reemplazando guiones bajos por guiones medios y viceversa
  // También convierte a minúsculas para comparación insensible a mayúsculas
  return param.replace(/[_-]/g, "-").toLowerCase()
}

export function findContenidoByParam(items: ContenidoItem[], param: string): ContenidoItem | undefined {
  const normalizedParam = normalizeParam(param)

  for (const item of items) {
    if (normalizeParam(item.urlParam) === normalizedParam) {
      return item
    }

    if (item.hijos && item.hijos.length > 0) {
      const found = findContenidoByParam(item.hijos, normalizedParam)
      if (found) return found
    }
  }

  return undefined
}

export function getAllActiveVisibleItems(items: ContenidoItem[]): ContenidoItem[] {
  let result: ContenidoItem[] = []

  for (const item of items) {
    if (item.activo && item.visible) {
      const itemCopy = { ...item, hijos: [] }
      result.push(itemCopy)

      if (item.hijos && item.hijos.length > 0) {
        const activeChildren = getAllActiveVisibleItems(item.hijos)
        result = [...result, ...activeChildren]
      }
    }
  }

  return result
}

export function getChildrenByParentParam(items: ContenidoItem[], parentParam: string): ContenidoItem[] {
  const normalizedParam = normalizeParam(parentParam)

  for (const item of items) {
    if (normalizeParam(item.urlParam) === normalizedParam && item.hijos && item.hijos.length > 0) {
      return item.hijos.filter((child) => child.activo && child.visible)
    }

    if (item.hijos && item.hijos.length > 0) {
      const found = getChildrenByParentParam(item.hijos, normalizedParam)
      if (found.length > 0) return found
    }
  }

  return []
}

export function flattenContenido(items: ContenidoItem[]): ContenidoItem[] {
  let result: ContenidoItem[] = []

  for (const item of items) {
    result.push({ ...item, hijos: [] })

    if (item.hijos && item.hijos.length > 0) {
      const flattenedChildren = flattenContenido(item.hijos)
      result = [...result, ...flattenedChildren]
    }
  }

  return result
}