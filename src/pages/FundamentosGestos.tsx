// Catálogo dos fundamentos e gestos técnicos (/fundamentos), como uma trilha de curso. No topo:
// 🧤 Goleiro ou ⚽ Linha (?tipo=; cada trilha termina com os gestos comuns aos dois) e o filtro de
// nível (básico, intermediário, avançado). Gestos numerados na ordem sugerida, ✅ nos concluídos e
// o progresso. Tocar abre o gesto (/fundamentos/:gesto), com Anterior / Lista / Concluída /
// Próximo. Os pais incluem e mudam gestos na área dos pais (Agenda → Pais → Fundamentos e gestos).
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ProgressBar } from '../components/ui/ProgressBar'
import { DesenhoGesto } from '../features/saidaGol/DesenhoGesto'
import { NIVEIS_GESTO, nivelGestoPorId, publicoDoGesto, type NivelGesto } from '../features/saidaGol/gestos'
import { gestosPorEtapa, type TipoAtleta } from '../features/saidaGol/trilha'
import { useGestos } from '../features/saidaGol/useGestos'
import { useGestosConcluidosStore } from '../stores/gestosConcluidosStore'
import { ehGestoPronto } from '../stores/gestosStore'
import { origemDoVideo } from '../utils/link'

const TIPOS: { id: TipoAtleta; nome: string; emoji: string }[] = [
  { id: 'goleiro', nome: 'Goleiro', emoji: '🧤' },
  { id: 'linha', nome: 'Jogador de linha', emoji: '⚽' },
]

export function FundamentosGestos() {
  const [params, setParams] = useSearchParams()
  const atleta: TipoAtleta = params.get('tipo') === 'linha' ? 'linha' : 'goleiro'
  const [nivel, setNivel] = useState<NivelGesto | null>(null)
  const gestos = useGestos()
  const concluidos = useGestosConcluidosStore((s) => s.concluidos)
  const etapas = gestosPorEtapa(gestos, atleta)
  const fila = etapas.flatMap((e) => e.gestos)
  const feitos = fila.filter((g) => concluidos[g.id]).length
  const porcentagem = fila.length > 0 ? Math.round((feitos / fila.length) * 100) : 0
  // "Continuar": o primeiro gesto da trilha ainda não concluído
  const proximo = fila.find((g) => !concluidos[g.id])
  const doNivel = (g: (typeof fila)[number]) => !nivel || (g.nivel ?? 'facil') === nivel

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link to={atleta === 'linha' ? '/treinos' : '/goleiro'} aria-label="Voltar" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">📖 Fundamentos e gestos</h1>
      </header>

      {/* Goleiro ou linha */}
      <div role="tablist" aria-label="Trilha" className="grid grid-cols-2 gap-1 rounded-3xl bg-white p-1 shadow">
        {TIPOS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={atleta === t.id}
            onClick={() => setParams({ tipo: t.id }, { replace: true })}
            className={`min-h-12 rounded-3xl text-base font-extrabold ${atleta === t.id ? (t.id === 'linha' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white') : ''}`}
          >
            {t.emoji} {t.nome}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-3xl border-4 border-sky-300 bg-white p-3">
        <p className="text-lg font-extrabold">
          🎓 {feitos} de {fila.length} concluídos · {porcentagem}%
        </p>
        <ProgressBar valor={feitos} maximo={fila.length} rotulo="Fundamentos concluídos" cor="bg-green-500" />
        {proximo && (
          <Link to={`/fundamentos/${proximo.id}?tipo=${atleta}`} className="grid min-h-14 place-items-center rounded-2xl bg-sol px-3 text-center text-lg font-extrabold shadow">
            {feitos === 0 ? 'Começar' : 'Continuar'}: {proximo.nome} ▶️
          </Link>
        )}
        <p className="text-sm">Siga na ordem: veja o desenho, treine e toque em ✅ Concluída. 🎬 = vídeo, 🎓 = aula do curso, 📹 = gravado pelo treinador, 👥 = comum a goleiro e linha.</p>
      </div>

      {/* Nível */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Nível">
        <button type="button" role="radio" aria-checked={nivel === null} onClick={() => setNivel(null)} className={`min-h-11 rounded-full border-2 px-3 font-bold ${nivel === null ? 'border-sky-600 bg-sky-100' : 'border-sky-200 bg-white'}`}>
          Todos os níveis
        </button>
        {NIVEIS_GESTO.map((n) => (
          <button
            key={n.id}
            type="button"
            role="radio"
            aria-checked={nivel === n.id}
            onClick={() => setNivel(n.id)}
            className={`min-h-11 rounded-full border-2 px-3 font-bold ${nivel === n.id ? 'border-sky-600 bg-sky-100' : 'border-sky-200 bg-white'}`}
          >
            {n.emoji} {n.nome}
          </button>
        ))}
      </div>

      {etapas.map(({ etapa, gestos: daEtapa }, k) => {
        const visiveis = daEtapa.filter(doNivel)
        if (visiveis.length === 0) return null
        const feitosEtapa = daEtapa.filter((g) => concluidos[g.id]).length
        return (
          <div key={etapa.id} className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              <span className={`grid size-9 shrink-0 place-items-center rounded-full text-base font-black text-white ${etapa.publico === 'todos' ? 'bg-violet-600' : 'bg-sky-600'}`}>{k + 1}</span>
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
              {visiveis.map((g) => {
                const feito = Boolean(concluidos[g.id])
                const n = nivelGestoPorId(g.nivel)
                return (
                  <li key={g.id}>
                    <Link
                      to={`/fundamentos/${g.id}?tipo=${atleta}`}
                      className={`relative flex h-full flex-col items-center gap-1 rounded-3xl border-4 p-2 text-center ${feito ? 'border-green-400 bg-green-50' : 'border-sky-200 bg-white'}`}
                    >
                      <span className="absolute top-1 left-2 text-sm font-black text-sky-700">{fila.indexOf(g) + 1}</span>
                      {feito && (
                        <span aria-label="Concluído" className="absolute top-1 right-2 text-lg">
                          ✅
                        </span>
                      )}
                      <DesenhoGesto desenho={g.desenho} nome={g.nome} tamanho={100} gesto={g.id} />
                      <span className="text-base leading-tight font-extrabold">{g.nome}</span>
                      <span className="text-xs leading-tight">{g.resumo}</span>
                      <span className="flex flex-wrap justify-center gap-1 text-xs font-bold">
                        <span className="rounded-full bg-slate-100 px-2" title={`Nível ${n.nome}`}>
                          {n.emoji} {n.nome}
                        </span>
                        {publicoDoGesto(g) === 'todos' && <span className="rounded-full bg-violet-100 px-2">👥 comum</span>}
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
