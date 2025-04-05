"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ContenidoItem } from "@/types"
import { normalizeParam } from "@/lib/content-utils"

interface SidebarNavigationProps {
  cursoId: string
  items: ContenidoItem[]
}

export function SidebarNavigation({ cursoId, items }: SidebarNavigationProps) {
  const pathname = usePathname()

  const renderItems = (items: ContenidoItem[], level = 0) => {
    return items
      .filter((item) => item.visible)
      .sort((a, b) => a.orden - b.orden)
      .map((item) => {
        const itemPath = `/cursos/${cursoId}/${item.urlParam}`
        const normalizedPathname = pathname.split("/").pop() || ""
        const isActive = normalizeParam(normalizedPathname) === normalizeParam(item.urlParam)

        return (
          <div key={item.id} className={`ml-${level * 4}`}>
            <Link
              href={item.activo ? itemPath : "#"}
              className={`block py-2 px-4 rounded-md transition-colors ${
                isActive
                  ? "bg-pink-100 text-pink-600 font-medium"
                  : item.activo
                    ? "hover:bg-gray-100"
                    : "text-gray-400 cursor-default"
              }`}
              onClick={(e) => !item.activo && e.preventDefault()}
            >
              <div className="flex items-center">
                {item.activo ? (
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300 mr-2" />
                )}
                {item.titulo}
              </div>
            </Link>

            {item.hijos && item.hijos.length > 0 && <div className="mt-1">{renderItems(item.hijos, level + 1)}</div>}
          </div>
        )
      })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <nav>{renderItems(items)}</nav>
    </div>
  )
}

