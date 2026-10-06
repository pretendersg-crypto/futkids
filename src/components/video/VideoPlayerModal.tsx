// Janela "Ver exemplo 🎥": toca o vídeo do exercício sem sair da tela.
// Sem vídeo cadastrado (urlVideo vazio) ou se o vídeo falhar, mostra o `alternativa` (a animação).
import { useState, type ReactNode } from 'react'
import { urlDeMidia, type Video } from '../../data/catalogo'
import { Modal } from '../ui/Modal'

interface Props {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  video: Video | undefined
  /** O que mostrar quando não há vídeo (ex.: bonequinho animado) */
  alternativa: ReactNode
}

function Player({ video, alternativa }: { video: Video | undefined; alternativa: ReactNode }) {
  const [falhou, setFalhou] = useState(false)
  if (!video?.urlVideo || falhou) return <>{alternativa}</>
  return (
    <video
      src={urlDeMidia(video.urlVideo)}
      poster={urlDeMidia(video.thumbnailUrl) || undefined}
      controls
      autoPlay
      muted
      playsInline
      preload="metadata"
      onError={() => setFalhou(true)}
      className="aspect-video w-full rounded-2xl bg-black"
    />
  )
}

export function VideoPlayerModal({ aberto, aoFechar, titulo, video, alternativa }: Props) {
  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo={`🎥 ${titulo}`}>
      {/* Só monta o player com a janela aberta: fechar a janela para o vídeo */}
      {aberto && <Player key={video?.id} video={video} alternativa={alternativa} />}
    </Modal>
  )
}
