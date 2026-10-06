// Bloco de recompensa das telas de fim (aquecimento, fundamentos, goleiro, rali):
// XP e moedas ganhos, bônus de dias seguidos (se o treino disparou) e "Subiu de nível!".
import type { BonusSequencia, ResultadoXP } from '../../stores/progressStore'

interface Props {
  xp: number
  moedas: number
  resultadoXP: ResultadoXP
  bonusSequencia: BonusSequencia | null
}

export function PainelRecompensa({ xp, moedas, resultadoXP, bonusSequencia }: Props) {
  return (
    <>
      {xp > 0 && (
        <p className="flex gap-4 rounded-3xl border-4 border-yellow-400 bg-yellow-100 px-6 py-3 text-2xl font-extrabold">
          <span>⭐ +{xp} XP</span>
          <span>🪙 +{moedas}</span>
        </p>
      )}
      {bonusSequencia && (
        <p className="rounded-3xl border-4 border-orange-300 bg-orange-50 px-5 py-2 text-lg font-extrabold">
          🔥 {bonusSequencia.dias} dias seguidos: +{bonusSequencia.xp} XP e 🪙 +{bonusSequencia.moedas}
        </p>
      )}
      {resultadoXP.subiuDeNivel && (
        <p className="pop rounded-3xl bg-green-700 px-6 py-3 text-2xl font-extrabold text-white">🎉 Subiu para o nível {resultadoXP.nivel}!</p>
      )}
    </>
  )
}
