// Menu de treinos, separado por categoria (Baby → Lenda): o aquecimento (sempre primeiro) e as
// séries de velocidade, rápido e devagar, força, prevenção e alongamento, além dos treinos dos pais.
// O que é de uma categoria acima fica com cadeado (a não ser que esteja na agenda de hoje).
import { Link } from 'react-router'
import { SeloTipo } from '../components/ui/TipoAtividade'
import { CATEGORIAS, categoriaLiberada } from '../data/categorias'
import { categoriaDaSerie, useAgendaDeHoje, useCategoria } from '../features/categoria/categoria'
import { AvisoAquecer } from '../features/treino/AvisoAquecer'
import { useAqueceuHoje } from '../features/treino/useAqueceuHoje'
import { todasAsSeries } from '../features/treino/series'
import { useTreinosStore } from '../stores/treinosStore'
import { useProgressStore } from '../stores/progressStore'

export function Treinos() {
  const contadores = useProgressStore((s) => s.contadores)
  const aqueceu = useAqueceuHoje()
  const extras = useTreinosStore((s) => s.seriesExtras)
  const trocas = useTreinosStore((s) => s.categorias)
  const { atual, nivel } = useCategoria()
  const agenda = useAgendaDeHoje()
  const series = todasAsSeries(extras).map((s) => ({ ...s, categoria: categoriaDaSerie(s, trocas) }))

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-center text-3xl font-extrabold">💪 Treinos</h1>
      <SeloTipo tipo="corpo" className="-mt-2 self-center px-3 py-1 text-sm" />
      <p className={`self-center rounded-full border-4 px-4 py-1 text-lg font-extrabold ${atual.cor}`}>
        {atual.emoji} Você é {atual.nome} · nível {nivel}
      </p>
      <AvisoAquecer />

      <Link to="/treinos/videos" className="flex min-h-16 items-center gap-4 rounded-3xl border-4 border-red-300 bg-white p-3 shadow-md">
        <span aria-hidden className="text-4xl">
          📺
        </span>
        <span className="flex flex-1 flex-col">
          <span className="text-xl font-extrabold">Vídeos do treinador</span>
          <span className="text-sm">Por categoria, abertos por um adulto</span>
        </span>
        <span aria-hidden className="text-3xl">
          ▶️
        </span>
      </Link>

      {CATEGORIAS.map((cat) => {
        const daCategoria = series.filter((s) => s.categoria === cat.id)
        if (daCategoria.length === 0) return null
        const liberada = categoriaLiberada(cat.id, atual.id)
        return (
          <div key={cat.id} className="flex flex-col gap-2">
            <h2 className="flex flex-wrap items-baseline gap-x-2 text-xl font-extrabold">
              <span>
                <span aria-hidden>{liberada ? cat.emoji : '🔒'}</span> {cat.nome}
              </span>
              {!liberada && <span className="text-sm font-bold">abre no nível {cat.nivelMinimo}</span>}
            </h2>
            <ul className="flex flex-col gap-3">
              {daCategoria.map((s) => {
                const vezes = contadores[s.modulo] ?? 0
                const pelaAgenda = !liberada && agenda.rotas.has(s.rota)
                const trancado = !liberada && !pelaAgenda
                return (
                  <li key={s.modulo}>
                    <Link
                      to={s.rota}
                      aria-label={trancado ? `${s.titulo}: trancado até a categoria ${cat.nome}` : undefined}
                      className={`flex min-h-22 items-center gap-4 rounded-3xl border-4 p-3 shadow-md ${trancado ? 'border-slate-300 bg-slate-100 opacity-75' : s.cor}`}
                    >
                      <span aria-hidden className={`text-5xl ${trancado ? 'grayscale' : ''}`}>
                        {s.emoji}
                      </span>
                      <span className="flex flex-1 flex-col">
                        <span className="text-xl font-extrabold">{s.titulo}</span>
                        <span className="text-base">{s.descricao}</span>
                        <span className="text-sm font-bold">
                          {trancado
                            ? `🔒 Chegue em ${cat.nome} para treinar`
                            : pelaAgenda
                              ? '📅 Liberado hoje pela agenda'
                              : s.modulo === 'aquecimento' && aqueceu
                                ? '✅ Já aqueceu hoje'
                                : vezes > 0
                                  ? `🏅 Feito ${vezes} ${vezes === 1 ? 'vez' : 'vezes'}`
                                  : '✨ Ainda não fez'}
                        </span>
                      </span>
                      <span aria-hidden className="text-3xl">
                        {trancado ? '🔒' : '▶️'}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
