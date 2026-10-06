// Bloco de recompensa das telas de fim (aquecimento, fundamentos, goleiro, rali):
// XP e moedas ganhos, bônus de dias seguidos (se o treino disparou), "Subiu de nível!" e a
// categoria nova (Novato, Iniciante...), quando a categoria sobe sozinha pelo XP.
import { categoriaPorNivel } from '../../data/categorias'
import { usePaisStore } from '../../stores/paisStore'
import type { BonusSequencia, ResultadoXP } from '../../stores/progressStore'

interface Props {
  xp: number
  moedas: number
  resultadoXP: ResultadoXP
  bonusSequencia: BonusSequencia | null
}

export function PainelRecompensa({ xp, moedas, resultadoXP, bonusSequencia }: Props) {
  // Categoria escolhida pelos pais não muda com o XP: aí não há o que comemorar
  const categoriaFixa = usePaisStore((s) => s.categoriaFixa)
  const nova = categoriaPorNivel(resultadoXP.nivel)
  const mudouCategoria = !categoriaFixa && nova.id !== categoriaPorNivel(resultadoXP.nivelAntes).id
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
      {mudouCategoria && (
        <p className={`pop rounded-3xl border-4 px-6 py-3 text-2xl font-extrabold ${nova.cor}`}>
          {nova.emoji} Agora você é {nova.nome}!
          <span className="block text-base">Treinos e vídeos novos liberados 🔓</span>
        </p>
      )}
    </>
  )
}
