// Links externos digitados pelos pais: só http/https (bloqueia "javascript:" e afins).

export function linkSeguro(texto: string): string | null {
  try {
    const url = new URL(texto.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

/** Nome curto do site (ex.: "youtu.be"), para o adulto saber para onde vai */
export function siteDoLink(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

const SITES_YOUTUBE = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com', 'youtube-nocookie.com']

/** Link do YouTube (youtube.com ou youtu.be), em https; null se não for */
export function linkYoutube(texto: string): string | null {
  const seguro = linkSeguro(texto)
  if (!seguro) return null
  const url = new URL(seguro)
  if (!SITES_YOUTUBE.includes(url.hostname)) return null
  url.protocol = 'https:'
  return url.href
}
