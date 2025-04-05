// Función para formatear texto enriquecido similar a WhatsApp
export function formatRichText(text: string): string {
  if (!text) return ""

  return text
    .replace(/\*([^*]+)\*/g, "<strong>$1</strong>") // Negrita
    .replace(/_([^_]+)_/g, "<em>$1</em>") // Cursiva
    .replace(/~([^~]+)~/g, "<del>$1</del>") // Tachado
    .replace(/```([^`]+)```/g, "<code>$1</code>") // Código
    .replace(/\n/g, "<br />") // Saltos de línea
    .replace(/:([\w-]+):/g, (match, emojiName) => {
      // Mapeo básico de algunos emoticonos comunes
      const emojiMap: Record<string, string> = {
        smile: "😊",
        heart: "❤️",
        thumbsup: "👍",
        thumbsdown: "👎",
        clap: "👏",
        fire: "🔥",
        star: "⭐",
        check: "✅",
        x: "❌",
        warning: "⚠️",
        idea: "💡",
        question: "❓",
        exclamation: "❗",
        pray: "🙏",
        love: "😍",
        sad: "😢",
        angry: "😠",
        laugh: "😂",
        wink: "😉",
        cool: "😎",
        surprised: "😮",
        confused: "😕",
        thinking: "🤔",
        angel: "😇",
        devil: "😈",
      }

      return emojiMap[emojiName] || match
    })
}

