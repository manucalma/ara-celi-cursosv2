"use client"
import Image from "next/image"
import { Play } from "lucide-react"

interface VideoPlayerProps {
  videoUrl: string
  coverUrl: string
  title: string
  isAdmin?: boolean
  isInactive?: boolean
}

export function VideoPlayer({ videoUrl, coverUrl, title, isAdmin = false, isInactive = false }: VideoPlayerProps) {
  const handlePlay = () => {
    if (isInactive && !isAdmin) return

    try {
      // Intentar abrir una ventana emergente primero
      const popupWindow = window.open(
        videoUrl,
        "VideoPlayer",
        "width=1280,height=720,resizable=yes,scrollbars=no,status=no",
      )

      // Si el navegador bloquea la ventana emergente, abrir en una nueva pestaña
      if (!popupWindow || popupWindow.closed || typeof popupWindow.closed === "undefined") {
        window.open(videoUrl, "_blank")
      }
    } catch (error) {
      console.error("Error al abrir el reproductor de video:", error)
      // Fallback: abrir en la misma ventana si todo lo demás falla
      window.location.href = videoUrl
    }
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden shadow-lg ${isInactive ? "opacity-60" : ""} cursor-pointer`}
      onClick={handlePlay}
    >
      <div className="aspect-video relative">
        <Image
          src={coverUrl || "/images/placeholder.svg"}
          alt={title}
          fill
          className={`object-cover ${isInactive ? "grayscale" : ""}`}
          onError={(e) => {
            // Fallback a imagen por defecto si hay error
            const target = e.target as HTMLImageElement
            target.src = "/images/placeholder.svg"
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300">
          {/* Botón de reproducción en la esquina inferior derecha */}
          <div className="absolute bottom-4 right-4">
            <div
              className={`bg-white bg-opacity-90 rounded-full p-3 shadow-lg transition-all transform ${
                isInactive && !isAdmin
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500"
              }`}
            >
              <Play className={`h-6 w-6 ${isInactive ? "text-gray-400" : "text-pink-500"}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

