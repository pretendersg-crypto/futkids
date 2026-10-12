// Vídeos do treinador (turma toda ou um atleta): espaço usado do plano, enviar (com progresso e a
// declaração de autorização de imagem), assistir e apagar. Usado na tela da turma (celular) e no painel.
import { useEffect, useState } from 'react'
import { VideoDoTreinador } from '../../components/video/VideoDoTreinador'
import type { DadosEscolinha, Membro } from '../../conta/nuvemEscolinha'
import type { TipoVideo, VideoDoTreinador as Video } from '../../conta/nuvemVideos'
import { BOTAO, useAcao } from '../conta/acao'
import { MensagemErro } from '../conta/comum'

const nuvem = () => import('../../conta/nuvemVideos')

const TIPOS: Record<TipoVideo, string> = { tatico: '🧠 Tático', exercicio: '🏃 Exercício', outro: '🎬 Outro' }
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`

interface Props {
  uid: string
  escolinha: DadosEscolinha
  turma: { id: string; nome: string }
  atletas: Membro[]
  /** Controlado por fora (painel): null = turma toda; undefined = o próprio componente escolhe */
  para?: string | null
  /** Avisa a lista atual (para pendurar o vídeo num treino do plano) */
  aoListar?: (videos: Video[]) => void
}

export function VideosDoTreinador({ uid, escolinha, turma, atletas, para: paraDeFora, aoListar }: Props) {
  const [paraAqui, setParaAqui] = useState<string | null>(null)
  const para = paraDeFora === undefined ? paraAqui : paraDeFora
  const [videos, setVideos] = useState<Video[] | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<TipoVideo>('tatico')
  const [declaro, setDeclaro] = useState(false)
  const [progresso, setProgresso] = useState<number | null>(null)
  const [usado, setUsado] = useState(escolinha.videosBytes)
  const { ocupado, erro, rodar } = useAcao()
  const limite = (escolinha.limites.videosMB ?? 1024) * 1024 * 1024

  useEffect(() => {
    let vivo = true
    nuvem()
      .then((n) => n.listarVideos(escolinha.id, turma.id, para))
      .then((l) => {
        if (!vivo) return
        setVideos(l)
        aoListar?.(l)
      })
      .catch(() => vivo && setVideos([]))
    return () => {
      vivo = false
    }
  }, [escolinha.id, turma.id, para, aoListar])

  const nomePara = para ? (atletas.find((m) => m.atleta === para)?.apelido ?? 'atleta') : `toda a turma ${turma.nome}`
  const cheio = arquivo ? usado + arquivo.size > limite : usado >= limite

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold">
          Espaço de vídeos: {mb(usado)} de {mb(limite)}
        </p>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full ${usado / limite > 0.9 ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: `${Math.min(100, (usado / limite) * 100)}%` }} />
        </div>
      </div>

      {paraDeFora === undefined && (
        <label className="flex flex-col gap-1 font-bold">
          Vídeos para
          <select value={para ?? ''} onChange={(e) => setParaAqui(e.target.value || null)} className="min-h-12 rounded-xl border-2 border-sky-200 bg-white px-2">
            <option value="">👥 Toda a turma (ex.: táticos)</option>
            {atletas.map((m) => (
              <option key={m.atleta!} value={m.atleta!}>
                👤 Só {m.apelido}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-col gap-2 rounded-2xl bg-white p-3">
        <p className="font-extrabold">⬆️ Enviar vídeo para {nomePara}</p>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null
            setArquivo(f)
            if (f && !titulo) setTitulo(f.name.replace(/\.[^.]+$/, '').slice(0, 80))
          }}
          className="text-sm"
        />
        {arquivo && <p className="text-xs">{mb(arquivo.size)} · até 200 MB por vídeo. Dica: grave em 720p para ficar leve.</p>}
        <input value={titulo} onChange={(e) => setTitulo(e.target.value.slice(0, 80))} placeholder="Título (ex.: Saída na cruz — o que corrigir)" className="min-h-11 rounded-xl border-2 border-sky-200 px-3" />
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoVideo)} className="min-h-11 rounded-xl border-2 border-sky-200 bg-white px-2">
          {Object.entries(TIPOS).map(([id, nome]) => (
            <option key={id} value={id}>
              {nome}
            </option>
          ))}
        </select>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={declaro} onChange={(e) => setDeclaro(e.target.checked)} className="mt-0.5 size-5 shrink-0" />
          <span>
            Declaro que as crianças que aparecem no vídeo têm <b>autorização dos responsáveis</b> e que o vídeo é só para {nomePara} (não vou publicar fora do
            app).
          </span>
        </label>
        {cheio && <p className="text-sm font-bold text-red-700">Não cabe no espaço do plano. Apague vídeos antigos ou veja os planos.</p>}
        {progresso !== null && (
          <div className="h-3 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={Math.round(progresso * 100)} aria-label="Enviando">
            <div className="h-full bg-green-500" style={{ width: `${progresso * 100}%` }} />
          </div>
        )}
        <button
          type="button"
          disabled={ocupado || !arquivo || !titulo.trim() || !declaro || cheio}
          onClick={() =>
            rodar(async () => {
              setProgresso(0)
              try {
                const v = await (await nuvem()).subirVideo({ escolinha: escolinha.id, turma: turma.id, atleta: para, arquivo: arquivo!, titulo: titulo.trim(), tipo, uid, aoProgresso: setProgresso })
                const lista = [v, ...(videos ?? [])]
                setVideos(lista)
                aoListar?.(lista)
                setUsado((u) => u + v.bytes)
                setArquivo(null)
                setTitulo('')
                setDeclaro(false)
              } finally {
                setProgresso(null)
              }
            })
          }
          className={`${BOTAO} bg-sol`}
        >
          {progresso !== null ? `Enviando… ${Math.round(progresso * 100)}%` : '⬆️ Enviar'}
        </button>
        <MensagemErro erro={erro} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-extrabold">Vídeos de {nomePara}</p>
        {!videos && <p>Carregando…</p>}
        {videos?.length === 0 && <p className="text-sm">Nenhum vídeo ainda.</p>}
        {videos?.map((v) => (
          <div key={v.id} className="flex flex-col gap-1 rounded-2xl bg-white p-2">
            <div className="flex items-center gap-2">
              <span className="flex-1">
                <span className="block font-bold">{v.titulo}</span>
                <span className="text-xs">
                  {TIPOS[v.tipo]} · {mb(v.bytes)} · {new Date(v.em).toLocaleDateString('pt-BR')}
                </span>
              </span>
              <button
                type="button"
                disabled={ocupado}
                onClick={() =>
                  confirm(`Apagar "${v.titulo}"? Ele some também dos treinos em que estiver.`) &&
                  rodar(async () => {
                    await (await nuvem()).apagarVideo(escolinha.id, v)
                    const lista = (videos ?? []).filter((x) => x.id !== v.id)
                    setVideos(lista)
                    aoListar?.(lista)
                    setUsado((u) => Math.max(0, u - v.bytes))
                  })
                }
                className="rounded-lg px-2 text-red-700"
                aria-label={`Apagar ${v.titulo}`}
              >
                🗑️
              </button>
            </div>
            <VideoDoTreinador caminho={v.caminho} titulo={v.titulo} compacto />
          </div>
        ))}
      </div>
    </div>
  )
}
