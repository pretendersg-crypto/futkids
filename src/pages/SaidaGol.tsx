// Saída do gol com cones (/goleiro/saida): lista dos circuitos (e o atalho para o catálogo dos
// fundamentos e gestos, em /goleiro/gestos).
import { Link } from 'react-router'
import { CIRCUITOS, NOME_NIVEL } from '../features/saidaGol/circuitos'
import { QuadraCones } from '../features/saidaGol/QuadraCones'

export function SaidaGol() {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link to="/goleiro" aria-label="Voltar ao goleiro" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">🔶 Saída do gol com cones</h1>
      </header>

      <Link to="/goleiro/gestos" className="flex min-h-14 items-center gap-3 rounded-2xl border-4 border-sky-300 bg-white px-3 font-extrabold">
        <span aria-hidden className="text-2xl">
          📖
        </span>
        <span className="flex-1">Ver todos os fundamentos e gestos (desenhos e vídeos)</span>
        ▶️
      </Link>

      <p className="rounded-2xl bg-sky-50 p-3 text-base">
        Monte os cones como no desenho (o gol fica embaixo) e siga o passo a passo. Cada passo mostra o <b>gesto técnico</b> desenhado.
      </p>
      <ul className="flex flex-col gap-3">
        {CIRCUITOS.map((c) => (
          <li key={c.id}>
            <Link to={`/goleiro/saida/${c.id}`} className="flex flex-col gap-2 rounded-3xl border-4 border-sky-400 bg-white p-3 shadow-md">
              <span className="flex items-center gap-3">
                <span aria-hidden className="text-4xl">
                  {c.emoji}
                </span>
                <span className="flex flex-1 flex-col leading-tight">
                  <span className="text-xl font-extrabold">{c.nome}</span>
                  <span className="text-sm font-bold">
                    {NOME_NIVEL[c.nivel]} · {c.cones.length} cones · {c.passos.length} passos
                  </span>
                </span>
                <span aria-hidden className="text-3xl">
                  ▶️
                </span>
              </span>
              <QuadraCones circuito={c} passo={null} />
              <span className="text-base">{c.objetivo}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
