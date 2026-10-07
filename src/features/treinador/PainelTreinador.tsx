// Cartão do Pai/Mãe Treinador no topo da área dos pais: avatar, apelido, título do nível, barra de
// XP e medalhas. Sem perfil ainda, convida a criar o avatar.
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useTreinadorStore } from '../../stores/treinadorStore'
import { AvatarTreinador } from './AvatarTreinador'
import { nivelTreinador } from './niveis'
import { avatarDoNivel } from './opcoesTreinador'
import { medalhasGanhas, MEDALHAS } from './pontos'

export function PainelTreinador({ aoAbrir }: { aoAbrir: () => void }) {
  const perfil = useTreinadorStore((s) => s.perfil)
  const xp = useTreinadorStore((s) => s.xp)
  const chaves = useTreinadorStore((s) => s.chaves)

  if (!perfil) {
    return (
      <button
        type="button"
        onClick={aoAbrir}
        className="flex items-center gap-3 rounded-3xl border-4 border-dashed border-violet-400 bg-violet-50 p-3 text-left"
      >
        <span aria-hidden className="text-5xl">
          👨‍🏫
        </span>
        <span className="flex flex-1 flex-col">
          <span className="text-xl font-extrabold">Seja o Pai/Mãe Treinador!</span>
          <span className="text-sm">Crie seu avatar e ganhe pontos planejando, estudando e acompanhando os treinos.</span>
        </span>
        <span aria-hidden className="text-2xl">
          ▶️
        </span>
      </button>
    )
  }

  const { atual, proximo, xpNoNivel, xpDoNivel } = nivelTreinador(xp)
  const titulo = atual.titulo[perfil.avatar.genero]
  const medalhas = medalhasGanhas(chaves)

  return (
    <button type="button" onClick={aoAbrir} className="flex items-center gap-3 rounded-3xl border-4 border-violet-400 bg-white p-3 text-left shadow-md">
      <AvatarTreinador config={avatarDoNivel(perfil.avatar, atual.nivel)} tamanho={84} className="shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-xl font-extrabold">{perfil.apelido}</span>
        <span className="text-sm font-bold text-violet-800">
          {atual.emoji} {titulo} · nível {atual.nivel}
        </span>
        <ProgressBar valor={xpNoNivel} maximo={xpDoNivel} rotulo="XP de treinador" cor="bg-violet-500" />
        <span className="text-xs font-bold">
          {proximo ? `${xpNoNivel}/${xpDoNivel} XP para ${proximo.titulo[perfil.avatar.genero]}` : `${xp} XP · nível máximo!`} · 🏅 {medalhas.length}/{MEDALHAS.length}
        </span>
      </span>
    </button>
  )
}
