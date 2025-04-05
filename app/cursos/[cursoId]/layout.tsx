import type React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { getContentData, findCursoById } from "@/lib/content-utils"

interface CursoLayoutProps {
  children: React.ReactNode
  params: {
    cursoId: string
  }
}

export async function generateMetadata({ params }: CursoLayoutProps): Promise<Metadata> {
  const data = await getContentData()
  const curso = findCursoById(data, params.cursoId)

  if (!curso) {
    return {
      title: "Curso no encontrado",
    }
  }

  return {
    title: `${curso.nombre} | ARA-CELI`,
    description: curso.descripcion,
  }
}

export default async function CursoLayout({ children, params }: CursoLayoutProps) {
  const data = await getContentData()
  const curso = findCursoById(data, params.cursoId)

  if (!curso || !curso.publico) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white drop-shadow-md">{curso.nombre}</h1>
            <h2 className="text-2xl font-medium text-white mt-2 drop-shadow-sm">"{curso.subtitulo}"</h2>
            <p className="text-white mt-1">{curso.descripcion}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <SidebarNavigation cursoId={curso.id} items={curso.contenido} />
            </div>

            <div className="md:col-span-3">{children}</div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

