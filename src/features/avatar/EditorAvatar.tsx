// Editor do avatar em abas: Pele, Cabelo, Cor do cabelo, Uniforme.
// Cada opção de cabelo mostra o próprio avatar com aquele cabelo, então a criança não precisa ler.
import { useState } from 'react'
import { Avatar } from './Avatar'
import { Opcao } from './Opcao'
import { CORES_CABELO, ESTILOS_CABELO, PELES, UNIFORMES, type AvatarConfig } from './opcoesAvatar'

type Aba = 'pele' | 'cabelo' | 'corCabelo' | 'uniforme'

const ABAS: { id: Aba; emoji: string; nome: string }[] = [
  { id: 'pele', emoji: '🙂', nome: 'Pele' },
  { id: 'cabelo', emoji: '💇', nome: 'Cabelo' },
  { id: 'corCabelo', emoji: '🎨', nome: 'Cor' },
  { id: 'uniforme', emoji: '👕', nome: 'Uniforme' },
]

interface Props {
  valor: AvatarConfig
  aoMudar: (novo: AvatarConfig) => void
}

function Bolinha({ cor }: { cor: string }) {
  return <span aria-hidden className="size-11 rounded-full border-2 border-black/10" style={{ backgroundColor: cor }} />
}

export function EditorAvatar({ valor, aoMudar }: Props) {
  const [aba, setAba] = useState<Aba>('pele')
  const mudar = (parte: Partial<AvatarConfig>) => aoMudar({ ...valor, ...parte })

  return (
    <section className="flex flex-col gap-3">
      <div role="tablist" aria-label="Partes do avatar" className="grid grid-cols-4 gap-2">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            onClick={() => setAba(a.id)}
            className={`flex min-h-16 flex-col items-center justify-center rounded-2xl border-4 text-sm ${
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

      <div role="tabpanel" className="flex flex-wrap justify-center gap-3 rounded-3xl bg-white/70 p-3">
        {aba === 'pele' &&
          PELES.map((p) => (
            <Opcao key={p.id} rotulo={p.nome} selecionada={valor.pele === p.id} aoEscolher={() => mudar({ pele: p.id })}>
              <Bolinha cor={p.cor} />
            </Opcao>
          ))}

        {aba === 'cabelo' &&
          ESTILOS_CABELO.map((c) => (
            <Opcao key={c.id} rotulo={c.nome} selecionada={valor.cabelo === c.id} aoEscolher={() => mudar({ cabelo: c.id })}>
              <Avatar config={{ ...valor, cabelo: c.id }} tamanho={60} />
            </Opcao>
          ))}

        {aba === 'corCabelo' &&
          CORES_CABELO.map((c) => (
            <Opcao
              key={c.id}
              rotulo={`Cabelo ${c.nome}`}
              selecionada={valor.corCabelo === c.id}
              aoEscolher={() => mudar({ corCabelo: c.id })}
            >
              <Bolinha cor={c.cor} />
            </Opcao>
          ))}

        {aba === 'uniforme' &&
          UNIFORMES.map((u) => (
            <Opcao
              key={u.id}
              rotulo={`Uniforme ${u.nome}`}
              selecionada={valor.uniforme === u.id}
              aoEscolher={() => mudar({ uniforme: u.id })}
            >
              {/* Camisa desenhada na cor do uniforme */}
              <svg viewBox="0 0 40 40" width="44" height="44" aria-hidden>
                <path d="M4 12 L14 5 Q20 10 26 5 L36 12 L32 19 L28 17 L28 36 L12 36 L12 17 L8 19 Z" fill={u.camisa} />
                <path d="M15 6 Q20 13 25 6" fill="none" stroke={u.detalhe} strokeWidth="2.5" />
              </svg>
            </Opcao>
          ))}
      </div>
    </section>
  )
}
