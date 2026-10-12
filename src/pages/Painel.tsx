// Página /painel: painel do adulto para o COMPUTADOR (tela larga). Menu à esquerda:
//  📅 Plano de casa (grade de semanas, arrastar e soltar), ⚽ Plano da turma (treinador),
//  🧰 Área dos pais completa (treinos, gestos, fundamentos, programa, categoria), ☁️ Conta.
// Pede o PIN da área dos pais. No celular continua tudo como antes (Agenda → Pais).
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useContaStore } from '../conta/contaStore'
import { AreaPais } from '../features/agenda/pais/AreaPais'
import { TrancaPais } from '../features/agenda/pais/TrancaPais'
import { AtletaDoPlano } from '../features/conta/AtletaDoPlano'
import { Conta } from '../features/conta/Conta'
import { PlanoDaTurmaGrade } from '../features/painel/PlanoDaTurmaGrade'
import { PlanoDeCasa } from '../features/painel/PlanoDeCasa'
import { useUserStore } from '../stores/userStore'

type Aba = 'casa' | 'turma' | 'pais' | 'conta'

export function Painel() {
  const escolinha = useContaStore((s) => s.escolinha)
  const apelido = useUserStore((s) => s.apelido)
  const [aba, setAba] = useState<Aba>('casa')

  const item = (id: Aba, rotulo: string, visivel = true) =>
    visivel && (
      <button
        key={id}
        type="button"
        onClick={() => setAba(id)}
        aria-current={aba === id ? 'page' : undefined}
        className={`rounded-2xl px-3 py-2.5 text-left font-bold ${aba === id ? 'bg-violet-600 text-white shadow' : 'hover:bg-violet-100'}`}
      >
        {rotulo}
      </button>
    )

  let conteudo: ReactNode
  if (aba === 'casa')
    conteudo = (
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-extrabold">📅 Plano de casa {apelido && <span className="text-lg font-bold text-slate-500">· {apelido}</span>}</h2>
        <p className="text-sm text-slate-600">
          O aquecimento entra sozinho antes de qualquer treino. Dias em amarelo foram mudados por você (↩ volta ao programa). ✅ fez tudo · 🟡 fez uma parte.
        </p>
        <PlanoDeCasa />
      </div>
    )
  else if (aba === 'turma' && escolinha)
    conteudo = (
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-extrabold">⚽ Plano da turma</h2>
        <p className="text-sm text-slate-600">Aparece na agenda de cada atleta da turma, junto com o plano de casa. Lembre de salvar.</p>
        <PlanoDaTurmaGrade escolinha={escolinha} />
      </div>
    )
  else if (aba === 'conta')
    conteudo = (
      <div className="max-w-2xl">
        <Conta />
      </div>
    )
  else
    conteudo = (
      <div className="max-w-3xl">
        <AreaPais aoSair={() => setAba('casa')} />
      </div>
    )

  return (
    <div className="min-h-dvh bg-campo-claro">
      <TrancaPais>
        <div className="flex min-h-dvh">
          <nav aria-label="Painel" className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col gap-1 border-r-2 border-violet-100 bg-white p-3">
            <p className="mb-2 text-xl font-extrabold">🖥️ Painel FutKids</p>
            {item('casa', '📅 Plano de casa')}
            {item('turma', '⚽ Plano da turma', Boolean(escolinha))}
            {item('pais', '🧰 Treinos, gestos e mais')}
            {item('conta', '☁️ Conta')}
            <div className="mt-auto flex flex-col gap-1 text-sm">
              {escolinha && (
                <Link to="/treinador" className="rounded-xl px-3 py-2 font-bold hover:bg-violet-100">
                  ⚽ Área do treinador
                </Link>
              )}
              <Link to="/" className="rounded-xl px-3 py-2 font-bold hover:bg-violet-100">
                ⬅️ Voltar ao app
              </Link>
            </div>
          </nav>
          <main className="flex min-w-0 flex-1 flex-col gap-4 p-5">
            {aba !== 'turma' && <AtletaDoPlano />}
            {conteudo}
          </main>
        </div>
      </TrancaPais>
    </div>
  )
}
