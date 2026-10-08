// Catálogo dos fundamentos e gestos técnicos do goleiro (/goleiro/gestos), como uma trilha de curso:
// 4 etapas (defesas e quedas → posicionamento → reposição → jogo), gestos numerados na ordem
// sugerida, ✅ nos concluídos e o progresso geral. Tocar abre o gesto (/goleiro/gestos/:gesto),
// com Anterior / Lista / Concluída / Próximo. Os pais incluem e mudam gestos na área dos pais
// (Agenda → Pais → Fundamentos e gestos).
import { Link } from 'react-router'
import { ProgressBar } from '../components/ui/ProgressBar'
import { DesenhoGesto } from '../features/saidaGol/DesenhoGesto'
import { gestosPorEtapa } from '../features/saidaGol/trilha'
import { useGestos } from '../features/saidaGol/useGestos'
import { useGestosConcluidosStore } from '../stores/gestosConcluidosStore'
import { ehGestoPronto } from '../stores/gestosStore'
import { origemDoVideo } from '../utils/link'

export function FundamentosGestos() {
  const gestos = useGestos()
  const concluidos = useGestosConcluidosStore((s) => s.concluidos)
  const etapas = gestosPorEtapa(gestos)
  const fila = etapas.flatMap((e) => e.gestos)
  const feitos = fila.filter((g) => concluidos[g.id]).length
  const porcentagem = fila.length > 0 ? Math.round((feitos / fila.length) * 100) : 0
  // "Continuar": o primeiro gesto da trilha ainda não concluído
  const proximo = fila.find((g) => !concluidos[g.id])

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link to="/goleiro" aria-label="Voltar ao goleiro" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">📖 Fundamentos e gestos</h1>
      </header>

      <div className="flex flex-col gap-2 rounded-3xl border-4 border-sky-300 bg-white p-3">
        <p className="text-lg font-extrabold">
          🎓 {feitos} de {fila.length} concluídos · {porcentagem}%
        </p>
        <ProgressBar valor={feitos} maximo={fila.length} rotulo="Fundamentos concluídos" cor="bg-green-500" />
        {proximo && (
          <Link to={`/goleiro/gestos/${proximo.id}`} className="grid min-h-14 place-items-center rounded-2xl bg-sol px-3 text-center text-lg font-extrabold shadow">
            {feitos === 0 ? 'Começar' : 'Continuar'}: {proximo.nome} ▶️
          </Link>
        )}
        <p className="text-sm">Siga na ordem: veja o desenho, treine e toque em ✅ Concluída. 🎬 = vídeo, 🎓 = aula do curso, 📹 = gravado pelo treinador.</p>
      </div>

      {etapas.map(({ etapa, gestos: daEtapa }) => {
        if (daEtapa.length === 0) return null
        const feitosEtapa = daEtapa.filter((g) => concluidos[g.id]).length
        return (
          <div key={etapa.id} className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-600 text-base font-black text-white">{etapa.numero}</span>
              <span className="flex-1">
                <span aria-hidden>{etapa.emoji} </span>
                {etapa.nome}
              </span>
              <span className={`rounded-full px-2 text-sm ${feitosEtapa === daEtapa.length ? 'bg-green-100' : 'bg-white'}`}>
                {feitosEtapa === daEtapa.length ? '✅ Completa' : `${feitosEtapa}/${daEtapa.length}`}
              </span>
            </h2>
            <p className="-mt-1 text-sm">{etapa.descricao}</p>
            <ul className="grid grid-cols-2 gap-2">
              {daEtapa.map((g) => {
                const feito = Boolean(concluidos[g.id])
                return (
                  <li key={g.id}>
                    <Link
                      to={`/goleiro/gestos/${g.id}`}
                      className={`relative flex h-full flex-col items-center gap-1 rounded-3xl border-4 p-2 text-center ${feito ? 'border-green-400 bg-green-50' : 'border-sky-200 bg-white'}`}
                    >
                      <span className="absolute top-1 left-2 text-sm font-black text-sky-700">{fila.indexOf(g) + 1}</span>
                      {feito && (
                        <span aria-label="Concluído" className="absolute top-1 right-2 text-lg">
                          ✅
                        </span>
                      )}
                      <DesenhoGesto desenho={g.desenho} nome={g.nome} tamanho={100} />
                      <span className="text-base leading-tight font-extrabold">{g.nome}</span>
                      <span className="text-xs leading-tight">{g.resumo}</span>
                      <span className="flex flex-wrap justify-center gap-1 text-xs font-bold">
                        {g.video && <span className="rounded-full bg-red-100 px-2">{origemDoVideo(g.video) === 'hotmart' ? '🎓 aula' : '🎬 vídeo'}</span>}
                        {g.videoLocal && <span className="rounded-full bg-red-100 px-2">📹 gravado</span>}
                        {!ehGestoPronto(g.id) && <span className="rounded-full bg-pink-100 px-2">⭐ do treinador</span>}
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
