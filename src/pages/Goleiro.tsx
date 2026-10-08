// Menu do goleiro, em dois blocos bem separados:
//  - 🏃 Treino com o corpo: treinos de fundamentos dos pais, saída do gol com cones, fundamentos com
//    bola de verdade e o catálogo dos gestos (para estudar o movimento antes de treinar);
//  - 🎮 Jogo na tela: escolha do nível e os 3 minijogos (com o recorde de cada um).
// ?tipo=tela mostra os jogos primeiro (atalho da tela inicial); o padrão é o treino com o corpo.
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { BlocoTipo } from '../components/ui/TipoAtividade'
import { JOGOS, NIVEIS, chaveRecorde, nivelLiberado, nivelPorId } from '../features/goleiro/niveis'
import { useProgressStore } from '../stores/progressStore'
import { useTreinosFundamentosStore } from '../stores/treinosFundamentosStore'
import { nivelPorXP } from '../utils/nivel'

/** Cartão de atalho dentro de um bloco */
function Cartao({ para, emoji, titulo, texto, extra }: { para: string; emoji: string; titulo: string; texto: string; extra?: ReactNode }) {
  return (
    <Link to={para} className="flex min-h-20 items-center gap-4 rounded-3xl border-4 border-white bg-white p-3 shadow-md">
      <span aria-hidden className="text-4xl">
        {emoji}
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-xl leading-tight font-extrabold">{titulo}</span>
        <span className="text-base leading-snug">{texto}</span>
        {extra}
      </span>
      <span aria-hidden className="text-3xl">
        ▶️
      </span>
    </Link>
  )
}

export function Goleiro() {
  const xp = useProgressStore((s) => s.xp)
  const recordes = useProgressStore((s) => s.recordes)
  const nivelJogador = nivelPorXP(xp).nivel
  const [params, setParams] = useSearchParams()
  const treinosFundamentos = useTreinosFundamentosStore((s) => s.treinos)
  const telaPrimeiro = params.get('tipo') === 'tela'

  // Nível escolhido fica no endereço (?nivel=...), assim o "voltar" do jogo cai no mesmo nível
  const liberados = NIVEIS.filter((n) => nivelLiberado(n, nivelJogador))
  const pedido = nivelPorId(params.get('nivel') ?? undefined)
  const nivel = pedido && nivelLiberado(pedido, nivelJogador) ? pedido : liberados[liberados.length - 1]

  const corpo = (
    <BlocoTipo tipo="corpo" titulo="Treinos de goleiro" explicacao="Com bola, cones e o corpo todo. Apoie o celular e siga o passo a passo." key="corpo">
      {treinosFundamentos.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-extrabold">📋 Treinos de fundamentos</h2>
          <ul className="flex flex-col gap-2">
            {treinosFundamentos.map((t) => (
              <li key={t.id}>
                <Cartao para={`/goleiro/treino/${t.id}`} emoji={t.emoji} titulo={t.nome} texto={`${t.itens.length} fundamentos${t.descricao ? ` · ${t.descricao}` : ''}`} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <Cartao para="/goleiro/saida" emoji="🔶" titulo="Saída do gol com cones" texto="Circuitos passo a passo, com o gesto técnico desenhado" />
      <Cartao para="/goleiro/fundamentos" emoji="📚" titulo="Fundamentos com bola" texto="Encaixe, saída de gol e reposição" />
      <Cartao para="/goleiro/gestos" emoji="📖" titulo="Fundamentos e gestos" texto="Veja como fazer cada gesto (desenho e vídeo) antes de treinar" />
    </BlocoTipo>
  )

  const tela = (
    <BlocoTipo tipo="tela" titulo="Jogos de goleiro" explicacao="Defenda com os dedos na tela. Escolha o nível e jogue!" key="tela">
      <div role="radiogroup" aria-label="Nível dos jogos" className="grid grid-cols-3 gap-2">
        {NIVEIS.map((n) => {
          const liberado = nivelLiberado(n, nivelJogador)
          const escolhido = n.id === nivel.id
          return (
            <button
              key={n.id}
              type="button"
              role="radio"
              aria-checked={escolhido}
              disabled={!liberado}
              onClick={() => setParams({ nivel: n.id, ...(telaPrimeiro ? { tipo: 'tela' } : {}) }, { replace: true })}
              className={`flex min-h-18 flex-col items-center justify-center rounded-2xl border-4 px-1 text-sm leading-tight ${
                escolhido ? 'border-indigo-600 bg-white font-extrabold' : 'border-transparent bg-white/70 font-medium'
              } ${liberado ? '' : 'opacity-60'}`}
            >
              <span aria-hidden className="text-2xl">
                {liberado ? n.emoji : '🔒'}
              </span>
              {n.nome}
              {!liberado && <span className="text-xs font-bold">Nível {n.nivelJogadorMinimo}</span>}
            </button>
          )
        })}
      </div>
      <ul className="flex flex-col gap-2">
        {JOGOS.map((j) => {
          const recorde = recordes[chaveRecorde(j.id, nivel.id)]
          return (
            <li key={j.id}>
              <Cartao
                para={`/goleiro/${j.id}/${nivel.id}`}
                emoji={j.emoji}
                titulo={j.nome}
                texto={j.descricao}
                extra={<span className="text-sm font-bold">{recorde !== undefined ? `🏅 Recorde: ${recorde}/10` : '✨ Ainda não jogou'}</span>}
              />
            </li>
          )
        })}
      </ul>
    </BlocoTipo>
  )

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-center text-3xl font-extrabold">🧤 Goleiro</h1>
      {telaPrimeiro ? [tela, corpo] : [corpo, tela]}
    </section>
  )
}
