// Gera a imagem da conquista (1080×1080, boa para WhatsApp) e abre o "compartilhar" do celular.
// Sem dados da criança na imagem: só a figurinha, o nome da conquista e a data.
import { urlDeSticker, type Conquista, type Sticker } from '../../data/catalogo'
import { formatarData } from '../../utils/data'

const LADO = 1080
const FONTE_EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
const FONTE_TEXTO = 'ui-rounded,"Nunito","Segoe UI",system-ui,sans-serif'

export type ResultadoCompartilhar = 'compartilhado' | 'baixado' | 'cancelado'

function carregarImagem(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/** Desenha a figurinha num círculo de raio `r` centrado em (x, y) */
async function desenharSticker(g: CanvasRenderingContext2D, sticker: Sticker, x: number, y: number, r: number) {
  g.fillStyle = '#FFFFFF'
  g.beginPath()
  g.arc(x, y, r, 0, Math.PI * 2)
  g.fill()

  if (sticker.tipo === 'imagem') {
    try {
      const img = await carregarImagem(urlDeSticker(sticker.url))
      g.drawImage(img, x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8)
      return
    } catch {
      // segue para o emoji reserva
    }
  }

  const [cor1, cor2] = sticker.tipo === 'padrao' ? sticker.cores : ['#FDE68A', '#F59E0B']
  const emoji = sticker.tipo === 'padrao' ? sticker.emoji : (sticker.emojiReserva ?? '🏆')
  const gradiente = g.createLinearGradient(x - r, y - r, x + r, y + r)
  gradiente.addColorStop(0, cor1)
  gradiente.addColorStop(1, cor2)
  g.fillStyle = gradiente
  g.beginPath()
  g.arc(x, y, r * 0.88, 0, Math.PI * 2)
  g.fill()
  g.font = `${Math.round(r)}px ${FONTE_EMOJI}`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(emoji, x, y + r * 0.06)
}

async function gerarImagem(conquista: Conquista, data: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = LADO
  canvas.height = LADO
  const g = canvas.getContext('2d')
  if (!g) throw new Error('Canvas indisponível')

  const fundo = g.createLinearGradient(0, 0, 0, LADO)
  fundo.addColorStop(0, '#16A34A')
  fundo.addColorStop(1, '#14532D')
  g.fillStyle = fundo
  g.fillRect(0, 0, LADO, LADO)

  g.fillStyle = '#FACC15'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = `900 76px ${FONTE_TEXTO}`
  g.fillText('Nova figurinha!', LADO / 2, 120)

  await desenharSticker(g, conquista.sticker, LADO / 2, 480, 280)

  g.fillStyle = '#FFFFFF'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = `900 84px ${FONTE_TEXTO}`
  g.fillText(conquista.nome, LADO / 2, 850, LADO - 80)
  g.font = `500 46px ${FONTE_TEXTO}`
  g.fillText(conquista.descricao, LADO / 2, 935, LADO - 80)
  g.font = `700 36px ${FONTE_TEXTO}`
  g.fillStyle = '#BBF7D0'
  g.fillText(`FutKids ⚽ · ${formatarData(data)}`, LADO / 2, 1025)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar imagem'))), 'image/png'))
}

export async function compartilharConquista(conquista: Conquista, data: string): Promise<ResultadoCompartilhar> {
  const blob = await gerarImagem(conquista, data)
  const arquivo = new File([blob], `futkids-${conquista.id}.png`, { type: 'image/png' })

  if (navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], text: `Nova figurinha no FutKids: ${conquista.nome}! ⚽` })
      return 'compartilhado'
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === 'AbortError') return 'cancelado'
      // outro erro (ex.: tempo do toque expirou): cai para o download abaixo
    }
  }

  // Sem "compartilhar" no navegador (ex.: computador): baixa a imagem
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = arquivo.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'baixado'
}
