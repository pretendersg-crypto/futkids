// Janela de comemoração: confete + figurinha chegando + som de vitória.
// Mostra uma conquista de cada vez, na ordem em que foram desbloqueadas.
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { StickerAnimado } from '../../components/stickers/StickerAnimado'
import { Confete } from '../../components/ui/Confete'
import { Modal } from '../../components/ui/Modal'
import { conquistaPorId } from '../../data/catalogo'
import { useAchievementsStore } from '../../stores/achievementsStore'
import { sons } from '../../utils/som'
import { BotaoCompartilhar } from './BotaoCompartilhar'

export function Celebracao() {
  const id = useAchievementsStore((s) => s.paraComemorar[0])
  const data = useAchievementsStore((s) => (id ? s.desbloqueadas[id] : undefined))
  const comemorada = useAchievementsStore((s) => s.comemorada)
  const navigate = useNavigate()
  const conquista = id ? conquistaPorId(id) : undefined

  useEffect(() => {
    if (id && !conquista) comemorada() // conquista que saiu do catálogo: só tira da fila
    else if (conquista) sons.vitoria()
  }, [id, conquista, comemorada])

  return (
    <Modal aberto={!!conquista} aoFechar={comemorada} titulo="Nova figurinha! 🎉">
      {conquista && data && (
        // key: a próxima da fila refaz confete e revelação
        <div key={conquista.id} className="flex flex-col gap-4">
          <Confete />
          <div className="flex flex-col items-center gap-1 text-center">
            <StickerAnimado sticker={conquista.sticker} tamanho={180} revelar />
            <p className="text-sm font-bold">Nº {String(conquista.numero).padStart(2, '0')}</p>
            <p className="text-2xl font-extrabold">{conquista.nome}</p>
            <p className="text-lg">{conquista.descricao} ✅</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                comemorada()
                navigate('/perfil')
              }}
              className="min-h-14 rounded-2xl bg-sol text-xl font-extrabold shadow"
            >
              Ver álbum 📒
            </button>
            <BotaoCompartilhar conquista={conquista} data={data} />
          </div>
        </div>
      )}
    </Modal>
  )
}
