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
