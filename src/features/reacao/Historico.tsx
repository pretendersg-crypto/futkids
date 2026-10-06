// Histórico do treino de reação: totais, gráfico da reação média (modo toque) e a lista de
// cada vez que um drill foi feito, por dia. Apagar tudo só com o portão dos pais.
import { useMemo, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { PortaoDosPais } from '../../components/ui/PortaoDosPais'
import { useReacaoStore, type SessaoReacao } from '../../stores/reacaoStore'
import { hojeISO } from '../../utils/data'
import { formatarDuracao, formatarMs } from './finalizar'

const diaDe = (s: SessaoReacao) => hojeISO(new Date(s.quando))

function rotuloDoDia(iso: string): string {
  const hoje = hojeISO()
  const ontem = hojeISO(new Date(Date.now() - 86_400_000))
  if (iso === hoje) return 'Hoje'
  if (iso === ontem) return 'Ontem'
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })
}

export function Historico() {
  const sessoes = useReacaoStore((s) => s.sessoes)
  const limparHistorico = useReacaoStore((s) => s.limparHistorico)
  const [filtro, setFiltro] = useState<string>('todos')
  const [apagar, setApagar] = useState<'portao' | 'confirmar' | null>(null)

  // Drills que aparecem no histórico (para o filtro), do mais recente para o mais antigo
  const drills = useMemo(() => {
    const vistos = new Map<string, { id: string; nome: string; emoji: string }>()
    for (const s of [...sessoes].reverse()) if (!vistos.has(s.drillId)) vistos.set(s.drillId, { id: s.drillId, nome: s.nome, emoji: s.emoji })
    return [...vistos.values()]
  }, [sessoes])

  const lista = useMemo(() => sessoes.filter((s) => filtro === 'todos' || s.drillId === filtro), [sessoes, filtro])
  const porDia = useMemo(() => {
    const grupos = new Map<string, SessaoReacao[]>()
    for (const s of [...lista].reverse()) grupos.set(diaDe(s), [...(grupos.get(diaDe(s)) ?? []), s])
    return [...grupos.entries()]
  }, [lista])

  if (sessoes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl border-4 border-dashed border-teal-300 bg-white p-6 text-center">
        <span aria-hidden className="text-6xl">
          📈
        </span>
        <p className="text-xl font-extrabold">Nenhum treino ainda</p>
        <p>Faça um drill e ele aparece aqui, com a data, os sinais e o tempo de reação.</p>
      </div>
    )
  }

  const comMedia = lista.filter((s) => s.mediaMs !== undefined)
  const melhor = comMedia.length ? Math.min(...comMedia.map((s) => s.mediaMs!)) : undefined
  const dias = new Set(lista.map(diaDe)).size

  return (
    <div className="flex flex-col gap-4">
      {/* Filtro por drill */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {[{ id: 'todos', nome: 'Todos', emoji: '📋' }, ...drills].map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={filtro === d.id}
            onClick={() => setFiltro(d.id)}
            className={`min-h-11 shrink-0 rounded-full border-2 px-3 font-bold whitespace-nowrap ${filtro === d.id ? 'border-teal-600 bg-teal-100' : 'border-teal-200 bg-white'}`}
          >
            {d.emoji} {d.nome}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-2">
        <Total emoji="🏋️" valor={String(lista.length)} rotulo="treinos" />
        <Total emoji="📅" valor={String(dias)} rotulo={dias === 1 ? 'dia' : 'dias'} />
        <Total emoji="🚦" valor={String(lista.reduce((t, s) => t + s.sinais, 0))} rotulo="sinais" />
        <Total emoji="⚡" valor={melhor !== undefined ? formatarMs(melhor) : '—'} rotulo="melhor reação média" />
      </ul>

      {/* Gráfico só de um drill por vez: drills diferentes têm tempos diferentes */}
      {filtro !== 'todos' && comMedia.length >= 2 && <GraficoReacao sessoes={comMedia.slice(-20)} />}
      {filtro === 'todos' && comMedia.length >= 2 && (
        <p className="rounded-2xl bg-teal-50 p-3 text-sm font-bold">📉 Toque num drill de tela (ex.: ⏱️ Teste de reação) aqui em cima para ver o gráfico da reação.</p>
      )}

      {porDia.map(([dia, doDia]) => (
        <section key={dia} className="flex flex-col gap-2">
          <h3 className="text-lg font-extrabold capitalize">{rotuloDoDia(dia)}</h3>
          <ul className="flex flex-col gap-2">
            {doDia.map((s) => (
              <LinhaSessao key={s.id} sessao={s} />
            ))}
          </ul>
        </section>
      ))}

      <button type="button" onClick={() => setApagar('portao')} className="min-h-12 rounded-2xl border-4 border-red-200 bg-white font-bold text-red-800">
        🗑️ Apagar histórico
      </button>
      <Modal aberto={apagar !== null} aoFechar={() => setApagar(null)} titulo="Apagar histórico">
        {apagar === 'portao' && <PortaoDosPais aoLiberar={() => setApagar('confirmar')} />}
        {apagar === 'confirmar' && (
          <div className="flex flex-col gap-3">
            <p className="text-lg">Apagar os {sessoes.length} treinos de reação guardados neste aparelho? Não dá para desfazer.</p>
            <button
              type="button"
              onClick={() => {
                limparHistorico()
                setApagar(null)
                setFiltro('todos')
              }}
              className="min-h-14 rounded-2xl bg-red-700 text-xl font-extrabold text-white"
            >
              Apagar tudo
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Total({ emoji, valor, rotulo }: { emoji: string; valor: string; rotulo: string }) {
  return (
    <li className="flex flex-col rounded-2xl border-4 border-teal-200 bg-white p-2 text-center">
      <span className="text-2xl font-black">
        <span aria-hidden>{emoji} </span>
        {valor}
      </span>
      <span className="text-sm font-bold">{rotulo}</span>
    </li>
  )
}

function LinhaSessao({ sessao: s }: { sessao: SessaoReacao }) {
  const hora = new Date(s.quando).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const acerto = s.acertos !== undefined ? Math.round((s.acertos / s.sinais) * 100) : undefined
  return (
    <li className="flex items-center gap-3 rounded-2xl border-4 border-teal-100 bg-white p-2">
      <span aria-hidden className="text-3xl">
        {s.emoji}
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate font-extrabold">
          {s.nome} {!s.completo && <span className="text-xs font-bold text-orange-700">(parou antes)</span>}
        </span>
        <span className="text-sm">
          {hora} · {s.sinais} sinais · {s.seriesFeitas}/{s.seriesTotal} séries · {formatarDuracao(s.duracaoS)}
        </span>
        {acerto !== undefined && (
          <span className="text-sm font-bold">
            🎯 {acerto}% {s.mediaMs !== undefined && `· ⚡ ${formatarMs(s.mediaMs)}`} {s.melhorMs !== undefined && `· 🚀 ${formatarMs(s.melhorMs)}`}
          </span>
        )}
      </span>
    </li>
  )
}

/** Linha da reação média ao longo das vezes (para baixo = mais rápido = melhor) */
function GraficoReacao({ sessoes }: { sessoes: SessaoReacao[] }) {
  const L = 320
  const A = 140
  const M = 24
  const valores = sessoes.map((s) => s.mediaMs!)
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const faixa = Math.max(50, max - min)
  const x = (i: number) => M + (i * (L - 2 * M)) / Math.max(1, valores.length - 1)
  // Mais lento em cima, mais rápido embaixo
  const y = (v: number) => M + ((max - v) / faixa) * (A - 2 * M)
  const pontos = valores.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const primeira = valores[0]
  const ultima = valores[valores.length - 1]
  const melhorou = ultima < primeira

  return (
    <figure className="flex flex-col gap-1 rounded-3xl border-4 border-teal-200 bg-white p-3">
      <figcaption className="font-extrabold">⚡ Reação média nas últimas {valores.length} vezes</figcaption>
      <svg viewBox={`0 0 ${L} ${A}`} className="w-full" role="img" aria-label={`De ${formatarMs(primeira)} para ${formatarMs(ultima)}`}>
        <text x={4} y={M - 8} fontSize="10" fill="#475569">
          mais lento {formatarMs(max)}
        </text>
        <text x={4} y={A - 6} fontSize="10" fill="#475569">
          mais rápido {formatarMs(min)}
        </text>
        <polyline points={pontos} fill="none" stroke="#0d9488" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {valores.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={v === min ? 6 : 4} fill={v === min ? '#16a34a' : '#0d9488'} />
        ))}
      </svg>
      <p className="text-sm font-bold">
        {melhorou ? `📉 Ficou ${formatarMs(primeira - ultima)} mais rápido. Muito bem!` : 'Continue treinando: a linha descendo é a reação ficando mais rápida.'}
      </p>
    </figure>
  )
}
