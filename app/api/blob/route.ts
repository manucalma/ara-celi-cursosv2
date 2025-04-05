import { NextRequest, NextResponse } from 'next/server'
import { handleUpload } from '@vercel/blob/client'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authToken = process.env.ADMIN_TOKEN || "admin-token"
  const authHeader = request.headers.get("Authorization")

  if (authHeader !== `Bearer ${authToken}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const response = await handleUpload({
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: "Error al procesar la carga" }, { status: 500 })
  }
}