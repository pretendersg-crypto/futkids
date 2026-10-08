// "Vídeo do treinador": abre o vídeo original (YouTube) FORA do app, só depois do portão dos
// pais. A criança não navega sozinha por sites externos.
import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { PortaoDosPais } from '../../components/ui/PortaoDosPais'
import { linkSeguro, origemDoVideo, siteDoLink } from '../../utils/link'

interface Props {
  url: string
  titulo: string
  /** Pula o portão (já está na área dos pais) */
  semPortao?: boolean
  /** Texto do botão (padrão: "🎬 Vídeo") */
  rotulo?: string
  className?: string
}

export function LinkVideo({ url, titulo, className = '' }: { url: string; titulo: string; className?: string }) {
  const seguro = linkSeguro(url)
  if (!seguro) return <span className="text-sm text-red-700">Link inválido</span>
  return (
    <a
      href={seguro}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-12 items-center justify-center gap-1 rounded-2xl bg-red-600 px-4 font-extrabold text-white shadow ${className}`}
    >
      ▶ {titulo} <span className="text-sm font-bold opacity-90">({siteDoLink(seguro)} ↗)</span>
    </a>
  )
}

export function BotaoVideo({ url, titulo, semPortao = false, className = '', rotulo = '🎬 Vídeo' }: Props) {
  const [janela, setJanela] = useState<'fechada' | 'portao' | 'liberado'>('fechada')

  if (semPortao) return <LinkVideo url={url} titulo="Vídeo" className={className} />

  return (
    <>
      <button
        type="button"
        onClick={() => setJanela('portao')}
        aria-label={`Vídeo do treinador: ${titulo}`}
        className={`min-h-12 rounded-2xl border-4 border-red-200 bg-white px-3 text-base font-extrabold ${className}`}
      >
        {rotulo}
      </button>
      <Modal aberto={janela !== 'fechada'} aoFechar={() => setJanela('fechada')} titulo="🎬 Vídeo do treinador">
        {janela === 'portao' && (
          <>
            {origemDoVideo(url) === 'hotmart' ? (
              <p className="text-base">
                A aula abre fora do app, na <b>Hotmart</b>. Só funciona para quem está logado e tem o curso. Assista junto com a criança.
              </p>
            ) : (
              <p className="text-base">O vídeo abre fora do app (no {siteDoLink(url) || 'site do vídeo'}). Assista junto com a criança.</p>
            )}
            <PortaoDosPais aoLiberar={() => setJanela('liberado')} />
          </>
        )}
        {janela === 'liberado' && (
          <div className="flex flex-col gap-3">
            <p className="text-lg font-bold">{titulo}</p>
            <LinkVideo url={url} titulo="Abrir vídeo" className="w-full" />
          </div>
        )}
      </Modal>
    </>
  )
}
