// Vídeos reais colocados pelos pais/treinador num exercício ou gesto:
//  - gravado no aparelho: toca aqui mesmo, sem internet;
//  - link do YouTube ou de uma aula da Hotmart: abre fora do app, depois do portão dos pais (BotaoVideo).
import { BotaoVideo } from '../../features/agenda/BotaoVideo'
import { useImagemLocal } from '../../hooks/useImagemLocal'
import { origemDoVideo } from '../../utils/link'

const ROTULOS = { youtube: '🎬 Ver vídeo real (YouTube)', hotmart: '🎓 Ver a aula (Hotmart)', outro: '🎬 Ver vídeo real' }

interface Props {
  titulo: string
  video?: string
  videoLocal?: string
}

export function VideoReal({ titulo, video, videoLocal }: Props) {
  const local = useImagemLocal(videoLocal)
  if (!video && !videoLocal) return null
  return (
    <div className="flex w-full flex-col gap-2">
      {videoLocal && local && (
        <figure className="flex flex-col gap-1">
          <video src={local} controls playsInline preload="metadata" className="aspect-video w-full rounded-2xl bg-black" aria-label={`Vídeo de ${titulo}`} />
          <figcaption className="text-center text-sm font-bold">📹 Vídeo gravado pelo treinador</figcaption>
        </figure>
      )}
      {video && <BotaoVideo url={video} titulo={titulo} className="w-full" rotulo={ROTULOS[origemDoVideo(video)]} />}
    </div>
  )
}
