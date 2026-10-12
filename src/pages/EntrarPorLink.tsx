// Página /entrar: o link de entrada que chega no e-mail abre aqui. Termina o login e vai para /conta.
// Se o link foi aberto em outro aparelho (o e-mail não está guardado aqui), pede o e-mail de novo.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { concluirLinkDeEmail } from '../conta/conta'
import { BOTAO, traduzirErro } from '../features/conta/acao'

export function EntrarPorLink() {
  const navegar = useNavigate()
  const [pedirEmail, setPedirEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(true)

  // Só muda o estado depois da resposta (nada síncrono dentro do efeito)
  function concluir(emailDigitado?: string) {
    concluirLinkDeEmail(location.href, emailDigitado)
      .then((r) => {
        if (r === null) setErro('Este endereço não é um link de entrada. Peça um novo na tela da conta.')
        else navegar('/conta', { replace: true })
      })
      .catch((e: Error) => {
        if (e.message.startsWith('Digite o e-mail')) setPedirEmail(true)
        else setErro(traduzirErro(e))
      })
      .finally(() => setOcupado(false))
  }

  useEffect(() => {
    concluir() // só na abertura da página
  }, []) // oxlint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 bg-campo-claro p-4 text-center">
      <h1 className="text-2xl font-extrabold">☁️ Entrando…</h1>
      {pedirEmail && (
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 text-left">
          <label className="flex flex-col gap-1 font-bold">
            Para confirmar, digite o e-mail que recebeu o link
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-12 rounded-xl border-2 border-sky-200 px-3 font-normal" />
          </label>
          <button type="button" disabled={ocupado || !email.includes('@')} onClick={() => {
              setOcupado(true)
              setErro('')
              concluir(email.trim())
            }} className={`${BOTAO} bg-sol`}>
            Entrar
          </button>
        </div>
      )}
      {ocupado && !pedirEmail && <p>Só um instante.</p>}
      {erro && (
        <p role="alert" className="font-bold text-red-700">
          ❌ {erro}
        </p>
      )}
    </main>
  )
}
