import { getContentData, flattenContenido } from "@/lib/content-utils"
import type { MetadataRoute } from "next"

export async function GET(): Promise<MetadataRoute.Sitemap> {
  const data = await getContentData()
  const sitemap: MetadataRoute.Sitemap = []

  // Añadir la página principal
  sitemap.push({
    url: "https://ara-celi.org",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
  })

  // Añadir las páginas de cursos
  for (const curso of data.cursos) {
    if (curso.publico) {
      sitemap.push({
        url: `https://ara-celi.org/cursos/${curso.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      })

      // Añadir las páginas de videos
      const allItems = flattenContenido(curso.contenido)
      for (const item of allItems) {
        if (item.activo && item.visible && item.videoUrl) {
          sitemap.push({
            url: `https://ara-celi.org/cursos/${curso.id}/${item.urlParam}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          })
        }
      }
    }
  }

  return sitemap
}

