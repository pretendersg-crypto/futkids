// Tela inicial: cartão do jogador (avatar, apelido, nível, XP, moedas, sino da agenda), o mascote
// com uma dica do dia e os atalhos em dois blocos bem separados: 🏃 treinar com o corpo (largar o
// celular e se mexer) e 🎮 jogar na tela (com os dedos). Agenda e Perfil ficam em "Organizar".
import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { Mascote, type Humor } from '../components/mascote/Mascote'
import { InstalarApp } from '../components/ui/InstalarApp'
import { BlocoTipo } from '../components/ui/TipoAtividade'
import { ProgressBar } from '../components/ui/ProgressBar'
import { saudacao } from '../data/mascote'
import { planoDoDia, treinosPendentesHoje } from '../features/agenda/semana'
import { useCategoria } from '../features/categoria/categoria'
import { Avatar } from '../features/avatar/Avatar'
import { useProgramaStore, type ConfigPrograma } from '../stores/programaStore'
import { useProgressStore } from '../stores/progressStore'
import { useUserStore } from '../stores/userStore'
import { hojeISO } from '../utils/data'
import { nivelPorXP } from '../utils/nivel'
import { sequenciaAtual } from '../utils/sequencia'

interface Atalho {
  para: string
  emoji: string
  titulo: string
  texto: string
}

const ATALHOS_CORPO: Atalho[] = [
  { para: '/treinos', emoji: '💪', titulo: 'Treinos', texto: 'Aquecer, correr, força e alongar' },
  { para: '/goleiro', emoji: '🧤', titulo: 'Treinos de goleiro', texto: 'Fundamentos e cones' },
  { para: '/reacao?tipo=corpo', emoji: '🚦', titulo: 'Reação no chão', texto: 'Cores e setas: o corpo reage' },
  { para: '/rali?tipo=corpo', emoji: '⚽', titulo: 'Rali com bola', texto: 'Embaixadinhas e saltos de verdade' },
]

const ATALHOS_TELA: Atalho[] = [
  { para: '/goleiro?tipo=tela', emoji: '🧤', titulo: 'Jogos de goleiro', texto: 'Defesa, reflexo e posição' },
  { para: '/tatica', emoji: '🧠', titulo: 'Futsal Tático', texto: 'Qual é a melhor jogada?' },
  { para: '/reacao?tipo=tela', emoji: '🚦', titulo: 'Reação na tela', texto: 'Toque rápido na cor certa' },
  { para: '/rali?tipo=tela', emoji: '⚽', titulo: 'Rali na tela', texto: 'Embaixadinha, passe e chute' },
  { para: '/alimentacao', emoji: '🍎', titulo: 'Alimentação', texto: 'Jogos e quiz do craque' },
]

const ATALHOS_ORGANIZAR: Atalho[] = [
  { para: '/agenda', emoji: '📅', titulo: 'Agenda', texto: 'O treino de cada dia' },
  { para: '/perfil', emoji: '🏆', titulo: 'Perfil', texto: 'Figurinhas e conquistas' },
]

/** Grade de atalhos (2 por linha; o último ocupa a linha toda quando sobra um) */
function Atalhos({ itens }: { itens: Atalho[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {itens.map((a, i) => (
        <li key={a.para} className={i === itens.length - 1 && itens.length % 2 ? 'col-span-2' : ''}>
          <motion.div whileTap={{ scale: 0.94 }}>
            <Link to={a.para} className="flex min-h-28 flex-col items-center justify-center gap-1 rounded-3xl border-4 border-white bg-white p-2 text-center shadow-md">
              <span aria-hidden className="text-4xl">
                {a.emoji}
              </span>
              <span className="text-lg leading-tight font-extrabold">{a.titulo}</span>
              <span className="text-sm leading-tight">{a.texto}</span>
            </Link>
          </motion.div>
        </li>
      ))}
    </ul>
  )
}

export function Home() {
  const apelido = useUserStore((s) => s.apelido)
  const avatar = useUserStore((s) => s.avatar)
  const xp = useProgressStore((s) => s.xp)
  const moedas = useProgressStore((s) => s.moedas)
  const atividadesPorDia = useProgressStore((s) => s.atividadesPorDia)
  const { nivel, xpNoNivel, xpParaProximo } = nivelPorXP(xp)
  const categoria = useCategoria().atual
  const diasTreinados = useProgressStore((s) => s.diasTreinados)
  // Assina o programa: se os pais mudarem a agenda, o sino e a dica do mascote acompanham
  const programa = useProgramaStore()
  const pendentes = treinosPendentesHoje(atividadesPorDia, programa)
  const dica = dicaDoMascote(diasTreinados, programa)

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
          <Link to="/treinos" className={`self-start rounded-full border-2 px-2 text-sm font-extrabold ${categoria.cor}`}>
            {categoria.emoji} {categoria.nome}
          </Link>
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

      {/* Aberto pelo navegador (com barra de endereço): convite para instalar como app */}
      <InstalarApp jeito="faixa" />

      <Mascote humor={dica.humor} fala={`${saudacao()}, ${apelido}! ${dica.texto}`} tamanho={84} />

      {/* Dois blocos bem diferentes: treinar com o corpo x jogar na tela */}
      <BlocoTipo tipo="corpo">
        <Atalhos itens={ATALHOS_CORPO} />
      </BlocoTipo>
      <BlocoTipo tipo="tela">
        <Atalhos itens={ATALHOS_TELA} />
      </BlocoTipo>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-extrabold">📋 Organizar</h2>
        <Atalhos itens={ATALHOS_ORGANIZAR} />
      </div>
    </section>
  )
}

/** O que o mascote diz na Home, conforme o dia da criança */
function dicaDoMascote(diasTreinados: string[], programa: ConfigPrograma): { texto: string; humor: Humor } {
  const hoje = hojeISO()
  const seguidos = sequenciaAtual(diasTreinados, hoje)
  if (diasTreinados.includes(hoje)) {
    return seguidos >= 2 ? { texto: `${seguidos} dias seguidos! Você é demais! 🔥`, humor: 'comemorando' } : { texto: 'Treino feito hoje! Mandou bem! ⭐', humor: 'comemorando' }
  }
  if (planoDoDia(hoje, programa).descanso) return { texto: 'Hoje é dia de descanso, mas pode treinar se quiser! 😄', humor: 'feliz' }
  if (seguidos >= 1) return { texto: `${seguidos} ${seguidos === 1 ? 'dia seguido' : 'dias seguidos'}! Treine hoje para não perder 🔥`, humor: 'torcendo' }
  return { texto: 'Bora treinar? Comece pelo aquecimento! 🔥', humor: 'feliz' }
}
