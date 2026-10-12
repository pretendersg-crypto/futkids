// Lógica comum das telas da conta: estilo do botão e ação assíncrona com "ocupado/erro" em português.
import { useState } from 'react'

export const BOTAO = 'min-h-12 rounded-2xl px-4 text-base font-extrabold shadow disabled:opacity-50'

/** Roda uma ação assíncrona guardando "ocupado" e a mensagem de erro para mostrar */
export function useAcao() {
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  async function rodar(acao: () => Promise<unknown>) {
    setOcupado(true)
    setErro('')
    try {
      await acao()
    } catch (e) {
      setErro(traduzirErro(e))
    } finally {
      setOcupado(false)
    }
  }
  return { ocupado, erro, rodar }
}

/** Mensagens do Firebase em português, para os pais */
export function traduzirErro(e: unknown): string {
  const codigo = (e as { code?: string }).code ?? ''
  const mensagens: Record<string, string> = {
    'auth/network-request-failed': 'Sem internet. Tente de novo quando a conexão voltar.',
    'auth/invalid-email': 'Esse e-mail não parece certo.',
    'auth/invalid-action-code': 'Esse link já foi usado ou venceu. Peça um novo.',
    'auth/expired-action-code': 'Esse link venceu. Peça um novo.',
    'auth/too-many-requests': 'Muitas tentativas. Espere alguns minutos.',
    'auth/requires-recent-login': 'Por segurança, saia e entre de novo na conta antes de apagar.',
    'permission-denied': 'Sem permissão para isso (o código pode ter vencido ou já ter sido usado).',
    unavailable: 'Sem internet. Tente de novo quando a conexão voltar.',
  }
  return mensagens[codigo] ?? ((e as Error).message || 'Não deu certo. Tente de novo.')
}

