// Toca um vídeo do treinador guardado no FutKids, dentro do app. Só busca o vídeo quando a pessoa
// toca em "Assistir" (economiza internet). Sem botão de baixar (o vídeo é da turma, não para circular).
import { useState } from 'react'

export function VideoDoTreinador({ caminho, titulo, compacto = false }: { caminho: string; titulo: string; compacto?: boolean }) {
  const [url, setUrl] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function assistir() {
    setCarregando(true)
    setErro('')
    try {
      setUrl(await (await import('../../conta/nuvemVideos')).enderecoDoVideo(caminho))
    } catch {
      setErro('Não deu para abrir o vídeo (sem internet, ou o treinador apagou).')
    } finally {
      setCarregando(false)
    }
  }

  if (url) {
    return (
      <video
        src={url}
        controls
        autoPlay
        playsInline
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        aria-label={`Vídeo do treinador: ${titulo}`}
        className="aspect-video w-full rounded-2xl bg-black"
      />
    )
  }
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={assistir}
        disabled={carregando}
        className={`rounded-2xl bg-red-600 px-4 font-extrabold text-white shadow ${compacto ? 'min-h-12 text-base' : 'min-h-14 text-lg'}`}
      >
        {carregando ? 'Abrindo…' : `▶ ${compacto ? 'Vídeo do treinador' : `Assistir: ${titulo}`}`}
      </button>
      {erro && <p className="text-sm font-bold text-red-700">{erro}</p>}
    </div>
  )
}
