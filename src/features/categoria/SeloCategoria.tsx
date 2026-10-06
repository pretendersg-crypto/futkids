// Selo pequeno com a categoria (ex.: "🌱 Novato"), usado nos cartões de treino e de vídeo.
import { categoriaPorId, type CategoriaId } from '../../data/categorias'

export function SeloCategoria({ id, trancado = false }: { id: CategoriaId; trancado?: boolean }) {
  const c = categoriaPorId(id)
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border-2 px-2 text-xs font-extrabold whitespace-nowrap ${c.cor}`}>
      {trancado ? '🔒' : <span aria-hidden>{c.emoji}</span>} {c.nome}
    </span>
  )
}
