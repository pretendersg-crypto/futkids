// Escolha da categoria (área dos pais): 6 botões, do Baby à Lenda.
import { CATEGORIAS, type CategoriaId } from '../../data/categorias'

interface Props {
  valor: CategoriaId | null
  aoMudar: (c: CategoriaId) => void
  /** Texto acima dos botões */
  rotulo: string
  /** Mostra "a partir do nível N" em cada botão */
  comNivel?: boolean
}

export function SeletorCategoria({ valor, aoMudar, rotulo, comNivel = false }: Props) {
  return (
    <fieldset>
      <legend className="mb-1 text-base font-bold">{rotulo}</legend>
      <div className="grid grid-cols-3 gap-2">
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={valor === c.id}
            onClick={() => aoMudar(c.id)}
            className={`flex min-h-14 flex-col items-center justify-center rounded-xl border-4 px-1 text-sm leading-tight font-extrabold ${
              valor === c.id ? `${c.cor} ring-4 ring-violet-600` : 'border-violet-100 bg-white'
            }`}
          >
            <span aria-hidden className="text-xl">
              {c.emoji}
            </span>
            {c.nome}
            {comNivel && <span className="text-[0.65rem] font-bold">nível {c.nivelMinimo}+</span>}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
