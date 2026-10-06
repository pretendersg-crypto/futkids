// Agenda de treinos: dias seguidos, a semana (com o que já foi feito), os treinos sugeridos de
// hoje com check-in, missões do dia/semana e o lembrete diário.
import { useState } from 'react'
import { Link } from 'react-router'
import { ConfigLembrete } from '../features/agenda/ConfigLembrete'
import { Missoes } from '../features/agenda/Missoes'
import { diasDaSemana, LETRAS_DIAS, NOMES_DIAS, planoDoDia, semanaDoPlano, treinosDoDia } from '../features/agenda/semana'
import { useProgressStore } from '../stores/progressStore'
import { diaDaSemana, hojeISO } from '../utils/data'
import { melhorSequencia, sequenciaAtual } from '../utils/sequencia'

export function Agenda() {
  const diasTreinados = useProgressStore((s) => s.diasTreinados)
  const atividadesPorDia = useProgressStore((s) => s.atividadesPorDia)
  const bonus = useProgressStore((s) => s.bonusSequencia)
  const [checkinAgora, setCheckinAgora] = useState(false)

  const hoje = hojeISO()
  const seguidos = sequenciaAtual(diasTreinados, hoje)
  const recorde = melhorSequencia(diasTreinados)
  const treinouHoje = diasTreinados.includes(hoje)
  const planoHoje = planoDoDia(hoje)
  const treinosHoje = treinosDoDia(hoje, atividadesPorDia)

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-center text-3xl font-extrabold">📅 Agenda de Treinos</h1>

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

      {/* A semana, de domingo a sábado (o plano muda a cada semana, num ciclo de 4) */}
      <p className="-mb-3 text-center text-sm font-bold">Plano de treino: semana {semanaDoPlano(hoje) + 1} de 4</p>
      <ol className="grid grid-cols-7 gap-1" aria-label="Esta semana">
        {diasDaSemana(hoje).map((dia) => {
          const treinou = diasTreinados.includes(dia)
          const ehHoje = dia === hoje
          const futuro = dia > hoje
          const plano = planoDoDia(dia)
          const icone = treinou ? '✅' : plano.descanso ? '😴' : futuro || ehHoje ? (plano.treinos[1] ?? plano.treinos[0])?.emoji ?? '⚽' : '·' // o treino principal (o 1º é sempre o aquecimento)
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
            <li key={t.titulo}>
              <Link
                to={t.rota}
                className={`flex min-h-16 items-center gap-3 rounded-2xl border-4 p-3 text-lg font-bold ${
                  t.feito ? 'border-green-300 bg-green-50' : 'border-violet-300 bg-white'
                }`}
              >
                <span aria-hidden className="text-3xl">
                  {t.emoji}
                </span>
                <span className="flex-1">{t.titulo}</span>
                <span className="text-base">{t.feito ? '✅ Feito' : 'Treinar ▶️'}</span>
              </Link>
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
    </section>
  )
}
