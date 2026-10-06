// Campo numérico com botões − e + (dedos grandes, sem precisar do teclado).
// `passo` pode ser decimal (ex.: 0.5 segundo).

interface Props {
  valor: number
  min: number
  max: number
  passo?: number
  aoMudar: (v: number) => void
  /** Nome lido pelo leitor de tela (ex.: "segundos") */
  rotulo: string
}

export function CampoNumero({ valor, min, max, passo = 1, aoMudar, rotulo }: Props) {
  const casas = passo < 1 ? 1 : 0
  // Passo inteiro: aceita qualquer inteiro digitado (ex.: 12 com passo 5); decimal: arredonda ao passo
  const arredondar = (v: number) => (casas ? Number((Math.round(v / passo) * passo).toFixed(casas)) : Math.round(v))
  const limitar = (v: number) => Math.min(max, Math.max(min, arredondar(v)))
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label={`Menos ${rotulo}`} onClick={() => aoMudar(limitar(valor - passo))} className="grid size-12 place-items-center rounded-xl bg-violet-100 text-2xl font-black">
        −
      </button>
      <input
        type="number"
        inputMode={casas ? 'decimal' : 'numeric'}
        aria-label={rotulo}
        value={valor}
        min={min}
        max={max}
        step={passo}
        onChange={(e) => aoMudar(limitar(Number(e.target.value.replace(',', '.')) || min))}
        className="min-h-12 w-20 rounded-xl border-2 border-violet-200 px-2 text-center text-xl font-bold"
      />
      <button type="button" aria-label={`Mais ${rotulo}`} onClick={() => aoMudar(limitar(valor + passo))} className="grid size-12 place-items-center rounded-xl bg-violet-100 text-2xl font-black">
        +
      </button>
    </div>
  )
}
