// Perfil: o jogador, números do próprio progresso (sem comparar com outras crianças)
// e o álbum de figurinhas.
import { Link } from 'react-router'
import { AlbumConquistas } from '../components/stickers/AlbumConquistas'
import { Avatar } from '../features/avatar/Avatar'
import { useProgressStore } from '../stores/progressStore'
import { useUserStore } from '../stores/userStore'
import { nivelPorXP } from '../utils/nivel'
import { melhorSequencia } from '../utils/sequencia'

export function Perfil() {
  const apelido = useUserStore((s) => s.apelido)
  const avatar = useUserStore((s) => s.avatar)
  const xp = useProgressStore((s) => s.xp)
  const moedas = useProgressStore((s) => s.moedas)
  const contadores = useProgressStore((s) => s.contadores)
  const diasTreinados = useProgressStore((s) => s.diasTreinados)

  const numeros = [
    { emoji: '🔥', valor: contadores.aquecimento ?? 0, rotulo: ['aquecimento', 'aquecimentos'] },
    { emoji: '📅', valor: diasTreinados.length, rotulo: ['dia de treino', 'dias de treino'] },
    { emoji: '🏃', valor: melhorSequencia(diasTreinados), rotulo: ['dia seguido (recorde)', 'dias seguidos (recorde)'] },
    { emoji: '🪙', valor: moedas, rotulo: ['moeda', 'moedas'] },
  ]

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-center gap-3 rounded-3xl border-4 border-yellow-300 bg-white p-3 shadow-md">
        <div className="shrink-0 rounded-full border-4 border-campo bg-green-100">
          <Avatar config={avatar} tamanho={76} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-extrabold">{apelido}</h1>
          <p className="text-lg font-bold">⭐ Nível {nivelPorXP(xp).nivel}</p>
        </div>
        <Link
          to="/jogador"
          aria-label="Mudar meu jogador"
          className="grid size-14 shrink-0 place-items-center rounded-full bg-green-100 text-2xl"
        >
          ✏️
        </Link>
      </header>

      <ul className="grid grid-cols-2 gap-3">
        {numeros.map((n) => (
          <li key={n.emoji} className="flex items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
            <span aria-hidden className="text-3xl">
              {n.emoji}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-2xl font-black">{n.valor}</span>
              <span className="text-sm">{n.valor === 1 ? n.rotulo[0] : n.rotulo[1]}</span>
            </span>
          </li>
        ))}
      </ul>

      <AlbumConquistas />
    </section>
  )
}
