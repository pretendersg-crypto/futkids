// Página /painel: painel do adulto para o COMPUTADOR (tela larga). Menu à esquerda:
//  📅 Plano de casa (grade de semanas, arrastar e soltar), ⚽ Plano da equipe (treinador),
//  🧠 Tática (puzzles e pranchetas do Futsal Tático), 🧰 Área dos pais completa (treinos, gestos,
//  fundamentos, programa, categoria), ☁️ Conta.
// Usa letra menor que o app da criança (tela de adulto, com mais coisa à vista). Pede o PIN dos pais.
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useContaStore } from '../conta/contaStore'
import { AreaPais } from '../features/agenda/pais/AreaPais'
import { TrancaPais } from '../features/agenda/pais/TrancaPais'
import { Conta } from '../features/conta/Conta'
import { CopiarPlanoDeCasa } from '../features/painel/CopiarPlanoDeCasa'
import { GerenciarTaticas } from '../features/tatica/editor/GerenciarTaticas'
import { PlanoDaTurmaGrade } from '../features/painel/PlanoDaTurmaGrade'
import { PlanoDeCasa } from '../features/painel/PlanoDeCasa'
import { SeletorAtleta } from '../features/painel/SeletorAtleta'

type Aba = 'casa' | 'turma' | 'tatica' | 'pais' | 'conta'

/** No painel, o "tamanho base" da letra é menor (todas as medidas do app são relativas a ele) */
function useLetraDePainel() {
  useEffect(() => {
    const raiz = document.documentElement
    const antes = raiz.style.fontSize
    raiz.style.fontSize = '14px'
    return () => {
      raiz.style.fontSize = antes
    }
  }, [])
}

export function Painel() {
  useLetraDePainel()
  const escolinha = useContaStore((s) => s.escolinha)
  const [aba, setAba] = useState<Aba>('casa')

  const item = (id: Aba, emoji: string, rotulo: string, visivel = true) =>
    visivel && (
      <button
        key={id}
        type="button"
        onClick={() => setAba(id)}
        aria-current={aba === id ? 'page' : undefined}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left font-bold ${aba === id ? 'bg-violet-600 text-white shadow' : 'hover:bg-violet-100'}`}
      >
        <span aria-hidden>{emoji}</span>
        {rotulo}
      </button>
    )

  let conteudo: ReactNode
  if (aba === 'casa')
    conteudo = (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <h2 className="text-2xl font-extrabold">📅 Plano de casa</h2>
          <SeletorAtleta />
          <CopiarPlanoDeCasa compacto />
          <p className="basis-full text-sm text-slate-600">
            Clique em <b>+ Adicionar</b> no dia para escolher treinos e gestos técnicos. Arraste uma ficha para mudar de dia; ✕ tira. O aquecimento entra
            sozinho. Amarelo = dia mudado por você (↩ volta ao programa) · ✅ fez tudo · 🟡 fez uma parte.
          </p>
        </div>
        <PlanoDeCasa />
      </div>
    )
  else if (aba === 'turma' && escolinha)
    conteudo = (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold">⚽ Plano da equipe</h2>
          <p className="text-sm text-slate-600">
            "Toda a turma" chega para todos os atletas; escolha um atleta para um plano só dele. Os dois aparecem na agenda da criança junto com o plano
            de casa. Lembre de salvar.
          </p>
        </div>
        <PlanoDaTurmaGrade escolinha={escolinha} />
      </div>
    )
  else if (aba === 'tatica')
    conteudo = (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold">🧠 Futsal Tático: puzzles e pranchetas</h2>
          <p className="text-sm text-slate-600">
            Crie puzzles (melhor jogada, onde se posicionar, encontre o erro) e pranchetas com o lance explicado passo a passo. Escolha para quem: a
            sua família ou uma turma da escolinha.
          </p>
        </div>
        <GerenciarTaticas />
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
          <nav aria-label="Painel" className="sticky top-0 flex h-dvh w-48 shrink-0 flex-col gap-1 border-r-2 border-violet-100 bg-white p-2.5 text-sm">
            <p className="mb-2 px-1 text-lg font-extrabold">🖥️ Painel FutKids</p>
            {item('casa', '📅', 'Plano de casa')}
            {item('turma', '⚽', 'Plano da equipe', Boolean(escolinha))}
            {item('tatica', '🧠', 'Tática')}
            {item('pais', '🧰', 'Treinos, gestos e mais')}
            {item('conta', '☁️', 'Conta')}
            <div className="mt-auto flex flex-col gap-1">
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
          <main className="flex min-w-0 flex-1 flex-col gap-4 p-4">{conteudo}</main>
        </div>
      </TrancaPais>
    </div>
  )
}
