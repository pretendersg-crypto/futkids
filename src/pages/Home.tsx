// Tela inicial: cartão do jogador (avatar, apelido, nível, XP, moedas, sino da agenda)
// e botões grandes para cada módulo.
import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { ProgressBar } from '../components/ui/ProgressBar'
import { MODULOS } from '../data/modulos'
import { treinosPendentesHoje } from '../features/agenda/semana'
import { Avatar } from '../features/avatar/Avatar'
import { useProgressStore } from '../stores/progressStore'
import { useUserStore } from '../stores/userStore'
import { nivelPorXP } from '../utils/nivel'

export function Home() {
  const apelido = useUserStore((s) => s.apelido)
  const avatar = useUserStore((s) => s.avatar)
  const xp = useProgressStore((s) => s.xp)
  const moedas = useProgressStore((s) => s.moedas)
  const atividadesPorDia = useProgressStore((s) => s.atividadesPorDia)
  const { nivel, xpNoNivel, xpParaProximo } = nivelPorXP(xp)
  const pendentes = treinosPendentesHoje(atividadesPorDia)

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3 rounded-3xl border-4 border-green-200 bg-white p-3 shadow-md">
        <Link
          to="/jogador"
          aria-label="Mudar meu jogador"
          className="relative shrink-0 rounded-full border-4 border-campo bg-green-100"
        >
          <Avatar config={avatar} tamanho={76} />
          <span aria-hidden className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full bg-white text-sm shadow">
            ✏️
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate text-xl font-extrabold">{apelido}</p>
          <p className="flex gap-3 text-base font-bold">
            <span>⭐ Nível {nivel}</span>
            <span aria-label={`${moedas} moedas`}>🪙 {moedas}</span>
          </p>
          <ProgressBar valor={xpNoNivel} maximo={xpParaProximo} rotulo={`XP para o nível ${nivel + 1}`} />
          <p className="text-sm">
            {xpNoNivel} / {xpParaProximo} XP
          </p>
        </div>

        {/* Sino da agenda do dia, com quantos treinos sugeridos de hoje ainda faltam */}
        <Link
          to="/agenda"
          aria-label={pendentes > 0 ? `Agenda de hoje: ${pendentes} ${pendentes === 1 ? 'treino' : 'treinos'} para fazer` : 'Agenda de hoje'}
          className="relative grid size-14 shrink-0 place-items-center self-start rounded-full bg-violet-100 text-3xl"
        >
          <span aria-hidden>🔔</span>
          {pendentes > 0 && (
            <span aria-hidden className="absolute -top-1 -right-1 grid min-w-6 place-items-center rounded-full bg-red-600 px-1 text-xs font-black text-white">
              {pendentes}
            </span>
          )}
        </Link>
      </header>

      <p className="text-center text-xl font-bold">Vamos treinar hoje?</p>

      <ul className="grid grid-cols-2 gap-4">
        {MODULOS.map((modulo, i) => (
          // O último botão ocupa a linha inteira quando a quantidade é ímpar
          <li key={modulo.caminho} className={i === MODULOS.length - 1 && MODULOS.length % 2 ? 'col-span-2' : ''}>
            <motion.div whileTap={{ scale: 0.94 }}>
              <Link
                to={modulo.caminho}
                className={`flex min-h-36 flex-col items-center justify-center gap-1 rounded-3xl border-4 p-3 text-center shadow-md ${modulo.cor}`}
              >
                <span aria-hidden className="text-5xl">
                  {modulo.emoji}
                </span>
                <span className="text-lg leading-tight font-extrabold">{modulo.titulo}</span>
                <span className="text-sm leading-tight">{modulo.convite}</span>
              </Link>
            </motion.div>
          </li>
        ))}
      </ul>
    </section>
  )
}
