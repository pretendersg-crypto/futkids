// Um fundamento/gesto do goleiro (/goleiro/gestos/:gesto): desenho grande, como fazer, o erro
// mais comum, os vídeos reais (gravado, YouTube ou aula da Hotmart) e os circuitos com cones que usam
// o gesto. Embaixo, a barra de curso: Anterior / Lista / Concluída / Próximo, na ordem da trilha.
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { BarraAula } from '../components/ui/BarraAula'
import { VideoReal } from '../components/video/VideoReal'
import { CIRCUITOS } from '../features/saidaGol/circuitos'
import { categoriaGestoPorId } from '../features/saidaGol/gestos'
import { arteLocalDaPose } from '../features/saidaGol/arteLocal'
import { DesenhoGesto } from '../features/saidaGol/DesenhoGesto'
import { etapaDoGesto, filaDaTrilha } from '../features/saidaGol/trilha'
import { useGestos } from '../features/saidaGol/useGestos'
import { useGestosConcluidosStore } from '../stores/gestosConcluidosStore'
import { sons } from '../utils/som'

export function GestoDetalhe() {
  const id = useParams().gesto
  const navegar = useNavigate()
  const fila = filaDaTrilha(useGestos())
  const concluida = useGestosConcluidosStore((s) => Boolean(id && s.concluidos[id]))
  const posicao = fila.findIndex((g) => g.id === id)
  const gesto = fila[posicao]
  if (!gesto) return <Navigate to="/goleiro/gestos" replace />
  const categoria = categoriaGestoPorId(gesto.categoria)
  const etapa = etapaDoGesto(gesto)
  const anterior = fila[posicao - 1]
  const proximo = fila[posicao + 1]
  const irPara = (g: { id: string }) => {
    navegar(`/goleiro/gestos/${g.id}`, { replace: true })
    window.scrollTo({ top: 0 })
  }
  const circuitos = CIRCUITOS.filter((c) => c.passos.some((p) => p.gesto === gesto.id))

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link to="/goleiro/gestos" aria-label="Voltar aos gestos" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">{gesto.nome}</h1>
      </header>

      <p className="flex flex-wrap gap-2 text-sm font-extrabold">
        <span className="rounded-full bg-sky-600 px-3 py-1 text-white">
          Etapa {etapa.numero} · {etapa.emoji} {etapa.nome}
        </span>
        <span className="rounded-full bg-white px-3 py-1">
          Gesto {posicao + 1} de {fila.length}
        </span>
        <span className="rounded-full bg-sky-100 px-3 py-1">
          {categoria.emoji} {categoria.nome}
        </span>
      </p>
      <div className="self-center rounded-3xl bg-green-50 p-2">
        <DesenhoGesto desenho={gesto.desenho} nome={gesto.nome} tamanho={220} />
      </div>
      {/* Com a arte do aluno no lugar, o goleiro desenhado (que se mexe) aparece menor, ao lado */}
      {gesto.desenho.tipo === 'pose' && arteLocalDaPose(gesto.desenho.pose) && (
        <div className="flex items-center gap-3 self-center rounded-2xl bg-white p-2">
          <DesenhoGesto desenho={gesto.desenho} nome={gesto.nome} tamanho={90} comArte={false} />
          <p className="max-w-40 text-sm font-bold">🎞️ O movimento, no goleiro desenhado</p>
        </div>
      )}
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
            Ainda sem vídeo. Um adulto pode colocar um link do YouTube ou de uma aula da Hotmart, ou gravar o gesto em <b>Agenda → 👨‍👩‍👧 Pais → 🧤 Fundamentos e gestos</b>.
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

      <BarraAula
        aoAnterior={anterior ? () => irPara(anterior) : undefined}
        aoLista={() => navegar('/goleiro/gestos')}
        concluida={concluida}
        aoConcluir={() => {
          const loja = useGestosConcluidosStore.getState()
          if (concluida) return loja.desmarcar(gesto.id)
          loja.marcar(gesto.id)
          sons.concluido()
        }}
        aoProximo={proximo ? () => irPara(proximo) : undefined}
      />
    </section>
  )
}
