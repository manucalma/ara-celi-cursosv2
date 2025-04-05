import type { Metadata } from "next"
import { getContentData, findCursoById } from "@/lib/content-utils"
import { VideoPlayer } from "@/components/video-player"
import { Card, CardContent } from "@/components/ui/card"

interface CursoPageProps {
  params: {
    cursoId: string
  }
}

export async function generateMetadata({ params }: CursoPageProps): Promise<Metadata> {
  const data = await getContentData()
  const curso = findCursoById(data, params.cursoId)

  if (!curso) {
    return {
      title: "Curso no encontrado",
    }
  }

  // Buscar el primer elemento multimedia activo y visible
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

  const firstCoverUrl = findFirstMultimedia(curso.contenido)

  return {
    title: `${curso.nombre} | ARA-CELI`,
    description: curso.descripcion,
    openGraph: {
      title: curso.nombre,
      description: curso.descripcion,
      type: "website",
      images: firstCoverUrl
        ? [
            {
              url: firstCoverUrl,
              width: 1200,
              height: 630,
              alt: curso.nombre,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: curso.nombre,
      description: curso.descripcion,
      images: firstCoverUrl ? [firstCoverUrl] : undefined,
    },
  }
}

export default async function CursoPage({ params }: CursoPageProps) {
  const data = await getContentData()
  const curso = findCursoById(data, params.cursoId)

  if (!curso) {
    return <div>Curso no encontrado</div>
  }

  // Obtener todos los elementos visibles (activos e inactivos)
  const visibleItems = curso.contenido
    .flatMap((item) => {
      if (item.hijos && item.hijos.length > 0) {
        return item.hijos.filter((child) => child.visible && child.coverUrl)
      }
      return item.visible && item.coverUrl ? [item] : []
    })
    .sort((a, b) => a.orden - b.orden)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-white">Videos disponibles</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleItems.map((item) => (
          <Card key={item.id} className={`bg-white shadow-md ${!item.activo ? "opacity-80" : ""}`}>
            <CardContent className="p-4">
              <VideoPlayer
                videoUrl={item.videoUrl || ""}
                coverUrl={item.coverUrl!}
                title={item.titulo}
                isInactive={!item.activo}
              />
              <h3 className={`text-xl font-semibold mt-4 ${!item.activo ? "text-gray-500" : ""}`}>
                {item.titulo}
                {!item.activo && <span className="ml-2 text-sm font-normal text-gray-400">(Próximamente)</span>}
              </h3>
              <p className={`mt-1 ${!item.activo ? "text-gray-400" : "text-gray-600"}`}>{item.descripcion}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

