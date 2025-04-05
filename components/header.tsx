"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MetadataViewer } from "@/components/metadata-viewer"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/images/logo.png" alt="ARA-CELI Logo" width={50} height={50} />
          <h1 className="text-2xl font-bold text-blue-600">CURSOS - HOSPITAL DEL ALMA</h1>
        </Link>
        <div className="flex items-center gap-2">
          <MetadataViewer url={typeof window !== "undefined" ? window.location.href : pathname} />
          <Link href="/admin" className="text-pink-500 hover:text-pink-700 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </header>
  )
}

