// Página /conta (fora da barra de baixo): o responsável entra no celular dele mesmo sem ter montado
// um jogador, e o aparelho da criança é ligado por código. Com PIN dos pais criado, pede o PIN.
import { Link } from 'react-router'
import { useContaStore } from '../conta/contaStore'
import { TrancaPais } from '../features/agenda/pais/TrancaPais'
import { Conta } from '../features/conta/Conta'
import { usePaisStore } from '../stores/paisStore'
import { useUserStore } from '../stores/userStore'

export function ContaPagina() {
  const temPin = usePaisStore((s) => s.pin !== null)
  const temJogador = useUserStore((s) => s.apelido !== '')
  const { uid, aparelhoDaCrianca, atletaAtivo } = useContaStore()
  const conteudo = (
    <div className="flex flex-col gap-4">
      <Conta />
      {uid && !aparelhoDaCrianca && atletaAtivo && (
        <Link to="/agenda?aba=pais" className="grid min-h-14 place-items-center rounded-2xl bg-sol text-lg font-extrabold shadow">
          📋 Ir para a área dos pais (montar o plano)
        </Link>
      )}
    </div>
  )
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-4 bg-campo-claro p-4">
      <header className="flex items-center gap-3">
        <Link to={temJogador ? '/' : '/jogador'} aria-label="Voltar" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">☁️ Conta</h1>
      </header>
      {temPin ? <TrancaPais>{conteudo}</TrancaPais> : conteudo}
    </main>
  )
}
