// Agenda de treinos, em duas abas:
//  - "Minha agenda" (criança): dias seguidos, a semana, os treinos de hoje (com a versão animada
//    no app e o vídeo do treinador), check-in, missões e lembrete
//  - "Pais" (com PIN): programa de treinos, mês inteiro com o que foi feito, mudar dias e vídeos
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { BotaoVideo } from '../features/agenda/BotaoVideo'
import { ConfigLembrete } from '../features/agenda/ConfigLembrete'
import { Missoes } from '../features/agenda/Missoes'
import { AreaPais } from '../features/agenda/pais/AreaPais'
import { TrancaPais } from '../features/agenda/pais/TrancaPais'
import { descreverPosicao, diasDaSemana, LETRAS_DIAS, NOMES_DIAS, planoDoDia, treinosDoDia } from '../features/agenda/semana'
import { useProgramaStore } from '../stores/programaStore'
import { useProgressStore } from '../stores/progressStore'
import { diaDaSemana, hojeISO } from '../utils/data'
import { melhorSequencia, sequenciaAtual } from '../utils/sequencia'

export function Agenda() {
  // A aba fica no endereço (?aba=pais), assim o "voltar" do celular funciona entre as abas
  const [params, setParams] = useSearchParams()
  const aba = params.get('aba') === 'pais' ? 'pais' : 'minha'

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-center text-3xl font-extrabold">📅 Agenda de Treinos</h1>
      <div role="tablist" aria-label="Agenda" className="grid grid-cols-2 gap-2">
        {(
          [
            ['minha', '📅 Minha agenda'],
            ['pais', '👨‍👩‍👧 Pais'],
          ] as const
        ).map(([id, nome]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={aba === id}
            onClick={() => setParams(id === 'pais' ? { aba: 'pais' } : {}, { replace: true })}
            className={`min-h-14 rounded-2xl border-4 text-lg ${aba === id ? 'border-violet-600 bg-violet-100 font-extrabold' : 'border-transparent bg-white font-bold'}`}
          >
            {nome}
          </button>
        ))}
      </div>

      {aba === 'minha' ? (
        <MinhaAgenda />
      ) : (
        <TrancaPais>
          <AreaPais aoSair={() => setParams({}, { replace: true })} />
        </TrancaPais>
      )}
    </section>
  )
}

