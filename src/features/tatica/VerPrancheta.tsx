// Mostra uma prancheta (lance explicado) quadro a quadro: os jogadores deslizam para o lugar de
// cada quadro, as setas mostram o que aconteceu e o texto explica. Anterior / Próximo.
import { useState } from 'react'
import { jogadoresNoQuadro } from './pranchetas'
import { Quadra } from './Quadra'
import { NOMES_SETA, type Prancheta, type TipoSeta } from './tipos'

export function VerPrancheta({ prancheta }: { prancheta: Prancheta }) {
  const [i, setI] = useState(0)
  const total = prancheta.quadros.length
  const quadro = prancheta.quadros[Math.min(i, total - 1)]
  const ultimo = i >= total - 1
  const tiposUsados = [...new Set(prancheta.quadros.flatMap((q) => q.setas.map((s) => s.tipo)))] as TipoSeta[]

  return (
    <div className="flex flex-col gap-3">
      <Quadra jogadores={jogadoresNoQuadro(prancheta, i)} bola={quadro.bola} setas={quadro.setas} rotulo={`Quadro ${i + 1} de ${total}`} />
      {tiposUsados.length > 0 && <p className="text-center text-xs font-bold text-slate-600">{tiposUsados.map((t) => NOMES_SETA[t]).join(' · ')}</p>}

      <div className="flex items-center gap-2" aria-hidden>
        {prancheta.quadros.map((_, k) => (
          <span key={k} className={`h-2 flex-1 rounded-full ${k <= i ? 'bg-emerald-500' : 'bg-emerald-100'}`} />
        ))}
      </div>
      <p key={i} role="status" className="pop min-h-20 rounded-3xl border-4 border-emerald-300 bg-white p-3 text-lg font-bold">
        <span className="text-emerald-700">
          {i + 1}/{total}.{' '}
        </span>
        {quadro.texto}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="min-h-14 rounded-2xl border-4 border-emerald-300 bg-white text-lg font-extrabold disabled:opacity-40">
          ◀ Anterior
        </button>
        {ultimo ? (
          <button type="button" onClick={() => setI(0)} className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow">
            Ver de novo 🔁
          </button>
        ) : (
          <button type="button" onClick={() => setI(i + 1)} className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow">
            Próximo ▶
          </button>
        )}
      </div>

      {ultimo && prancheta.comentario && (
        <div className="rounded-3xl border-4 border-sky-300 bg-sky-50 p-3">
          <p className="text-lg font-extrabold">🗣️ Recado {prancheta.autor ? `de ${prancheta.autor}` : 'do treinador'}</p>
          <p className="text-base whitespace-pre-line">{prancheta.comentario}</p>
        </div>
      )}
    </div>
  )
}
