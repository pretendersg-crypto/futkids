// Campo "Vídeo real" dos editores dos pais (exercícios e gestos do goleiro):
//  - link do YouTube ou de uma aula da Hotmart (validado ao salvar, com linkDeVideo);
//  - vídeo gravado ou escolhido no celular (fica só no aparelho, no IndexedDB).
import { useState, type ChangeEvent } from 'react'
import { useImagemLocal } from '../../../hooks/useImagemLocal'
import { salvarVideo } from '../../../utils/midiaLocal'

interface Props {
  video?: string
  videoLocal?: string
  aoMudar: (parte: { video?: string; videoLocal?: string }) => void
}

export function CampoVideoReal({ video, videoLocal, aoMudar }: Props) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const previa = useImagemLocal(videoLocal)

  async function enviar(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setEnviando(true)
    setErro('')
    try {
      aoMudar({ videoLocal: await salvarVideo(arquivo) })
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não deu para guardar o vídeo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <fieldset className="flex flex-col gap-2 rounded-2xl border-4 border-dashed border-red-200 p-2">
      <legend className="px-1 text-base font-bold">🎬 Vídeo real (opcional)</legend>

      <label className="flex flex-col gap-1 text-sm font-bold">
        Link do YouTube ou da aula na Hotmart
        <input
          type="url"
          inputMode="url"
          value={video ?? ''}
          placeholder="https://youtu.be/..."
          onChange={(e) => aoMudar({ video: e.target.value || undefined })}
          className="min-h-12 rounded-xl border-2 border-violet-200 px-3 text-base font-normal"
        />
        <span className="font-normal">Abre fora do app, só depois da conta dos pais. Aula da Hotmart só abre para quem está logado e tem o curso.</span>
      </label>

      <div className="flex flex-col gap-1 text-sm">
        <p className="font-bold">Ou um vídeo gravado (fica só neste aparelho, até 60 MB)</p>
        {/* No celular, "video/*" deixa escolher entre gravar agora com a câmera ou pegar da galeria */}
        <label className="grid min-h-12 cursor-pointer place-items-center rounded-xl bg-red-600 px-3 text-base font-bold text-white">
          {enviando ? 'Guardando…' : videoLocal ? '🔄 Trocar vídeo' : '📹 Gravar ou escolher vídeo'}
          <input type="file" accept="video/*" onChange={enviar} className="sr-only" />
        </label>
        {videoLocal && previa && <video src={previa} controls playsInline preload="metadata" className="aspect-video w-full rounded-xl bg-black" />}
        {videoLocal && (
          <button type="button" onClick={() => aoMudar({ videoLocal: undefined })} className="min-h-11 rounded-xl border-2 border-red-200 font-bold">
            Tirar o vídeo gravado
          </button>
        )}
        {erro && (
          <p role="alert" className="font-bold text-red-700">
            ❌ {erro}
          </p>
        )}
      </div>
    </fieldset>
  )
}
