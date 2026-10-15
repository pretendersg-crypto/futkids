// Criar e editar circuitos com cones no app (/goleiro/saida/criar), para pais e treinador. Pede a
// conta de adulto (o botão que leva até aqui já pediu). No computador, o painel (/painel, aba
// Circuitos) tem a mesma coisa com mais espaço.
import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { PortaoDosPais } from '../components/ui/PortaoDosPais'
import { GerenciarCircuitos } from '../features/saidaGol/editor/GerenciarCircuitos'

export function CriarCircuito() {
  const veioLiberado = (useLocation().state as { liberado?: boolean } | null)?.liberado === true
  const [liberado, setLiberado] = useState(veioLiberado)
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-3">
        <Link to="/goleiro/saida" aria-label="Voltar aos circuitos" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">✏️ Criar circuitos com cones</h1>
      </header>
      {liberado ? (
        <>
          <GerenciarCircuitos />
          <p className="text-center text-sm">💻 No computador fica mais fácil: abra o Painel (aba 🔶 Circuitos).</p>
        </>
      ) : (
        <div className="rounded-3xl bg-white p-4 shadow">
          <PortaoDosPais aoLiberar={() => setLiberado(true)} />
        </div>
      )}
    </section>
  )
}
