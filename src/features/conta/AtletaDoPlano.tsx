// Faixa no topo da área dos pais (responsável com conta): de qual atleta é o plano que está aberto,
// e trocar de atleta (o aparelho passa a ser desse atleta até trocar de novo).
import { useState } from 'react'
import { trocarAtleta } from '../../conta/conta'
import { useContaStore } from '../../conta/contaStore'

export function AtletaDoPlano() {
  const { uid, aparelhoDaCrianca, atletas, atletaAtivo } = useContaStore()
  const [trocando, setTrocando] = useState(false)
  const [erro, setErro] = useState('')
  const atual = atletas.find((a) => a.id === atletaAtivo)
  if (!uid || aparelhoDaCrianca || !atual) return null

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-1 rounded-3xl border-4 border-sky-400 bg-sky-100 p-3 shadow">
      <label className="flex flex-wrap items-center gap-2 text-lg font-extrabold">
        📋 Plano de:
        <select
          value={atual.id}
          disabled={trocando || atletas.length < 2}
          onChange={(e) => {
            setTrocando(true)
            setErro('')
            trocarAtleta(e.target.value).catch((falha: Error) => {
              setErro(falha.message)
              setTrocando(false)
            })
          }}
          className="min-h-12 min-w-0 flex-1 rounded-2xl border-2 border-sky-300 bg-white px-3 text-lg font-extrabold"
        >
          {atletas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.apelido}
            </option>
          ))}
        </select>
      </label>
      <p className="text-sm">{trocando ? 'Trocando de atleta…' : 'Tudo o que você muda aqui vale para este atleta (e chega no aparelho dele).'}</p>
      {erro && <p className="text-sm font-bold text-red-700">{erro}</p>}
    </div>
  )
}
