// Área dos pais: "Acompanhar de perto". Resumo do progresso da criança (nível, categoria, dias
// seguidos, o que fez na semana, reação e tática) e o botão "Treinamos juntos hoje", que faz o
// check-in do dia da criança. Abrir o resumo e treinar junto dão pontos ao treinador.
import { useState } from 'react'
import { useCategoria } from '../categoria/categoria'
import { diasDaSemana, LETRAS_DIAS } from '../agenda/semana'
import { useAchievementsStore } from '../../stores/achievementsStore'
import { useProgressStore } from '../../stores/progressStore'
import { useReacaoStore } from '../../stores/reacaoStore'
import { useTaticaStore } from '../../stores/taticaStore'
import { pontuarTreinador } from '../../stores/treinadorStore'
import { useUserStore } from '../../stores/userStore'
import { hojeISO } from '../../utils/data'
import { melhorSequencia, sequenciaAtual } from '../../utils/sequencia'
import { PONTOS } from './pontos'

export function ProgressoAluno() {
  const [aberto, setAberto] = useState(false)
  const [juntoHoje, setJuntoHoje] = useState(false)
  const apelido = useUserStore((s) => s.apelido)
  const { atual: categoria, nivel } = useCategoria()
  const diasTreinados = useProgressStore((s) => s.diasTreinados)
  const atividadesPorDia = useProgressStore((s) => s.atividadesPorDia)
  const figurinhas = Object.keys(useAchievementsStore((s) => s.desbloqueadas)).length
  const drills = useReacaoStore((s) => s.sessoes.length)
  const ratingTatica = useTaticaStore((s) => s.rating)
  const hoje = hojeISO()

  function abrir() {
    setAberto((a) => !a)
    if (!aberto) pontuarTreinador('verProgresso', hoje, 'Acompanhou o progresso do aluno')
  }

  function treinamosJuntos() {
    // Conta como dia de treino da criança (mesmo check-in do "Treinei hoje fora do app")
    useProgressStore.getState().fazerCheckin()
    pontuarTreinador('treinoJunto', hoje, 'Treinou junto com o aluno')
    setJuntoHoje(true)
  }

  return (
    <section className="flex flex-col gap-2 rounded-3xl border-4 border-green-300 bg-white p-3">
      <button type="button" onClick={abrir} aria-expanded={aberto} className="flex items-center gap-2 text-left">
        <span aria-hidden className="text-3xl">
          📈
        </span>
        <span className="flex flex-1 flex-col">
          <span className="text-xl font-extrabold">Progresso de {apelido || 'seu goleiro'}</span>
          <span className="text-xs font-bold">Acompanhar de perto: +{PONTOS.verProgresso} XP por dia</span>
        </span>
        <span aria-hidden className="text-xl">
          {aberto ? '🔼' : '🔽'}
        </span>
      </button>

      {aberto && (
        <div className="flex flex-col gap-3">
          <ul className="grid grid-cols-2 gap-2 text-center">
            <Numero emoji={categoria.emoji} valor={categoria.nome} rotulo={`nível ${nivel}`} />
            <Numero emoji="🔥" valor={String(sequenciaAtual(diasTreinados, hoje))} rotulo={`dias seguidos (recorde ${melhorSequencia(diasTreinados)})`} />
            <Numero emoji="📅" valor={String(diasTreinados.length)} rotulo="dias de treino" />
            <Numero emoji="🏅" valor={String(figurinhas)} rotulo="figurinhas" />
            <Numero emoji="🚦" valor={String(drills)} rotulo="drills de reação" />
            <Numero emoji="🧠" valor={String(ratingTatica)} rotulo="rating do Futsal Tático" />
          </ul>
          <div>
            <p className="text-sm font-extrabold">Esta semana</p>
            <ol className="grid grid-cols-7 gap-1 pt-1">
              {diasDaSemana(hoje).map((dia) => {
                const feitas = atividadesPorDia[dia] ?? []
                return (
                  <li key={dia} className={`flex flex-col items-center rounded-xl border-2 py-1 text-xs ${dia === hoje ? 'border-violet-500' : 'border-transparent'} ${feitas.length ? 'bg-green-100' : 'bg-slate-50'}`}>
                    <span className="font-black">{LETRAS_DIAS[new Date(`${dia}T12:00`).getDay()]}</span>
                    <span aria-label={feitas.length ? `${feitas.length} atividades` : 'sem treino'}>{feitas.length ? `✅${feitas.length}` : '·'}</span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={juntoHoje}
        onClick={treinamosJuntos}
        className="min-h-14 rounded-2xl border-4 border-green-400 bg-green-50 text-lg font-extrabold disabled:opacity-60"
      >
        {juntoHoje ? '🤝 Anotado: treinaram juntos hoje!' : `🤝 Treinamos juntos hoje (+${PONTOS.treinoJunto} XP)`}
      </button>
    </section>
  )
}

function Numero({ emoji, valor, rotulo }: { emoji: string; valor: string; rotulo: string }) {
  return (
    <li className="flex flex-col rounded-2xl bg-green-50 p-2">
      <span className="text-xl font-black">
        <span aria-hidden>{emoji} </span>
        {valor}
      </span>
      <span className="text-xs font-bold">{rotulo}</span>
    </li>
  )
}
