// Copiar o plano de casa (programa, trocas de dias e vídeos) do atleta deste aparelho para outros
// atletas da família. Só aparece com a conta e 2 ou mais atletas.
import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { copiarPlanoDeCasa } from '../../conta/conta'
import { useContaStore } from '../../conta/contaStore'
import { BOTAO, useAcao } from '../conta/acao'
import { MensagemErro } from '../conta/comum'

export function CopiarPlanoDeCasa({ compacto = false }: { compacto?: boolean }) {
  const { uid, aparelhoDaCrianca, atletas, atletaAtivo } = useContaStore()
  const [aberto, setAberto] = useState(false)
  const [destinos, setDestinos] = useState<string[]>([])
  const [feito, setFeito] = useState('')
  const { ocupado, erro, rodar } = useAcao()
  const outros = atletas.filter((a) => a.id !== atletaAtivo)
  if (!uid || aparelhoDaCrianca || !atletaAtivo || outros.length === 0) return null
  const atual = atletas.find((a) => a.id === atletaAtivo)?.apelido ?? 'este atleta'

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={compacto ? 'rounded-xl border-2 border-violet-200 bg-white px-3 py-1.5 text-sm font-bold hover:border-violet-500' : `${BOTAO} self-start bg-white`}
      >
        📋 Copiar {compacto ? 'para outro filho' : `o plano de ${atual} para outro filho`}
      </button>
      {feito && <p className="font-bold text-green-700">✅ {feito}</p>}
      <Modal aberto={aberto} aoFechar={() => setAberto(false)} titulo={`Copiar o plano de ${atual}`}>
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            O <b>plano de casa</b> (programa, dias trocados e vídeos) de cada filho marcado será <b>trocado</b> por uma cópia do de {atual}. O
            progresso deles não muda.
          </p>
          {outros.map((a) => (
            <label key={a.id} className="flex items-center gap-2 rounded-xl bg-white p-2 font-bold">
              <input
                type="checkbox"
                checked={destinos.includes(a.id)}
                onChange={(e) => setDestinos((d) => (e.target.checked ? [...d, a.id] : d.filter((x) => x !== a.id)))}
                className="size-5"
              />
              {a.apelido}
            </label>
          ))}
          <MensagemErro erro={erro} />
          <button
            type="button"
            disabled={ocupado || destinos.length === 0}
            onClick={() =>
              rodar(async () => {
                await copiarPlanoDeCasa(destinos)
                setFeito(`Plano copiado para ${destinos.map((id) => atletas.find((a) => a.id === id)?.apelido).join(', ')}.`)
                setDestinos([])
                setAberto(false)
              })
            }
            className={`${BOTAO} bg-sol`}
          >
            {ocupado ? 'Copiando…' : `Copiar para ${destinos.length} filho${destinos.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </Modal>
    </>
  )
}
