// Uma lição do "Estudo do treinador": leitura curta, dicas e o mini-quiz (uma pergunta por vez,
// com a explicação logo depois). Concluir dá XP; acertar tudo dá bônus.
import { useState } from 'react'
import { pontuarTreinador, useTreinadorStore } from '../../stores/treinadorStore'
import { sons } from '../../utils/som'
import type { Licao } from './licoes'

export function LicaoTreinador({ licao, aoVoltar }: { licao: Licao; aoVoltar: () => void }) {
  const registrarLicao = useTreinadorStore((s) => s.registrarLicao)
  const [fase, setFase] = useState<'leitura' | 'quiz' | 'fim'>('leitura')
  const [pergunta, setPergunta] = useState(0)
  const [resposta, setResposta] = useState<number | null>(null)
  const [acertos, setAcertos] = useState(0)

  const atual = licao.quiz[pergunta]

  function responder(i: number) {
    if (resposta !== null) return
    setResposta(i)
    if (i === atual.certa) {
      sons.defesa()
      setAcertos((a) => a + 1)
    } else sons.gol()
  }

  function seguir() {
    if (pergunta < licao.quiz.length - 1) {
      setPergunta((p) => p + 1)
      setResposta(null)
      return
    }
    // acertos já inclui a resposta desta pergunta
    registrarLicao(licao.id, acertos)
    pontuarTreinador('licao', licao.id, `Concluiu a lição "${licao.titulo}"`)
    if (acertos === licao.quiz.length) pontuarTreinador('quizPerfeito', licao.id, `Quiz perfeito: "${licao.titulo}"`)
    setFase('fim')
  }

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={aoVoltar} className="min-h-12 self-start rounded-2xl bg-white px-4 text-lg font-bold shadow">
        ⬅️ Voltar às lições
      </button>
      <h2 className="text-2xl font-extrabold">
        <span aria-hidden>{licao.emoji} </span>
        {licao.titulo}
      </h2>

      {fase === 'leitura' && (
        <>
          <p className="text-sm font-bold">⏱️ Leitura de uns {licao.minutos} minutos</p>
          {licao.texto.map((t) => (
            <p key={t} className="text-lg leading-relaxed">
              {t}
            </p>
          ))}
          <div className="rounded-3xl border-4 border-violet-200 bg-violet-50 p-3">
            <p className="font-extrabold">📌 Para lembrar</p>
            <ul className="flex flex-col gap-1 pt-1">
              {licao.dicas.map((d) => (
                <li key={d}>✔️ {d}</li>
              ))}
            </ul>
          </div>
          <button type="button" onClick={() => setFase('quiz')} className="min-h-16 rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
            Fazer o quiz ({licao.quiz.length} perguntas) ▶️
          </button>
        </>
      )}

      {fase === 'quiz' && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold">
            Pergunta {pergunta + 1} de {licao.quiz.length}
          </p>
          <p className="text-xl font-extrabold">{atual.texto}</p>
          {atual.opcoes.map((o, i) => {
            const mostrar = resposta !== null
            const cor = !mostrar
              ? 'border-violet-200 bg-white'
              : i === atual.certa
                ? 'border-green-500 bg-green-50'
                : i === resposta
                  ? 'border-red-400 bg-red-50'
                  : 'border-violet-100 bg-white opacity-60'
            return (
              <button key={o} type="button" disabled={mostrar} onClick={() => responder(i)} className={`min-h-14 rounded-2xl border-4 px-3 text-left text-base font-bold ${cor}`}>
                {mostrar && i === atual.certa ? '✅ ' : mostrar && i === resposta ? '❌ ' : ''}
                {o}
              </button>
            )
          })}
          {resposta !== null && (
            <>
              <p role="status" className="rounded-2xl bg-violet-50 p-3 text-base">
                {resposta === atual.certa ? 'Isso! ' : 'Quase! '}
                {atual.porque}
              </p>
              <button type="button" onClick={seguir} className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow">
                {pergunta < licao.quiz.length - 1 ? 'Próxima pergunta ▶️' : 'Concluir lição 🎓'}
              </button>
            </>
          )}
        </div>
      )}

      {fase === 'fim' && (
        <div className="flex flex-col items-center gap-3 text-center">
          <span aria-hidden className="text-6xl">
            🎓
          </span>
          <p className="text-2xl font-extrabold">Lição concluída!</p>
          <p className="text-lg">
            Você acertou {acertos} de {licao.quiz.length}.
          </p>
          <button type="button" onClick={aoVoltar} className="min-h-14 w-full rounded-2xl bg-sol text-lg font-extrabold shadow">
            Voltar às lições 📚
          </button>
        </div>
      )}
    </div>
  )
}
