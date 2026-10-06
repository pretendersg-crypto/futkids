// Trava da área dos pais: na primeira vez cria um PIN; depois pede o PIN.
// "Esqueci o PIN": a conta do portão dos pais apaga o PIN (a agenda continua igual).
import { useState, type FormEvent, type ReactNode } from 'react'
import { PortaoDosPais } from '../../../components/ui/PortaoDosPais'
import { usePaisStore } from '../../../stores/paisStore'

const CAMPO = 'min-h-14 w-full rounded-2xl border-4 border-violet-200 px-4 text-center text-3xl tracking-[0.5em]'
const soDigitos = (v: string) => v.replace(/\D/g, '').slice(0, 6)

export function TrancaPais({ children }: { children: ReactNode }) {
  const temPin = usePaisStore((s) => s.pin !== null)
  const [liberado, setLiberado] = useState(false)
  const [pin, setPin] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [esqueci, setEsqueci] = useState(false)

  if (liberado) return <>{children}</>

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    if (!temPin) {
      if (pin.length < 4) return setErro('O PIN precisa ter de 4 a 6 números.')
      if (pin !== confirmacao) return setErro('Os dois PINs não são iguais.')
      await usePaisStore.getState().criarPin(pin)
      return setLiberado(true)
    }
    if (await usePaisStore.getState().conferirPin(pin)) setLiberado(true)
    else {
      setErro('PIN errado.')
      setPin('')
    }
  }

  if (esqueci) {
    return (
      <div className="flex flex-col gap-3 rounded-3xl border-4 border-violet-200 bg-white p-4">
        <h2 className="text-xl font-extrabold">Esqueci o PIN</h2>
        <p className="text-base">Responda a conta para apagar o PIN e criar outro. A agenda não muda.</p>
        <PortaoDosPais
          aoLiberar={() => {
            usePaisStore.getState().apagarPin()
            setEsqueci(false)
            setPin('')
          }}
        />
        <button type="button" onClick={() => setEsqueci(false)} className="min-h-12 font-bold underline">
          Voltar
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3 rounded-3xl border-4 border-violet-200 bg-white p-4">
      <h2 className="text-xl font-extrabold">👨‍👩‍👧 Área dos pais</h2>
      <p className="text-base">
        {temPin
          ? 'Digite o PIN para ver e mudar a agenda de treinos.'
          : 'Primeira vez: crie um PIN de 4 a 6 números. Ele protege a agenda para a criança não mudar sozinha.'}
      </p>
      <label className="flex flex-col gap-1 text-base font-bold">
        {temPin ? 'PIN' : 'Novo PIN'}
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          onChange={(e) => setPin(soDigitos(e.target.value))}
          className={CAMPO}
        />
      </label>
      {!temPin && (
        <label className="flex flex-col gap-1 text-base font-bold">
          Repita o PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={confirmacao}
            onChange={(e) => setConfirmacao(soDigitos(e.target.value))}
            className={CAMPO}
          />
        </label>
      )}
      {erro && (
        <p role="alert" className="font-bold text-red-700">
          ❌ {erro}
        </p>
      )}
      <button type="submit" className="min-h-14 rounded-2xl bg-sol text-xl font-extrabold shadow">
        {temPin ? 'Entrar 🔓' : 'Criar PIN 🔐'}
      </button>
      {temPin && (
        <button type="button" onClick={() => setEsqueci(true)} className="min-h-10 text-base font-bold underline">
          Esqueci o PIN
        </button>
      )}
    </form>
  )
}
