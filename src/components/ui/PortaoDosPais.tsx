// "Portão dos pais": uma conta que um adulto resolve rápido e uma criança pequena não.
// Não é segurança de verdade, só evita que a criança chegue sozinha em telas de adulto
// (ex.: digitar um apelido livre, onde poderia escrever o próprio nome).
import { useState, type FormEvent } from 'react'

interface Props {
  aoLiberar: () => void
}

function sortear(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

export function PortaoDosPais({ aoLiberar }: Props) {
  const [[a, b]] = useState(() => [sortear(6, 9), sortear(12, 19)])
  const [resposta, setResposta] = useState('')
  const [errou, setErrou] = useState(false)

  function conferir(e: FormEvent) {
    e.preventDefault()
    if (Number(resposta) === a * b) aoLiberar()
    else {
      setErrou(true)
      setResposta('')
    }
  }

  return (
    <form onSubmit={conferir} className="flex flex-col gap-3">
      <p className="text-lg">👨‍👩‍👧 Esta parte é para um adulto.</p>
      <label className="flex flex-col gap-2 text-xl font-bold">
        Quanto é {a} × {b}?
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={resposta}
          onChange={(e) => {
            setResposta(e.target.value.replace(/\D/g, ''))
            setErrou(false)
          }}
          className="min-h-14 rounded-2xl border-4 border-green-300 px-4 text-2xl"
        />
      </label>
      {errou && <p className="font-bold text-red-700">❌ Resposta errada. Tente de novo.</p>}
      <button type="submit" className="min-h-14 rounded-2xl bg-sol text-xl font-extrabold shadow">
        Confirmar
      </button>
    </form>
  )
}
