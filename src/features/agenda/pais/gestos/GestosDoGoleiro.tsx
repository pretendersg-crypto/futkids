// Área dos pais: lista dos fundamentos e gestos do goleiro, por categoria, para mudar (textos,
// desenho, vídeo real) ou criar novos.
import { CATEGORIAS_GESTO } from '../../../saidaGol/gestos'
import { DesenhoGesto } from '../../../saidaGol/DesenhoGesto'
import { useGestos } from '../../../saidaGol/useGestos'
import { ehGestoPronto, useGestosStore } from '../../../../stores/gestosStore'

export function GestosDoGoleiro({ aoEditar }: { aoEditar: (id: string | null) => void }) {
  const gestos = useGestos()
  const editados = useGestosStore((s) => s.editados)

  return (
    <section className="flex flex-col gap-2 rounded-3xl border-4 border-violet-200 bg-white p-3">
      <h2 className="text-xl font-extrabold">🧤 Fundamentos e gestos do goleiro</h2>
      <p className="text-sm">
        Mude os textos e o desenho, coloque vídeos reais (link do YouTube ou gravados no celular) ou crie gestos novos. Eles aparecem em Goleiro → 📖
        Fundamentos e gestos.
      </p>
      <button
        type="button"
        onClick={() => aoEditar(null)}
        className="min-h-14 rounded-2xl border-4 border-dashed border-violet-400 bg-violet-50 text-lg font-extrabold"
      >
        ➕ Adicionar gesto
      </button>
      {CATEGORIAS_GESTO.map((cat) => {
        const daCategoria = gestos.filter((g) => g.categoria === cat.id)
        if (daCategoria.length === 0) return null
        return (
          <div key={cat.id} className="flex flex-col gap-1">
            <h3 className="pt-1 text-base font-extrabold">
              {cat.emoji} {cat.nome}
            </h3>
            <ul className="flex flex-col gap-1">
              {daCategoria.map((g) => (
                <li key={g.id}>
                  <button type="button" onClick={() => aoEditar(g.id)} className="flex min-h-14 w-full items-center gap-2 rounded-2xl border-2 border-violet-100 p-1 text-left">
                    <span className="shrink-0 rounded-xl bg-green-50">
                      <DesenhoGesto desenho={g.desenho} nome={g.nome} tamanho={44} />
                    </span>
                    <span className="flex flex-1 flex-col leading-tight">
                      <span className="font-bold">{g.nome}</span>
                      <span className="text-xs font-bold">
                        {g.video || g.videoLocal ? '🎬 com vídeo' : 'sem vídeo'}
                        {!ehGestoPronto(g.id) ? ' · ⭐ criado por você' : editados[g.id] ? ' · mudado neste aparelho' : ''}
                      </span>
                    </span>
                    <span aria-hidden className="text-xl">
                      ✏️
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
