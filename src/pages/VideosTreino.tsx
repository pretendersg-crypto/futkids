// Vídeos do treinador (/treinos/videos), por categoria: os do calendário de goleiros e os que os
// pais adicionaram. Os de categoria acima ficam com cadeado (menos os da agenda de hoje).
// O vídeo abre fora do app, só depois do portão dos pais (BotaoVideo).
import { Link } from 'react-router'
import { TREINOS_CALENDARIO, treinoDeExtra } from '../data/calendarioGoleiros'
import { CATEGORIAS, categoriaLiberada } from '../data/categorias'
import { BotaoVideo } from '../features/agenda/BotaoVideo'
import { categoriaDoVideo, useAgendaDeHoje, useCategoria } from '../features/categoria/categoria'
import { useProgramaStore } from '../stores/programaStore'

export function VideosTreino() {
  const programa = useProgramaStore()
  const { atual } = useCategoria()
  const agenda = useAgendaDeHoje()
  const videos = [...TREINOS_CALENDARIO, ...programa.extras.map(treinoDeExtra)]
    .map((t) => ({ ...t, url: programa.videos[t.id] ?? t.videoUrl, categoria: categoriaDoVideo(t, programa.categorias) }))
    .filter((t) => t.url)

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link to="/treinos" aria-label="Voltar aos treinos" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">📺 Vídeos do treinador</h1>
      </header>
      <p className={`self-center rounded-full border-4 px-4 py-1 text-lg font-extrabold ${atual.cor}`}>
        {atual.emoji} Você é {atual.nome}
      </p>
      <p className="text-center text-base">Os vídeos abrem no YouTube, com um adulto. Depois, treine a versão do app com o ▶️.</p>

      {CATEGORIAS.map((cat) => {
        const daCategoria = videos.filter((v) => v.categoria === cat.id)
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
            <ul className="flex flex-col gap-2">
              {daCategoria.map((v) => {
                const pelaAgenda = !liberada && agenda.ids.has(v.id)
                const trancado = !liberada && !pelaAgenda
                return (
                  <li
                    key={v.id}
                    className={`flex flex-col gap-2 rounded-3xl border-4 p-3 ${trancado ? 'border-slate-300 bg-slate-100 opacity-75' : 'border-red-200 bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span aria-hidden className={`text-4xl ${trancado ? 'grayscale' : ''}`}>
                        {v.emoji}
                      </span>
                      <span className="flex flex-1 flex-col leading-tight">
                        <span className="text-lg font-extrabold">{v.nome}</span>
                        {v.detalhe && <span className="text-sm">{v.detalhe}</span>}
                        {pelaAgenda && <span className="text-sm font-bold">📅 Liberado hoje pela agenda</span>}
                        {trancado && <span className="text-sm font-bold">🔒 Chegue em {cat.nome} para ver</span>}
                      </span>
                    </div>
                    {!trancado && (
                      <div className="flex flex-wrap gap-2">
                        <BotaoVideo url={v.url!} titulo={v.nome} className="flex-1" />
                        {v.rota && (
                          <Link to={v.rota} className="grid min-h-12 flex-1 place-items-center rounded-2xl bg-sol px-3 text-base font-extrabold shadow">
                            Treinar no app ▶️
                          </Link>
                        )}
                      </div>
                    )}
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
