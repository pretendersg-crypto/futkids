// Barra de navegação inferior, estilo app: emoji grande + nome curto.
// A aba ativa não depende só de cor: fica com fundo, negrito e o emoji maior.
// O Perfil ganha uma bolinha com o número de figurinhas novas ainda não vistas no álbum.
import { NavLink } from 'react-router'
import { INICIO, MODULOS } from '../../data/modulos'
import { useAchievementsStore } from '../../stores/achievementsStore'

const ITENS = [INICIO, ...MODULOS]

export function BottomNav() {
  const figurinhasNovas = useAchievementsStore((s) => s.naoVistas.length)

  return (
    <nav
      aria-label="Menu principal"
      className="fixed inset-x-0 bottom-0 z-10 border-t-2 border-green-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md">
        {ITENS.map((item) => (
          <li key={item.caminho} className="flex-1">
            <NavLink
              to={item.caminho}
              end={item.caminho === '/'}
              className={({ isActive }) =>
                `relative m-1 flex min-h-16 flex-col items-center justify-center rounded-2xl text-xs ${
                  isActive ? `border-2 font-extrabold ${item.cor}` : 'border-2 border-transparent font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span aria-hidden className={`leading-none ${isActive ? 'text-3xl' : 'text-2xl'}`}>
                    {item.emoji}
                  </span>
                  <span className="mt-1">{item.rotuloCurto}</span>
                  {item.caminho === '/perfil' && figurinhasNovas > 0 && (
                    <span className="absolute -top-1 right-0 grid min-w-6 place-items-center rounded-full bg-red-600 px-1 text-xs font-black text-white">
                      {figurinhasNovas}
                      <span className="sr-only"> figurinhas novas</span>
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
