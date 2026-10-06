// Instalar o FutKids como app (PWA). O Chrome/Edge/Samsung Internet avisam, com o evento
// "beforeinstallprompt", que o app pode ser instalado; guardamos esse aviso para usar no botão
// "Instalar". No iPhone/iPad não existe esse aviso: só dá pelo Safari, em Compartilhar →
// "Adicionar à Tela de Início" (o botão mostra o passo a passo).
// Este arquivo é importado no main.tsx, para ouvir o aviso desde o começo.

/** O aviso do navegador (ainda não está nos tipos do TypeScript) */
interface AvisoInstalar extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let aviso: AvisoInstalar | null = null
const ouvintes = new Set<() => void>()
const avisar = () => ouvintes.forEach((f) => f())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // o app mostra o próprio botão no lugar da faixa do navegador
    aviso = e as AvisoInstalar
    avisar()
  })
  window.addEventListener('appinstalled', () => {
    aviso = null
    avisar()
  })
}

export function assinarInstalar(f: () => void) {
  ouvintes.add(f)
  return () => ouvintes.delete(f)
}

/** true quando o navegador deixa instalar com um toque */
export const podeInstalarDireto = () => aviso !== null

/** O app já está aberto como app instalado (sem barra do navegador) */
export function abertoComoApp(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches || (navigator as { standalone?: boolean }).standalone === true
}

/** iPhone ou iPad (o iPad novo se apresenta como Mac, mas tem tela de toque) */
export function ehAparelhoApple(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
}

/** Abre a janela de instalação do navegador. Devolve true se a pessoa aceitou. */
export async function instalarAgora(): Promise<boolean> {
  if (!aviso) return false
  const atual = aviso
  aviso = null // o aviso só pode ser usado uma vez
  avisar()
  await atual.prompt()
  return (await atual.userChoice).outcome === 'accepted'
}
