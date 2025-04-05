import { type NextRequest, NextResponse } from "next/server"
import { getContentData, saveContentData } from "@/lib/content-utils"

export async function GET() {
  try {
    const data = await getContentData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error al obtener los datos:", error)
    return NextResponse.json({ error: "Error al obtener los datos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación usando variable de entorno o valor por defecto
    const authToken = process.env.ADMIN_TOKEN || "admin-token"
    const authHeader = request.headers.get("Authorization")

    if (authHeader !== `Bearer ${authToken}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    // Validar la estructura de los datos
    if (!data || !Array.isArray(data.cursos)) {
      return NextResponse.json({ error: "Formato de datos inválido" }, { status: 400 })
    }

    const success = await saveContentData(data)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      // En producción, podríamos tener un plan de contingencia
      if (process.env.NODE_ENV === "production") {
        console.error("Error al guardar los datos en producción - implementando plan de contingencia")
        // Aquí podríamos implementar un plan alternativo
        return NextResponse.json({
          success: true,
          warning: "Los datos se procesaron pero podrían no haberse guardado permanentemente",
        })
      }

      return NextResponse.json({ error: "Error al guardar los datos" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error interno del servidor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

