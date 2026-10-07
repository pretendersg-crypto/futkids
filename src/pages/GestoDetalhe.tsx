// Um fundamento/gesto do goleiro (/goleiro/gestos/:gesto): desenho grande, como fazer, o erro
// mais comum, os vídeos reais (gravado e/ou YouTube) e os circuitos com cones que usam o gesto.
import { Link, Navigate, useParams } from 'react-router'
import { VideoReal } from '../components/video/VideoReal'
import { CIRCUITOS } from '../features/saidaGol/circuitos'
import { categoriaGestoPorId } from '../features/saidaGol/gestos'
import { DesenhoGesto } from '../features/saidaGol/DesenhoGesto'
import { useGesto } from '../features/saidaGol/useGestos'

export function GestoDetalhe() {
  const gesto = useGesto(useParams().gesto)
  if (!gesto) return <Navigate to="/goleiro/gestos" replace />
  const categoria = categoriaGestoPorId(gesto.categoria)
  const circuitos = CIRCUITOS.filter((c) => c.passos.some((p) => p.gesto === gesto.id))

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link to="/goleiro/gestos" aria-label="Voltar aos gestos" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">{gesto.nome}</h1>
      </header>

      <p className="self-start rounded-full bg-sky-100 px-3 py-1 text-sm font-extrabold">
        {categoria.emoji} {categoria.nome}
      </p>
      <div className="self-center rounded-3xl bg-green-50 p-2">
        <DesenhoGesto desenho={gesto.desenho} nome={gesto.nome} tamanho={220} />
      </div>
      <p className="text-center text-xl font-extrabold">{gesto.resumo}</p>

      <div className="flex flex-col gap-2 rounded-3xl border-4 border-sky-300 bg-white p-3">
        <p className="text-lg font-extrabold">✅ Como fazer</p>
        <ol className="flex flex-col gap-2">
          {gesto.comoFazer.map((t, i) => (
            <li key={t} className="flex items-start gap-2 text-lg">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sky-600 text-sm font-black text-white">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
      </div>
      {gesto.atencao && <p className="rounded-2xl bg-amber-50 p-3 text-base">⚠️ {gesto.atencao}</p>}

      <div className="flex flex-col gap-2">
        <p className="text-lg font-extrabold">🎬 Vídeo real</p>
        {gesto.video || gesto.videoLocal ? (
          <VideoReal titulo={gesto.nome} video={gesto.video} videoLocal={gesto.videoLocal} />
        ) : (
          <p className="rounded-2xl bg-white p-3 text-sm">
            Ainda sem vídeo. Um adulto pode colocar um link do YouTube ou gravar o gesto em <b>Agenda → 👨‍👩‍👧 Pais → 🧤 Fundamentos e gestos</b>.
          </p>
        )}
      </div>

      {circuitos.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-lg font-extrabold">🔶 Treine nos circuitos com cones</p>
          {circuitos.map((c) => (
            <Link key={c.id} to={`/goleiro/saida/${c.id}`} className="flex min-h-12 items-center gap-2 rounded-2xl border-4 border-orange-200 bg-white px-3 font-bold">
              <span aria-hidden>{c.emoji}</span> {c.nome} ▶️
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
