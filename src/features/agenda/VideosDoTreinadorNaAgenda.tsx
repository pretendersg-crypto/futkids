// Agenda → "🎬 Vídeos do treinador": os vídeos que o treinador da escolinha mandou para a turma
// (táticos) e só para este atleta. Só aparece com escolinha e com algum vídeo.
import { useState } from 'react'
import { useContaStore } from '../../conta/contaStore'
import { useTurmasStore, type VideoGuardado } from '../../conta/turmasStore'
import { VideoDoTreinador } from '../../components/video/VideoDoTreinador'

const VAZIO: VideoGuardado[] = []
const TIPOS: Record<VideoGuardado['tipo'], string> = { tatico: '🧠 Tático', exercicio: '🏃 Exercício', outro: '🎬 Vídeo' }

export function VideosDoTreinadorNaAgenda() {
  const atleta = useContaStore((s) => s.atletaAtivo)
  const videos = useTurmasStore((s) => (atleta ? s.videosPorAtleta[atleta] : undefined)) ?? VAZIO
  const [aberto, setAberto] = useState<string | null>(null)
  if (videos.length === 0) return null

  return (
    <section className="flex flex-col gap-2 rounded-3xl border-4 border-red-200 bg-white p-3">
      <h2 className="text-xl font-extrabold">🎬 Vídeos do treinador</h2>
      <ul className="flex flex-col gap-2">
        {videos.map((v) => (
          <li key={v.id} className="flex flex-col gap-2 rounded-2xl bg-red-50 p-2">
            <button type="button" onClick={() => setAberto((x) => (x === v.id ? null : v.id))} className="flex items-center gap-2 text-left">
              <span className="flex-1">
                <span className="block text-base font-extrabold">{v.titulo}</span>
                <span className="text-sm">
                  {TIPOS[v.tipo]} · {v.atleta ? '👤 Só para você' : '👥 Para a turma'} · {new Date(v.em).toLocaleDateString('pt-BR')}
                </span>
              </span>
              <span aria-hidden className="text-2xl">
                {aberto === v.id ? '🔽' : '▶️'}
              </span>
            </button>
            {aberto === v.id && <VideoDoTreinador caminho={v.caminho} titulo={v.titulo} />}
          </li>
        ))}
      </ul>
    </section>
  )
}
