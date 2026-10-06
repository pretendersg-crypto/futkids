// Área dos pais: categoria do jogador. Automática (pelo XP) ou escolhida por um adulto
// (ex.: criança que já treina há tempo e pode começar em Iniciante, ou voltar uma categoria).
import { CATEGORIAS } from '../../data/categorias'
import { usePaisStore } from '../../stores/paisStore'
import { useCategoria } from './categoria'
import { SeletorCategoria } from './SeletorCategoria'

export function CategoriaDoJogador() {
  const { atual, pelaXP, fixa, nivel } = useCategoria()
  const fixarCategoria = usePaisStore((s) => s.fixarCategoria)

  return (
    <section className="flex flex-col gap-3 rounded-3xl border-4 border-violet-200 bg-white p-3">
      <h2 className="text-xl font-extrabold">🏅 Categoria do jogador</h2>
      <p className={`self-start rounded-full border-4 px-3 py-1 text-lg font-extrabold ${atual.cor}`}>
        {atual.emoji} {atual.nome} {fixa && <span className="text-sm">(escolhida por você)</span>}
      </p>
      <p className="text-sm">
        Cada treino e vídeo tem uma categoria e só abre quando a criança chega nela. O que você coloca na agenda do dia abre naquele dia,
        mesmo acima da categoria.
      </p>

      <label className="flex min-h-12 items-start gap-3 rounded-2xl bg-violet-50 p-2 text-base font-bold">
        <input type="radio" name="modo-categoria" checked={!fixa} onChange={() => fixarCategoria(null)} className="mt-1 size-6 shrink-0 accent-violet-600" />
        <span>
          Automática, pelo nível (XP)
          <span className="block text-sm font-medium">
            Hoje: nível {nivel} = {pelaXP.emoji} {pelaXP.nome}.{' '}
            {CATEGORIAS.map((c) => `${c.nome} ${c.nivelMinimo}`).join(' · ')}
          </span>
        </span>
      </label>
      <label className="flex min-h-12 items-start gap-3 rounded-2xl bg-violet-50 p-2 text-base font-bold">
        <input type="radio" name="modo-categoria" checked={fixa} onChange={() => fixarCategoria(atual.id)} className="mt-1 size-6 shrink-0 accent-violet-600" />
        <span>
          Escolhida por um adulto
          <span className="block text-sm font-medium">Fica nesta categoria até você mudar (não sobe sozinha).</span>
        </span>
      </label>
      {fixa && <SeletorCategoria valor={atual.id} aoMudar={fixarCategoria} rotulo="Categoria" comNivel />}
    </section>
  )
}
