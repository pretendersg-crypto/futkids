// Saída do gol com cones (/goleiro/saida): como funciona (monte, siga, repita), a lista dos
// circuitos do fácil ao difícil (desenho do caminho, gestos usados) e o atalho para os fundamentos.
import { Link } from 'react-router'
import { CIRCUITOS, NOME_NIVEL } from '../features/saidaGol/circuitos'
import { gestoProntoPorId } from '../features/saidaGol/gestos'
import { QuadraCones } from '../features/saidaGol/QuadraCones'

const COMO_FUNCIONA = [
  { emoji: '🔺', titulo: 'Monte', texto: 'Ponha os cones nos lugares do desenho.' },
  { emoji: '👣', titulo: 'Siga', texto: 'Faça um passo de cada vez, com o gesto certo.' },
  { emoji: '🔁', titulo: 'Repita', texto: 'Faça as voltas e marque que fez.' },
]

export function SaidaGol() {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link to="/goleiro" aria-label="Voltar ao goleiro" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">🔶 Saída do gol com cones</h1>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {COMO_FUNCIONA.map((c, i) => (
          <div key={c.titulo} className="flex flex-col items-center gap-1 rounded-2xl border-4 border-sky-200 bg-white p-2 text-center">
            <span className="text-3xl" aria-hidden>
              {c.emoji}
            </span>
            <span className="font-extrabold">
              {i + 1}. {c.titulo}
            </span>
            <span className="text-xs leading-tight">{c.texto}</span>
          </div>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {CIRCUITOS.map((c) => {
          const usados = [...new Set(c.passos.map((p) => p.gesto))].map((id) => gestoProntoPorId(id)?.nome ?? id)
          return (
            <li key={c.id}>
              <Link to={`/goleiro/saida/${c.id}`} className="flex gap-3 rounded-3xl border-4 border-sky-400 bg-white p-2 shadow-md">
                <div className="w-32 shrink-0 sm:w-40">
                  <QuadraCones circuito={c} modo="percurso" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-lg leading-tight font-extrabold">
                    <span aria-hidden>{c.emoji} </span>
                    {c.nome}
                  </span>
                  <span className="text-xs font-bold">
                    {NOME_NIVEL[c.nivel]} · {c.cones.length} cones · {c.passos.length} passos
                  </span>
                  <span className="text-sm leading-snug">{c.objetivo}</span>
                  <span className="flex flex-wrap gap-1">
                    {usados.map((n) => (
                      <span key={n} className="rounded-full bg-green-100 px-2 text-xs font-bold">
                        {n}
                      </span>
                    ))}
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <Link to="/fundamentos?tipo=goleiro" className="flex min-h-14 items-center gap-3 rounded-2xl border-4 border-sky-300 bg-white px-3 font-extrabold">
        <span aria-hidden className="text-2xl">
          📖
        </span>
        <span className="flex-1">Ver todos os fundamentos e gestos (desenhos e vídeos)</span>
        ▶️
      </Link>
    </section>
  )
}
