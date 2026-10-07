// Catálogo dos fundamentos e gestos técnicos do goleiro (/goleiro/gestos), por categoria: o
// desenho, o resumo e se tem vídeo real. Tocar abre o gesto inteiro (/goleiro/gestos/:gesto).
// Os pais incluem e mudam gestos na área dos pais (Agenda → Pais → Fundamentos e gestos).
import { Link } from 'react-router'
import { CATEGORIAS_GESTO } from '../features/saidaGol/gestos'
import { DesenhoGesto } from '../features/saidaGol/DesenhoGesto'
import { useGestos } from '../features/saidaGol/useGestos'
import { ehGestoPronto } from '../stores/gestosStore'

export function FundamentosGestos() {
  const gestos = useGestos()

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link to="/goleiro" aria-label="Voltar ao goleiro" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">📖 Fundamentos e gestos</h1>
      </header>
      <p className="rounded-2xl bg-sky-50 p-3 text-base">
        Todos os gestos técnicos do goleiro, com desenho e como fazer. Os que têm 🎬 têm vídeo real colocado pelo treinador.
      </p>

      {CATEGORIAS_GESTO.map((cat) => {
        const daCategoria = gestos.filter((g) => g.categoria === cat.id)
        if (daCategoria.length === 0) return null
        return (
          <div key={cat.id} className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold">
              <span aria-hidden>{cat.emoji} </span>
              {cat.nome}
            </h2>
            <ul className="grid grid-cols-2 gap-2">
              {daCategoria.map((g) => (
                <li key={g.id}>
                  <Link to={`/goleiro/gestos/${g.id}`} className="flex h-full flex-col items-center gap-1 rounded-3xl border-4 border-sky-200 bg-white p-2 text-center">
                    <DesenhoGesto desenho={g.desenho} nome={g.nome} tamanho={100} />
                    <span className="text-base leading-tight font-extrabold">{g.nome}</span>
                    <span className="text-xs leading-tight">{g.resumo}</span>
                    <span className="flex gap-1 text-xs font-bold">
                      {(g.video || g.videoLocal) && <span className="rounded-full bg-red-100 px-2">🎬 vídeo</span>}
                      {!ehGestoPronto(g.id) && <span className="rounded-full bg-pink-100 px-2">⭐ do treinador</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
