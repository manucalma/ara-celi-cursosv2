import { LoginForm } from "@/components/admin/login-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al sitio
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Administración de Cursos</h1>
      </div>
      <LoginForm />
    </div>
  )
}

