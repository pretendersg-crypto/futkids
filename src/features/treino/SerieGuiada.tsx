// Série guiada de exercícios (aquecimento, fundamentos do goleiro...):
// início → (apresentar → 3,2,1 → executar) × exercícios → fim com recompensa.
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { exerciciosDoModulo } from '../../data/catalogo'
import { useProgressStore, type ResultadoXP } from '../../stores/progressStore'
import { destravarSom } from '../../utils/som'
import { ApresentarExercicio } from './ApresentarExercicio'
import { Contagem } from './Contagem'
import { ExecutarExercicio } from './ExecutarExercicio'
import { calcularRecompensa, descreverMeta, minutosDaSerie, type Recompensa } from './recompensa'

type Fase = 'inicio' | 'apresentar' | 'contagem' | 'executar' | 'fim'

interface Props {
  /** Módulo dos exercícios em exercicios.json (ex.: "aquecimento") */
  modulo: string
  /** Título da tela inicial, com emoji (ex.: "🔥 Aquecimento") */
  titulo: string
  /** Texto do botão de começar (ex.: "Começar aquecimento 🔥") */
  textoComecar: string
  /** Contador que a série concluída soma no progresso (base das conquistas) */
  atividade: string
  /** Para onde o botão de sair do final leva, e o texto dele */
  voltarPara: string
  textoVoltar: string
}

export function SerieGuiada({ modulo, titulo, textoComecar, atividade, voltarPara, textoVoltar }: Props) {
  const SERIE = useMemo(() => exerciciosDoModulo(modulo), [modulo])
  const [fase, setFase] = useState<Fase>('inicio')
  const [indice, setIndice] = useState(0)
  const [feitos, setFeitos] = useState<string[]>([])
  const [ultimoPulado, setUltimoPulado] = useState(false)
  const [resultado, setResultado] = useState<{ recompensa: Recompensa; xp: ResultadoXP } | null>(null)

  const exercicio = SERIE[indice]

  function comecarSerie() {
    destravarSom() // precisa acontecer dentro do toque
    setIndice(0)
    setFeitos([])
    setUltimoPulado(false)
    setResultado(null)
    setFase('apresentar')
  }

  /** Avança para o próximo exercício ou, se era o último, entrega a recompensa */
  function avancar(feitosAgora: string[], pulou: boolean) {
    setFeitos(feitosAgora)
    setUltimoPulado(pulou)
    if (indice + 1 < SERIE.length) {
      setIndice(indice + 1)
      setFase('apresentar')
      return
    }
    // Fim da série: a recompensa é dada aqui (num evento), nunca durante a renderização
    const recompensa = calcularRecompensa(SERIE, feitosAgora)
    const progresso = useProgressStore.getState()
    const xp = progresso.ganharXP(recompensa.xp)
    progresso.ganharMoedas(recompensa.moedas)
    if (feitosAgora.length > 0) progresso.registrarAtividade(atividade)
    setResultado({ recompensa, xp })
    setFase('fim')
  }

  if (fase === 'inicio') {
    return (
      <div className="flex flex-col gap-4">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold">{titulo}</h1>
          <p className="text-lg">
            {SERIE.length} exercícios · uns {minutosDaSerie(SERIE)} minutos
          </p>
        </header>
        <ol className="flex flex-col gap-2">
          {SERIE.map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-2xl border-2 border-orange-200 bg-white p-3">
              <span aria-hidden className="text-3xl">
                {e.emoji}
              </span>
              <span className="flex-1 text-lg font-bold">{e.nome}</span>
              <span className="text-sm">{descreverMeta(e)}</span>
            </li>
          ))}
        </ol>
        <p className="text-center text-lg">
          Ganhe até <b>⭐ {calcularRecompensa(SERIE, SERIE.map((e) => e.id)).xp} XP</b> e{' '}
          <b>🪙 {calcularRecompensa(SERIE, SERIE.map((e) => e.id)).moedas}</b>
        </p>
        <button type="button" onClick={comecarSerie} className="min-h-16 rounded-3xl bg-sol text-2xl font-extrabold shadow-lg">
          {textoComecar}
        </button>
      </div>
    )
  }

  if (fase === 'fim' && resultado) {
    const { recompensa, xp } = resultado
    return (
      <div className="flex flex-col items-center gap-4 pt-6 text-center">
        <span aria-hidden className="pop text-8xl">
          {recompensa.completa ? '🏆' : feitos.length > 0 ? '👏' : '💪'}
        </span>
        <h1 className="text-3xl font-extrabold">
          {recompensa.completa ? 'Treino completo!' : feitos.length > 0 ? 'Boa!' : 'Vamos tentar de novo?'}
        </h1>
        <p className="text-xl">
          Você fez {feitos.length} de {SERIE.length} exercícios.
        </p>
        {recompensa.xp > 0 && (
          <p className="flex gap-4 rounded-3xl border-4 border-yellow-400 bg-yellow-100 px-6 py-3 text-2xl font-extrabold">
            <span>⭐ +{recompensa.xp} XP</span>
            <span>🪙 +{recompensa.moedas}</span>
          </p>
        )}
        {xp.subiuDeNivel && (
          <p className="pop rounded-3xl bg-campo px-6 py-3 text-2xl font-extrabold text-white">🎉 Subiu para o nível {xp.nivel}!</p>
        )}
        <div className="grid w-full grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={comecarSerie}
            className="min-h-16 rounded-3xl border-4 border-orange-300 bg-white text-xl font-extrabold"
          >
            De novo 🔁
          </button>
          <Link to={voltarPara} className="grid min-h-16 place-items-center rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
            {textoVoltar}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Bolinhas de progresso da série: feita ✓, atual (maior) ou por fazer */}
      <ol aria-label={`Exercício ${indice + 1} de ${SERIE.length}`} className="flex justify-center gap-2">
        {SERIE.map((e, i) => (
          <li
            key={e.id}
            aria-hidden
            className={`grid place-items-center rounded-full border-2 text-xs font-black ${
              i === indice ? 'size-8 border-fogo bg-orange-100' : 'size-6 border-orange-200 bg-white'
            } ${feitos.includes(e.id) ? 'border-campo bg-campo text-white' : ''}`}
          >
            {feitos.includes(e.id) ? '✓' : ''}
          </li>
        ))}
      </ol>

      {fase === 'apresentar' && (
        <ApresentarExercicio
          key={exercicio.id}
          exercicio={exercicio}
          aviso={indice === 0 ? undefined : ultimoPulado ? 'Tudo bem! Vamos para o próximo 💪' : 'Muito bem! 👏'}
          aoComecar={() => {
            destravarSom()
            setFase('contagem')
          }}
        />
      )}
      {fase === 'contagem' && <Contagem key={`c-${exercicio.id}`} aoTerminar={() => setFase('executar')} />}
      {fase === 'executar' && (
        <ExecutarExercicio
          key={`e-${exercicio.id}`}
          exercicio={exercicio}
          aoConcluir={() => avancar([...feitos, exercicio.id], false)}
          aoPular={() => avancar(feitos, true)}
        />
      )}
    </div>
  )
}
