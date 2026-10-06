// Álbum de figurinhas estilo Panini: todas as vagas numeradas, as vazias mostram o que falta
// (e quanto já foi feito) para motivar. Figurinhas novas chegam com a animação de revelação.
import { useEffect, useState } from 'react'
import { CONQUISTAS, type Conquista } from '../../data/catalogo'
import { BotaoCompartilhar } from '../../features/conquistas/BotaoCompartilhar'
import { valorDoCriterio } from '../../features/conquistas/criterios'
import { useAchievementsStore } from '../../stores/achievementsStore'
import { useProgressStore } from '../../stores/progressStore'
import { formatarData } from '../../utils/data'
import { Modal } from '../ui/Modal'
import { ProgressBar } from '../ui/ProgressBar'
import { StickerAnimado } from './StickerAnimado'

const numero = (c: Conquista) => `Nº ${String(c.numero).padStart(2, '0')}`

export function AlbumConquistas() {
  const desbloqueadas = useAchievementsStore((s) => s.desbloqueadas)
  const marcarVistas = useAchievementsStore((s) => s.marcarVistas)
  const xp = useProgressStore((s) => s.xp)
  const contadores = useProgressStore((s) => s.contadores)
  const diasTreinados = useProgressStore((s) => s.diasTreinados)

  // Guarda quais eram novas ao abrir o álbum (para animar) e já marca todas como vistas
  const [novas] = useState(() => useAchievementsStore.getState().naoVistas)
  useEffect(() => {
    marcarVistas()
  }, [marcarVistas])

  const [aberta, setAberta] = useState<Conquista | null>(null)
  const coletadas = CONQUISTAS.filter((c) => desbloqueadas[c.id]).length

  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-extrabold">📒 Álbum de figurinhas</h2>
          <p className="text-lg font-bold">
            {coletadas} / {CONQUISTAS.length}
          </p>
        </div>
        <ProgressBar valor={coletadas} maximo={CONQUISTAS.length} rotulo="Figurinhas coletadas" />
      </header>

      <ul className="grid grid-cols-3 gap-3">
        {CONQUISTAS.map((c) => {
          const data = desbloqueadas[c.id]
          if (data) {
            const nova = novas.includes(c.id)
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setAberta(c)}
                  aria-label={`${c.nome}, figurinha ${numero(c)}${nova ? ', nova' : ''}`}
                  className="relative flex h-full w-full flex-col items-center gap-1 rounded-2xl border-4 border-yellow-300 bg-white p-2 shadow-sm"
                >
                  <StickerAnimado sticker={c.sticker} tamanho={76} revelar={nova} />
                  <span className="text-sm leading-tight font-extrabold">{c.nome}</span>
                  <span className="text-xs">{numero(c)}</span>
                  {nova && (
                    <span className="absolute -top-2 -right-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-black text-white">
                      NOVA!
                    </span>
                  )}
                </button>
              </li>
            )
          }
          const valor = Math.min(valorDoCriterio(c.criterio, { xp, contadores, diasTreinados }), c.criterio.minimo)
          return (
            <li
              key={c.id}
              className="flex flex-col items-center gap-1 rounded-2xl border-4 border-dashed border-green-200 bg-white/60 p-2 text-center"
            >
              <span aria-hidden className="grid size-[76px] place-items-center rounded-full bg-green-100 text-4xl font-black text-green-800/40">
                ?
              </span>
              <span className="text-xs font-bold">{numero(c)}</span>
              <span className="text-xs leading-tight">{c.descricao}</span>
              <span className="text-xs font-extrabold">
                {valor} / {c.criterio.minimo}
              </span>
            </li>
          )
        })}
      </ul>

      <Modal aberto={!!aberta} aoFechar={() => setAberta(null)} titulo={aberta?.nome ?? ''}>
        {aberta && desbloqueadas[aberta.id] && (
          <div className="flex flex-col items-center gap-2 text-center">
            <StickerAnimado sticker={aberta.sticker} tamanho={180} />
            <p className="text-sm font-bold">{numero(aberta)}</p>
            <p className="text-lg">{aberta.descricao} ✅</p>
            <p className="text-base">Conquistada em {formatarData(desbloqueadas[aberta.id])}</p>
            <div className="w-full pt-2">
              <BotaoCompartilhar conquista={aberta} data={desbloqueadas[aberta.id]} />
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
