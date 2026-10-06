// Menu do goleiro: escolha do nível, os 3 minijogos (com o recorde de cada um) e os fundamentos.
import { Link, useSearchParams } from 'react-router'
import { JOGOS, NIVEIS, chaveRecorde, nivelLiberado, nivelPorId } from '../features/goleiro/niveis'
import { useProgressStore } from '../stores/progressStore'
import { nivelPorXP } from '../utils/nivel'

export function Goleiro() {
  const xp = useProgressStore((s) => s.xp)
  const recordes = useProgressStore((s) => s.recordes)
  const nivelJogador = nivelPorXP(xp).nivel
  const [params, setParams] = useSearchParams()

  // Nível escolhido fica no endereço (?nivel=...), assim o "voltar" do jogo cai no mesmo nível
  const liberados = NIVEIS.filter((n) => nivelLiberado(n, nivelJogador))
  const pedido = nivelPorId(params.get('nivel') ?? undefined)
  const nivel = pedido && nivelLiberado(pedido, nivelJogador) ? pedido : liberados[liberados.length - 1]

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-center text-3xl font-extrabold">🧤 Treino de Goleiro</h1>

      <div role="radiogroup" aria-label="Nível" className="grid grid-cols-3 gap-2">
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
              onClick={() => setParams({ nivel: n.id }, { replace: true })}
              className={`flex min-h-18 flex-col items-center justify-center rounded-2xl border-4 px-1 text-sm leading-tight ${
                escolhido ? 'border-sky-600 bg-sky-100 font-extrabold' : 'border-transparent bg-white font-medium'
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

      <ul className="flex flex-col gap-3">
        {JOGOS.map((j) => {
          const recorde = recordes[chaveRecorde(j.id, nivel.id)]
          return (
            <li key={j.id}>
              <Link
                to={`/goleiro/${j.id}/${nivel.id}`}
                className="flex min-h-24 items-center gap-4 rounded-3xl border-4 border-sky-400 bg-sky-100 p-4 shadow-md"
              >
                <span aria-hidden className="text-5xl">
                  {j.emoji}
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-xl font-extrabold">{j.nome}</span>
                  <span className="text-base">{j.descricao}</span>
                  <span className="text-sm font-bold">{recorde !== undefined ? `🏅 Recorde: ${recorde}/10` : '✨ Ainda não jogou'}</span>
                </span>
                <span aria-hidden className="text-3xl">
                  ▶️
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <Link
        to="/goleiro/fundamentos"
        className="flex min-h-20 items-center gap-4 rounded-3xl border-4 border-dashed border-sky-400 bg-white p-4"
      >
        <span aria-hidden className="text-4xl">
          📚
        </span>
        <span className="flex flex-col">
          <span className="text-lg font-extrabold">Fundamentos com bola de verdade</span>
          <span className="text-sm">Encaixe, saída de gol e reposição</span>
        </span>
      </Link>
    </section>
  )
}
