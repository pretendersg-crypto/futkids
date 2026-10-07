// Saída do gol com cones (/goleiro/saida): lista dos circuitos e o "dicionário" dos gestos
// técnicos, cada um com o desenho e como fazer.
import { Link, useSearchParams } from 'react-router'
import { CIRCUITOS, NOME_NIVEL } from '../features/saidaGol/circuitos'
import { DesenhoGesto } from '../features/saidaGol/DesenhoGesto'
import { LISTA_GESTOS } from '../features/saidaGol/gestos'
import { QuadraCones } from '../features/saidaGol/QuadraCones'

export function SaidaGol() {
  const [params, setParams] = useSearchParams()
  const aba = params.get('aba') === 'gestos' ? 'gestos' : 'circuitos'

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link to="/goleiro" aria-label="Voltar ao goleiro" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">🔶 Saída do gol com cones</h1>
      </header>

      <div role="tablist" aria-label="Partes da saída do gol" className="grid grid-cols-2 gap-1 rounded-3xl bg-white p-1 shadow">
        {(
          [
            ['circuitos', '🔶 Circuitos'],
            ['gestos', '✍️ Gestos técnicos'],
          ] as const
        ).map(([id, nome]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={aba === id}
            onClick={() => setParams(id === 'gestos' ? { aba: id } : {}, { replace: true })}
            className={`min-h-12 rounded-3xl text-base font-extrabold ${aba === id ? 'bg-sky-600 text-white' : ''}`}
          >
            {nome}
          </button>
        ))}
      </div>

      {aba === 'circuitos' ? (
        <>
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
        </>
      ) : (
        <ul className="flex flex-col gap-3">
          {LISTA_GESTOS.map((g) => (
            <li key={g.id} className="flex flex-col gap-2 rounded-3xl border-4 border-sky-200 bg-white p-3 sm:flex-row">
              <div className="self-center rounded-2xl bg-green-50 p-1">
                <DesenhoGesto gesto={g.id} tamanho={150} />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <h2 className="text-xl font-extrabold">{g.nome}</h2>
                <p className="text-sm font-bold text-sky-800">{g.resumo}</p>
                <ol className="flex list-decimal flex-col gap-0.5 pl-5 text-base">
                  {g.comoFazer.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
                <p className="rounded-xl bg-amber-50 p-2 text-sm">⚠️ {g.atencao}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
