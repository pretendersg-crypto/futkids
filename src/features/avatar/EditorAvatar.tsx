// Editor do avatar em abas: Pele, Cabelo, Cor do cabelo, Uniforme e Extras (acessórios).
// As opções mostram o próprio avatar com aquela escolha, então a criança não precisa ler.
// É também a loja: itens com preço aparecem com cadeado e o valor em moedas; tocar abre a compra.
import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { useProgressStore } from '../../stores/progressStore'
import { useUserStore } from '../../stores/userStore'
import { Avatar } from './Avatar'
import { Opcao } from './Opcao'
import { ACESSORIOS, chaveItem, CORES_CABELO, ESTILOS_CABELO, PELES, UNIFORMES, type AvatarConfig, type ParteAvatar } from './opcoesAvatar'

interface ItemDaAba {
  id: string
  nome: string
  preco?: number
  cor?: string
}

const ABAS: { id: ParteAvatar; emoji: string; nome: string; itens: ItemDaAba[]; rotulo: (nome: string) => string }[] = [
  { id: 'pele', emoji: '🙂', nome: 'Pele', itens: PELES, rotulo: (n) => n },
  { id: 'cabelo', emoji: '💇', nome: 'Cabelo', itens: ESTILOS_CABELO, rotulo: (n) => `Cabelo ${n}` },
  { id: 'corCabelo', emoji: '🎨', nome: 'Cor', itens: CORES_CABELO, rotulo: (n) => `Cabelo cor ${n}` },
  { id: 'uniforme', emoji: '👕', nome: 'Camisa', itens: UNIFORMES, rotulo: (n) => `Uniforme ${n}` },
  { id: 'acessorio', emoji: '🧢', nome: 'Extras', itens: ACESSORIOS, rotulo: (n) => n },
]

interface Props {
  valor: AvatarConfig
  aoMudar: (novo: AvatarConfig) => void
}

function Bolinha({ cor }: { cor: string }) {
  return <span aria-hidden className="size-11 rounded-full border-2 border-black/10" style={{ backgroundColor: cor }} />
}

export function EditorAvatar({ valor, aoMudar }: Props) {
  const [aba, setAba] = useState<ParteAvatar>('pele')
  const [compra, setCompra] = useState<{ parte: ParteAvatar; item: ItemDaAba } | null>(null)
  const [semSaldo, setSemSaldo] = useState(false)
  const moedas = useProgressStore((s) => s.moedas)
  const comprados = useUserStore((s) => s.itensComprados)

  const abaAtual = ABAS.find((a) => a.id === aba)!
  const mudar = (parte: ParteAvatar, id: string) => aoMudar({ ...valor, [parte]: id })
  const bloqueado = (parte: ParteAvatar, item: ItemDaAba) => !!item.preco && !comprados.includes(chaveItem(parte, item.id))

  function comprar() {
    if (!compra?.item.preco) return
    if (useUserStore.getState().comprarItem(chaveItem(compra.parte, compra.item.id), compra.item.preco)) {
      mudar(compra.parte, compra.item.id) // já veste o item novo
      setCompra(null)
    } else setSemSaldo(true)
  }

  return (
    <section className="flex flex-col gap-3">
      <div role="tablist" aria-label="Partes do avatar" className="grid grid-cols-5 gap-1.5">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            onClick={() => setAba(a.id)}
            className={`flex min-h-16 flex-col items-center justify-center rounded-2xl border-4 text-xs ${
              aba === a.id ? 'border-campo bg-green-100 font-extrabold' : 'border-transparent bg-white font-medium'
            }`}
          >
            <span aria-hidden className="text-2xl leading-none">
              {a.emoji}
            </span>
            {a.nome}
          </button>
        ))}
      </div>

      <p className="-mb-1 text-center text-base font-bold">
        🪙 Você tem {moedas} {moedas === 1 ? 'moeda' : 'moedas'}
      </p>

      <div role="tabpanel" className="flex flex-wrap justify-center gap-3 rounded-3xl bg-white/70 p-3">
        {abaAtual.itens.map((item) => {
          const trancado = bloqueado(aba, item)
          return (
            <Opcao
              key={item.id}
              rotulo={abaAtual.rotulo(item.nome) + (trancado ? `, bloqueado, custa ${item.preco} moedas` : '')}
              selecionada={valor[aba] === item.id}
              preco={trancado ? item.preco : undefined}
              aoEscolher={() => {
                if (!trancado) return mudar(aba, item.id)
                setSemSaldo(false)
                setCompra({ parte: aba, item })
              }}
            >
              {item.cor ? <Bolinha cor={item.cor} /> : <Avatar config={{ ...valor, [aba]: item.id }} tamanho={60} />}
            </Opcao>
          )
        })}
      </div>

      <Modal aberto={!!compra} aoFechar={() => setCompra(null)} titulo={`Comprar ${compra?.item.nome ?? ''}?`}>
        {compra && (
          <div className="flex flex-col items-center gap-3 text-center">
            <Avatar config={{ ...valor, [compra.parte]: compra.item.id }} tamanho={140} />
            <p className="text-xl font-extrabold">🪙 {compra.item.preco} moedas</p>
            <p className="text-base">Você tem {moedas}.</p>
            {semSaldo || moedas < (compra.item.preco ?? 0) ? (
              <p className="rounded-2xl bg-yellow-100 p-3 text-lg font-bold">
                Faltam {(compra.item.preco ?? 0) - moedas} moedas. Treine para ganhar mais! 💪
              </p>
            ) : (
              <button type="button" onClick={comprar} className="min-h-14 w-full rounded-2xl bg-sol text-xl font-extrabold shadow">
                Comprar 🛒
              </button>
            )}
          </div>
        )}
      </Modal>
    </section>
  )
}
