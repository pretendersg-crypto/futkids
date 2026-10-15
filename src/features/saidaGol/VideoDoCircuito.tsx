// Vídeo de exemplo de um circuito com cones: o botão para assistir (abre fora do app, depois do
// portão dos pais) e, para o adulto, pôr ou trocar o link (YouTube ou aula da Hotmart). O link fica
// na família (vale em todos os aparelhos dela), por cima do vídeo que o circuito já tiver.
import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { PortaoDosPais } from '../../components/ui/PortaoDosPais'
import { VideoReal } from '../../components/video/VideoReal'
import { useCircuitosStore } from '../../stores/circuitosStore'
import { linkDeVideo } from '../../utils/link'
import type { Circuito } from './circuitos'

export function VideoDoCircuito({ circuito, comEdicao = true }: { circuito: Circuito; comEdicao?: boolean }) {
  const doFamilia = useCircuitosStore((s) => s.videos[circuito.id])
  const definirVideo = useCircuitosStore((s) => s.definirVideo)
  const [etapa, setEtapa] = useState<'fechado' | 'portao' | 'link'>('fechado')
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')

  function salvar() {
    const link = linkDeVideo(texto.trim())
    if (!link) return setErro('Cole um link do YouTube ou de uma aula da Hotmart.')
    definirVideo(circuito.id, link)
    setEtapa('fechado')
  }

  return (
    <div className="flex flex-col gap-2">
      {circuito.video ? (
        <div className="flex flex-col gap-1 rounded-2xl border-4 border-red-200 bg-white p-2">
          <p className="text-sm font-extrabold">🎬 Vídeo de exemplo do treino</p>
          <VideoReal titulo={`Treino: ${circuito.nome}`} video={circuito.video} />
        </div>
      ) : null}
      {comEdicao && (
        <button
          type="button"
          onClick={() => {
            setTexto(circuito.video ?? '')
            setErro('')
            setEtapa('portao')
          }}
          className="self-start rounded-full border-2 border-red-200 bg-white px-3 py-1 text-sm font-bold"
        >
          {circuito.video ? '✏️ Trocar o vídeo (adulto)' : '🎬 Pôr um vídeo de exemplo (adulto)'}
        </button>
      )}

      <Modal aberto={etapa !== 'fechado'} aoFechar={() => setEtapa('fechado')} titulo="Vídeo do treino">
        {etapa === 'portao' && <PortaoDosPais aoLiberar={() => setEtapa('link')} />}
        {etapa === 'link' && (
          <div className="flex flex-col gap-3">
            <p className="text-base">
              Cole o link de um vídeo mostrando o treino <b>{circuito.nome}</b> (YouTube ou aula da Hotmart). A criança assiste depois da conta de adulto.
            </p>
            <input
              type="url"
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value)
                setErro('')
              }}
              placeholder="https://youtu.be/..."
              className="min-h-12 rounded-xl border-2 border-red-200 px-3"
            />
            {erro && <p className="font-bold text-red-700">❌ {erro}</p>}
            <button type="button" onClick={salvar} className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow">
              Salvar o vídeo ✅
            </button>
            {doFamilia && (
              <button
                type="button"
                onClick={() => {
                  definirVideo(circuito.id, null)
                  setEtapa('fechado')
                }}
                className="min-h-12 rounded-2xl border-4 border-red-200 bg-white font-bold text-red-800"
              >
                Tirar o vídeo que pus
              </button>
            )}
            <p className="text-xs">O vídeo vale em todos os aparelhos da família. Para a turma inteira, o treinador põe o link no editor do circuito.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
