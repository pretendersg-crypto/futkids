// Perfil: o jogador, números do próprio progresso (sem comparar com outras crianças)
// e o álbum de figurinhas.
import { Link } from 'react-router'
import { AlbumConquistas } from '../components/stickers/AlbumConquistas'
import { Avatar } from '../features/avatar/Avatar'
import { useConfigStore } from '../stores/configStore'
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
  const somAtivo = useConfigStore((s) => s.somAtivo)
  const alternarSom = useConfigStore((s) => s.alternarSom)

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

      {/* Som do app (bips, comemorações): útil na sala de aula ou à noite */}
      <button
        type="button"
        role="switch"
        aria-checked={somAtivo}
        onClick={alternarSom}
        className="flex min-h-16 items-center gap-3 rounded-2xl border-4 border-green-200 bg-white px-4 text-lg font-bold"
      >
        <span aria-hidden className="text-3xl">
          {somAtivo ? '🔊' : '🔇'}
        </span>
        <span className="flex-1 text-left">Som do jogo</span>
        <span className={`rounded-full px-3 py-1 ${somAtivo ? 'bg-green-700 text-white' : 'bg-gray-200'}`}>{somAtivo ? 'Ligado' : 'Desligado'}</span>
      </button>
    </section>
  )
}
