// Página /treinador (fora da barra de baixo): a área do treinador de escolinha.
import { Link } from 'react-router'
import { PainelEscolinha } from '../features/escolinha/PainelEscolinha'
import { useUserStore } from '../stores/userStore'

export function TreinadorPagina() {
  const temJogador = useUserStore((s) => s.apelido !== '')
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-4 bg-campo-claro p-4">
      <header className="flex items-center gap-3">
        <Link to={temJogador ? '/' : '/jogador'} aria-label="Voltar" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">⚽ Área do treinador</h1>
      </header>
      <PainelEscolinha />
    </main>
  )
}
