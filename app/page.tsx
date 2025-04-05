import { redirect } from "next/navigation"
import { getContentData } from "@/lib/content-utils"

export default async function Home() {
  const data = await getContentData()

  // Redirigir al primer curso público disponible
  const primerCursoPublico = data.cursos.find((curso) => curso.publico)

  if (primerCursoPublico) {
    redirect(`/cursos/${primerCursoPublico.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center">No hay cursos disponibles</h1>
    </div>
  )
}

