// Faixa no topo da área dos pais, com a conta da família: de qual filho é o plano que está aberto, e
// trocar de filho (o aparelho passa a ser desse filho até trocar de novo).
import { useState } from 'react'
import { trocarFilho } from '../../conta/conta'
import { useContaStore } from '../../conta/contaStore'

export function FilhoDoPlano() {
  const { uid, filhos, filhoAtivo } = useContaStore()
  const [trocando, setTrocando] = useState(false)
  const [erro, setErro] = useState('')
  const atual = filhos.find((f) => f.id === filhoAtivo)
  if (!uid || !atual) return null

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-1 rounded-3xl border-4 border-sky-400 bg-sky-100 p-3 shadow">
      <label className="flex flex-wrap items-center gap-2 text-lg font-extrabold">
        📋 Plano de:
        <select
          value={atual.id}
          disabled={trocando || filhos.length < 2}
          onChange={(e) => {
            setTrocando(true)
            setErro('')
            trocarFilho(e.target.value).catch((falha: Error) => {
              setErro(falha.message)
              setTrocando(false)
            })
          }}
          className="min-h-12 min-w-0 flex-1 rounded-2xl border-2 border-sky-300 bg-white px-3 text-lg font-extrabold"
        >
          {filhos.map((f) => (
            <option key={f.id} value={f.id}>
              {f.apelido}
            </option>
          ))}
        </select>
      </label>
      <p className="text-sm">{trocando ? 'Trocando de filho…' : 'Tudo o que você muda aqui vale para este filho (e chega no aparelho dele).'}</p>
      {erro && <p className="text-sm font-bold text-red-700">{erro}</p>}
    </div>
  )
}
