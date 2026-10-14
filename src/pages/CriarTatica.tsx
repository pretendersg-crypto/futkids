// Criar e editar puzzles e pranchetas do Futsal Tático no app (/tatica/criar), para pais e treinador.
// A tela pede a conta de adulto (o botão que leva até aqui já pediu; entrar direto pelo endereço
// também pede). No computador, o painel (/painel, aba Tática) tem a mesma coisa com mais espaço.
import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { PortaoDosPais } from '../components/ui/PortaoDosPais'
import { GerenciarTaticas } from '../features/tatica/editor/GerenciarTaticas'

export function CriarTatica() {
  // Vindo do botão do Futsal Tático, a conta de adulto já foi feita
  const veioLiberado = (useLocation().state as { liberado?: boolean } | null)?.liberado === true
  const [liberado, setLiberado] = useState(veioLiberado)
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-3">
        <Link to="/tatica" aria-label="Voltar ao Futsal Tático" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">✏️ Criar puzzles e lances</h1>
      </header>
      {liberado ? (
        <>
          <GerenciarTaticas />
          <p className="text-center text-sm">💻 No computador fica mais fácil: abra o Painel (aba 🧠 Tática).</p>
        </>
      ) : (
        <div className="rounded-3xl bg-white p-4 shadow">
          <PortaoDosPais aoLiberar={() => setLiberado(true)} />
        </div>
      )}
    </section>
  )
}
