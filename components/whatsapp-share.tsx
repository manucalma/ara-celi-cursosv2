"use client"

import { Button } from "@/components/ui/button"
import { Share } from "lucide-react"

interface WhatsappShareProps {
  text: string
}

export function WhatsappShare({ text }: WhatsappShareProps) {
  const handleShare = () => {
    const encodedText = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${encodedText}`, "_blank")
  }

  return (
    <Button onClick={handleShare} className="bg-green-500 hover:bg-green-600 text-white">
      <Share className="mr-2 h-4 w-4" />
      Compartir en WhatsApp
    </Button>
  )
}