function MinhaAgenda() {
  const diasTreinados = useProgressStore((s) => s.diasTreinados)
  const atividadesPorDia = useProgressStore((s) => s.atividadesPorDia)
  const bonus = useProgressStore((s) => s.bonusSequencia)
  const programa = useProgramaStore()
  const [checkinAgora, setCheckinAgora] = useState(false)

  const hoje = hojeISO()
  const seguidos = sequenciaAtual(diasTreinados, hoje)
  const recorde = melhorSequencia(diasTreinados)
  const treinouHoje = diasTreinados.includes(hoje)
  const planoHoje = planoDoDia(hoje, programa)
  const treinosHoje = treinosDoDia(hoje, atividadesPorDia, programa)

  return (
    <>
      {/* Dias seguidos */}
      <div className="flex items-center gap-3 rounded-3xl border-4 border-orange-300 bg-orange-50 p-3">
        <span aria-hidden className={`text-5xl ${seguidos > 0 ? '' : 'opacity-40 grayscale'}`}>
          🔥
        </span>
        <div className="flex-1">
          <p className="text-2xl font-black">
            {seguidos} {seguidos === 1 ? 'dia seguido' : 'dias seguidos'}
          </p>
          <p className="text-sm font-bold">
            Recorde: {recorde} · {treinouHoje ? 'hoje já conta ✅' : seguidos > 0 ? 'treine hoje para não perder!' : 'comece hoje!'}
          </p>
          {bonus?.dia === hoje && (
            <p className="text-sm font-bold text-orange-800">
              Bônus de {bonus.dias} dias seguidos: +{bonus.xp} XP 🪙+{bonus.moedas}
            </p>
          )}
        </div>
      </div>

      {/* A semana, de domingo a sábado */}
      <p className="-mb-3 text-center text-sm font-bold">{descreverPosicao(hoje, programa)}</p>
      <ol className="grid grid-cols-7 gap-1" aria-label="Esta semana">
        {diasDaSemana(hoje).map((dia) => {
          const treinou = diasTreinados.includes(dia)
          const ehHoje = dia === hoje
          const futuro = dia > hoje
          const plano = planoDoDia(dia, programa)
          // O treino principal (o 1º é sempre o aquecimento)
          const icone = treinou ? '✅' : plano.descanso ? '😴' : futuro || ehHoje ? ((plano.treinos[1] ?? plano.treinos[0])?.emoji ?? '⚽') : '·'
          const situacao = treinou ? 'treinou' : plano.descanso ? 'descanso' : futuro ? 'vai treinar' : ehHoje ? 'hoje' : 'não treinou'
          return (
            <li
              key={dia}
              aria-label={`${NOMES_DIAS[diaDaSemana(dia)]}, dia ${Number(dia.slice(8))}: ${situacao}`}
              className={`flex flex-col items-center rounded-2xl border-4 py-1 ${
                ehHoje ? 'border-violet-500 bg-violet-100' : treinou ? 'border-green-300 bg-green-50' : 'border-transparent bg-white'
              }`}
            >
              <span aria-hidden className="text-xs font-black">
                {LETRAS_DIAS[diaDaSemana(dia)]}
              </span>
              <span aria-hidden className="text-sm font-bold">
                {Number(dia.slice(8))}
              </span>
              <span aria-hidden className="text-xl leading-tight">
                {icone}
              </span>
            </li>
          )
        })}
      </ol>

      {/* Hoje */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-extrabold">Hoje · {NOMES_DIAS[diaDaSemana(hoje)]}</h2>
        {planoHoje.descanso && (
          <p className="rounded-2xl bg-white p-3 text-lg">Dia de descanso! O corpo também fica forte descansando. Brinque à vontade 😴</p>
        )}
        {!planoHoje.descanso && <p className="-mt-1 text-sm font-bold">🔥 O aquecimento vem sempre primeiro!</p>}
        <ul className="flex flex-col gap-2">
          {treinosHoje.map((t) => (
            <li
              key={t.id}
              className={`flex flex-col gap-2 rounded-2xl border-4 p-3 ${t.feito ? 'border-green-300 bg-green-50' : 'border-violet-300 bg-white'}`}
            >
              <div className="flex items-center gap-3 text-lg font-bold">
                <span aria-hidden className="text-3xl">
                  {t.emoji}
                </span>
                <span className="flex flex-1 flex-col leading-tight">
                  {t.titulo}
                  {t.detalhe && <span className="text-sm font-medium">{t.detalhe}</span>}
                </span>
                {t.feito && <span className="text-base">✅ Feito</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {t.rota && (
                  <Link to={t.rota} className="grid min-h-12 flex-1 place-items-center rounded-2xl bg-sol px-3 text-base font-extrabold shadow">
                    Treinar ▶️
                  </Link>
                )}
                {t.video && <BotaoVideo url={t.video} titulo={t.titulo} />}
                {!t.feito && (
                  <button
                    type="button"
                    onClick={() => useProgressStore.getState().registrarAtividade(t.atividade)}
                    className="min-h-12 rounded-2xl border-4 border-green-300 bg-white px-3 text-base font-bold"
                  >
                    ✅ Fiz
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {treinouHoje ? (
          <p className="rounded-2xl bg-green-100 p-3 text-center text-lg font-bold" role="status">
            {checkinAgora ? '🎉 Check-in feito! Hoje conta na sequência.' : '✅ Hoje já conta na sequência!'}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setCheckinAgora(useProgressStore.getState().fazerCheckin())}
            className="min-h-16 rounded-2xl border-4 border-green-400 bg-white text-lg font-extrabold"
          >
            ✅ Treinei hoje fora do app (escolinha, pelada...)
          </button>
        )}
      </section>

      <Missoes />
      <ConfigLembrete />
    </>
  )
}
