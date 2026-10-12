// Apelido do filho na conta: um da lista pronta ou um digitado pelo adulto (nunca o nome verdadeiro).
import { APELIDOS } from '../../data/apelidos'

export function CampoApelido({ valor, aoMudar }: { valor: string; aoMudar: (apelido: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex flex-col gap-1 text-sm font-bold">
        Apelido (não use o nome verdadeiro)
        <input
          value={valor}
          maxLength={24}
          onChange={(e) => aoMudar(e.target.value)}
          placeholder="Ex.: Paredão 🧱"
          className="min-h-12 rounded-xl border-2 border-sky-200 px-3 text-base font-normal"
        />
      </label>
      <div className="flex flex-wrap gap-1">
        {APELIDOS.slice(0, 8).map((a) => (
          <button key={a} type="button" onClick={() => aoMudar(a)} className="rounded-full border-2 border-sky-200 bg-white px-2 py-0.5 text-sm">
            {a}
          </button>
        ))}
      </div>
    </div>
  )
}
