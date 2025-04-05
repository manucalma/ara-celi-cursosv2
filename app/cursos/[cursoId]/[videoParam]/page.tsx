import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getContentData, findCursoById, findContenidoByParam } from "@/lib/content-utils"
import { VideoPlayer } from "@/components/video-player"
import { Card, CardContent } from "@/components/ui/card"
import { formatRichText } from "@/lib/format-utils"

interface VideoPageProps {
  params: {
    cursoId: string
    videoParam: string
  }
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const data = await getContentData()
  const curso = findCursoById(data, params.cursoId)

  if (!curso) {
    return {
      title: "Curso no encontrado",
    }
  }

  const contenido = findContenidoByParam(curso.contenido, params.videoParam)

  if (!contenido) {
    return {
      title: "Video no encontrado",
    }
  }

  const imageUrl = contenido.coverUrl || ""
  const absoluteImageUrl = imageUrl.startsWith("http") ? imageUrl : `https://ara-celi.org${imageUrl}`

  return {
    title: `${contenido.titulo} | ${curso.nombre} | ARA-CELI`,
    description: contenido.descripcion,
    openGraph: {
      title: `${contenido.titulo} | ${curso.nombre}`,
      description: contenido.descripcion,
      type: "video",
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: contenido.titulo,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${contenido.titulo} | ${curso.nombre}`,
      description: contenido.descripcion,
      images: [absoluteImageUrl],
    },
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const data = await getContentData()
  const curso = findCursoById(data, params.cursoId)

  if (!curso) {
    notFound()
  }

  // Buscar el contenido por el parámetro de URL
  const contenido = findContenidoByParam(curso.contenido, params.videoParam)

  if (!contenido || !contenido.visible) {
    notFound()
  }

  // Verificar si es un video individual o una fase
  const isPhase = contenido.hijos && contenido.hijos.length > 0

  // Si es una fase, obtener todos los videos hijos visibles (activos e inactivos)
  const phaseVideos = isPhase ? contenido.hijos.filter((item) => item.visible && item.coverUrl) : []

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white">{contenido.titulo}</h2>

      {isPhase ? (
        // Mostrar todos los videos de la fase
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {phaseVideos.map((item) => (
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

                {item.textoRich && (
                  <div className={`mt-4 prose prose-sm max-w-none ${!item.activo ? "text-gray-400" : ""}`}>
                    <div dangerouslySetInnerHTML={{ __html: formatRichText(item.textoRich) }} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Mostrar un solo video
        <Card className={`bg-white shadow-md ${!contenido.activo ? "opacity-80" : ""}`}>
          <CardContent className="p-6">
            {contenido.coverUrl ? (
              <div>
                <VideoPlayer
                  videoUrl={contenido.videoUrl || ""}
                  coverUrl={contenido.coverUrl}
                  title={contenido.titulo}
                  isInactive={!contenido.activo}
                />

                <div className="mt-6">
                  <h3 className={`text-xl font-semibold ${!contenido.activo ? "text-gray-500" : ""}`}>
                    {contenido.titulo}
                    {!contenido.activo && (
                      <span className="ml-2 text-sm font-normal text-gray-400">(Próximamente)</span>
                    )}
                  </h3>
                  <p className={`mt-2 ${!contenido.activo ? "text-gray-400" : "text-gray-600"}`}>
                    {contenido.descripcion}
                  </p>

                  {contenido.textoRich && (
                    <div className={`mt-4 prose prose-sm max-w-none ${!contenido.activo ? "text-gray-400" : ""}`}>
                      <div dangerouslySetInnerHTML={{ __html: formatRichText(contenido.textoRich) }} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Este contenido no tiene un video asociado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

