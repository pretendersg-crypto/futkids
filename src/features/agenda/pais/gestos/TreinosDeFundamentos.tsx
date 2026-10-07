// Área dos pais: os treinos de fundamentos do goleiro salvos (criar, mudar, apagar).
import { useTreinosFundamentosStore } from '../../../../stores/treinosFundamentosStore'

export function TreinosDeFundamentos({ aoEditar }: { aoEditar: (id: string | null) => void }) {
  const treinos = useTreinosFundamentosStore((s) => s.treinos)

  return (
    <section className="flex flex-col gap-2 rounded-3xl border-4 border-violet-200 bg-white p-3">
      <h2 className="text-xl font-extrabold">📋 Treinos de fundamentos</h2>
      <p className="text-sm">
        Escolha os fundamentos e gestos, quantas vezes cada um, e dê um nome. Depois coloque o treino em qualquer dia do calendário (toque no dia →
        "Incluir treino").
      </p>
      <button
        type="button"
        onClick={() => aoEditar(null)}
        className="min-h-14 rounded-2xl border-4 border-dashed border-violet-400 bg-violet-50 text-lg font-extrabold"
      >
        ➕ Criar treino de fundamentos
      </button>
      <ul className="flex flex-col gap-2">
        {treinos.map((t) => (
          <li key={t.id}>
            <button type="button" onClick={() => aoEditar(t.id)} className="flex min-h-16 w-full items-center gap-3 rounded-2xl border-4 border-sky-200 bg-sky-50 p-2 text-left">
              <span aria-hidden className="text-3xl">
                {t.emoji}
              </span>
              <span className="flex flex-1 flex-col leading-tight">
                <span className="font-extrabold">{t.nome}</span>
                <span className="text-xs font-bold">
                  {t.itens.length} {t.itens.length === 1 ? 'fundamento' : 'fundamentos'}
                  {t.descricao ? ` · ${t.descricao}` : ''}
                </span>
              </span>
              <span aria-hidden className="text-xl">
                ✏️
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
