// Painel: escolher de qual atleta é o plano (versão compacta da faixa "Plano de" do celular).
import { useState } from 'react'
import { trocarAtleta } from '../../conta/conta'
import { useContaStore } from '../../conta/contaStore'

export function SeletorAtleta() {
  const { uid, aparelhoDaCrianca, atletas, atletaAtivo } = useContaStore()
  const [trocando, setTrocando] = useState(false)
  if (!uid || aparelhoDaCrianca || atletas.length === 0) return null
  return (
    <label className="flex items-center gap-2 font-bold">
      <span className="text-slate-600">Atleta</span>
      <select
        value={atletaAtivo ?? ''}
        disabled={trocando || atletas.length < 2}
        onChange={(e) => {
          setTrocando(true)
          trocarAtleta(e.target.value).catch(() => setTrocando(false))
        }}
        className="rounded-xl border-2 border-violet-300 bg-white px-3 py-1.5 font-extrabold"
      >
        {atletas.map((a) => (
          <option key={a.id} value={a.id}>
            {a.apelido}
          </option>
        ))}
      </select>
      {trocando && <span className="text-sm">trocando…</span>}
    </label>
  )
}
