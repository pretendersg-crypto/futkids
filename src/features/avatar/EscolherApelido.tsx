// Escolha do apelido: lista pronta para a criança tocar, ou um apelido livre digitado
// por um adulto (protegido pelo "portão dos pais").
import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import { PortaoDosPais } from '../../components/ui/PortaoDosPais'
import { APELIDOS } from '../../data/apelidos'
import { Opcao } from './Opcao'

const TAMANHO_MAXIMO = 15

interface Props {
  valor: string
  aoMudar: (apelido: string) => void
}

export function EscolherApelido({ valor, aoMudar }: Props) {
  const [janela, setJanela] = useState<'fechada' | 'portao' | 'digitar'>('fechada')
  const [texto, setTexto] = useState('')
  const apelidoLivre = valor !== '' && !APELIDOS.includes(valor)

  function salvarTexto(e: FormEvent) {
    e.preventDefault()
    const limpo = texto.trim()
    if (!limpo) return
    aoMudar(limpo)
    setJanela('fechada')
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {apelidoLivre && (
          <Opcao selecionada rotulo={valor} aoEscolher={() => {}} className="col-span-2 min-h-14 px-3 text-lg font-bold">
            {valor}
          </Opcao>
        )}
        {APELIDOS.map((a) => (
          <Opcao
            key={a}
            rotulo={a}
            selecionada={valor === a}
            aoEscolher={() => aoMudar(a)}
            className="min-h-14 px-2 text-lg font-bold"
          >
            {a}
          </Opcao>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setTexto(apelidoLivre ? valor : '')
          setJanela('portao')
        }}
        className="min-h-14 rounded-2xl border-4 border-dashed border-green-300 bg-white text-lg font-bold"
      >
        ✏️ Um adulto quer escrever outro apelido
      </button>

      <Modal aberto={janela !== 'fechada'} aoFechar={() => setJanela('fechada')} titulo="Outro apelido">
        {janela === 'portao' && <PortaoDosPais aoLiberar={() => setJanela('digitar')} />}
        {janela === 'digitar' && (
          <form onSubmit={salvarTexto} className="flex flex-col gap-3">
            <label className="flex flex-col gap-2 text-lg font-bold">
              Apelido
              <input
                type="text"
                value={texto}
                maxLength={TAMANHO_MAXIMO}
                autoComplete="off"
                autoFocus
                onChange={(e) => setTexto(e.target.value)}
                className="min-h-14 rounded-2xl border-4 border-green-300 px-4 text-2xl"
              />
            </label>
            <p className="text-base">
              🔒 Prefira um apelido, não o nome completo da criança. Ele fica salvo só neste aparelho.
            </p>
            <button
              type="submit"
              disabled={!texto.trim()}
              className="min-h-14 rounded-2xl bg-sol text-xl font-extrabold shadow disabled:opacity-50"
            >
              Salvar apelido
            </button>
          </form>
        )}
      </Modal>
    </section>
  )
}
