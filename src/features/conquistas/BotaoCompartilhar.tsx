// Botão "Compartilhar": enviar algo para fora do app é coisa de adulto, então passa
// pelo portão dos pais antes de gerar a imagem.
import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { PortaoDosPais } from '../../components/ui/PortaoDosPais'
import type { Conquista } from '../../data/catalogo'
import { compartilharConquista } from './compartilhar'

interface Props {
  conquista: Conquista
  /** Data do desbloqueio (AAAA-MM-DD) */
  data: string
}

const MENSAGENS = {
  compartilhado: '✅ Imagem compartilhada!',
  baixado: '✅ Imagem salva no aparelho!',
  cancelado: '',
  erro: '❌ Não deu para criar a imagem. Tente de novo.',
}

export function BotaoCompartilhar({ conquista, data }: Props) {
  const [janela, setJanela] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function liberado() {
    setJanela(false)
    try {
      setMensagem(MENSAGENS[await compartilharConquista(conquista, data)])
    } catch {
      setMensagem(MENSAGENS.erro)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => {
          setMensagem('')
          setJanela(true)
        }}
        className="min-h-14 w-full rounded-2xl border-4 border-green-300 bg-white text-lg font-extrabold"
      >
        Compartilhar 📤
      </button>
      {mensagem && (
        <p className="text-center text-sm font-bold" role="status">
          {mensagem}
        </p>
      )}
      <Modal aberto={janela} aoFechar={() => setJanela(false)} titulo="Compartilhar">
        {janela && <PortaoDosPais aoLiberar={liberado} />}
      </Modal>
    </div>
  )
}
