// Criar e editar puzzles e pranchetas do Futsal Tático (pais e treinador). Primeiro escolhe PARA
// QUEM: a família (fica no aparelho e vai para os aparelhos da família pela sincronia) ou uma turma
// da escolinha (fica na nuvem e chega no app de cada atleta da turma). Depois: a lista do que já
// foi feito (editar, apagar), novo puzzle, nova prancheta ou um pronto do app como modelo.
// Usado no app (/tatica/criar) e no painel do computador (aba Tática).
import { useEffect, useState } from 'react'
import { useContaStore } from '../../../conta/contaStore'
import type { DadosEscolinha } from '../../../conta/nuvemEscolinha'
import type { TaticaDaTurma } from '../../../conta/nuvemTatica'
import { useTaticaCriadaStore } from '../../../stores/taticaCriadaStore'
import { traduzirErro } from '../../conta/acao'
import { PRANCHETAS_PRONTAS } from '../pranchetas'
import { PUZZLES } from '../puzzles'
import { EMOJI_CATEGORIA, type Prancheta, type Puzzle } from '../tipos'
import { EditorPrancheta } from './EditorPrancheta'
import { EditorPuzzle } from './EditorPuzzle'
import { copiarComoNovo, pranchetaEmBranco, puzzleEmBranco, semVazios } from './novos'

type Editando = { tipo: 'puzzle'; item: Puzzle } | { tipo: 'prancheta'; item: Prancheta } | null
/** 'familia' ou o id de uma turma */
type Destino = string

const nuvemTatica = () => import('../../../conta/nuvemTatica')

/** Lê os itens de uma turma (os quebrados ficam de fora) */
function lerItens(lista: TaticaDaTurma[]): { puzzles: Puzzle[]; pranchetas: Prancheta[] } {
  const puzzles: Puzzle[] = []
  const pranchetas: Prancheta[] = []
  for (const t of lista) {
    try {
      const x = { ...JSON.parse(t.json), id: t.id }
      if (t.tipo === 'puzzle') puzzles.push(x as Puzzle)
      else if (t.tipo === 'prancheta') pranchetas.push(x as Prancheta)
      // (circuitos com cones ficam no gerenciador dos circuitos)
    } catch {
      // ignorado: registro quebrado
    }
  }
  return { puzzles, pranchetas }
}

export function GerenciarTaticas() {
  const uid = useContaStore((s) => s.uid)
  const escolinha = useContaStore((s) => s.escolinha)
  const familia = useTaticaCriadaStore()
  const [esc, setEsc] = useState<DadosEscolinha | null>(null)
  const [destino, setDestino] = useState<Destino>('familia')
  const [daTurma, setDaTurma] = useState<TaticaDaTurma[] | null>(null)
  const [editando, setEditando] = useState<Editando>(null)
  const [modelo, setModelo] = useState('')
  const [erro, setErro] = useState('')
  const [recarregar, setRecarregar] = useState(0)

  // Treinador: as turmas da escolinha (o treinador começa na primeira turma)
  useEffect(() => {
    if (!escolinha) return
    let vivo = true
    import('../../../conta/nuvemEscolinha')
      .then((n) => n.lerEscolinha(escolinha))
      .then((d) => {
        if (!vivo) return
        setEsc(d)
        if (d.turmas[0]) setDestino((x) => (x === 'familia' ? d.turmas[0].id : x))
      })
      .catch(() => undefined)
    return () => {
      vivo = false
    }
  }, [escolinha])

  // O que já foi feito para a turma escolhida
  useEffect(() => {
    if (destino === 'familia' || !escolinha) return
    let vivo = true
    nuvemTatica()
      .then((n) => n.listarTaticas(escolinha, destino))
      .then((l) => vivo && setDaTurma(l))
      .catch((e) => vivo && setErro(traduzirErro(e)))
    return () => {
      vivo = false
    }
  }, [destino, escolinha, recarregar])

  const turma = esc?.turmas.find((t) => t.id === destino)
  const nomeDestino = turma ? `⚽ ${turma.nome}` : '🏠 Família'
  const itens = destino === 'familia' ? { puzzles: familia.puzzles, pranchetas: familia.pranchetas } : lerItens(daTurma ?? [])

  async function salvar(tipo: 'puzzle' | 'prancheta', item: Puzzle | Prancheta) {
    if (destino === 'familia') {
      if (tipo === 'puzzle') familia.salvarPuzzle(item as Puzzle)
      else familia.salvarPrancheta(item as Prancheta)
    } else {
      if (!escolinha || !uid) throw new Error('Entre na conta de treinador para salvar na turma.')
      try {
        await (await nuvemTatica()).salvarTatica(escolinha, destino, { id: item.id, tipo, titulo: item.titulo, dados: semVazios(item) }, uid)
      } catch (e) {
        throw new Error(traduzirErro(e))
      }
      setRecarregar((r) => r + 1)
    }
    setEditando(null)
  }

  async function apagar(tipo: 'puzzle' | 'prancheta', item: Puzzle | Prancheta) {
    if (!confirm(`Apagar "${item.titulo}"? ${destino === 'familia' ? '' : 'Ele some do app dos atletas da turma.'}`)) return
    setErro('')
    if (destino === 'familia') {
      if (tipo === 'puzzle') familia.apagarPuzzle(item.id)
      else familia.apagarPrancheta(item.id)
      return
    }
    try {
      await (await nuvemTatica()).apagarTatica(escolinha!, destino, item.id)
      setRecarregar((r) => r + 1)
    } catch (e) {
      setErro(traduzirErro(e))
    }
  }

  function usarModelo(valor: string) {
    setModelo('')
    const [tipo, id] = valor.split(':')
    if (tipo === 'pz') {
      const p = PUZZLES.find((x) => x.id === id)
      if (p) setEditando({ tipo: 'puzzle', item: copiarComoNovo(p, 'pz') })
    } else {
      const p = PRANCHETAS_PRONTAS.find((x) => x.id === id)
      if (p) setEditando({ tipo: 'prancheta', item: copiarComoNovo(p, 'pr') })
    }
  }

  if (editando?.tipo === 'puzzle')
    return <EditorPuzzle key={editando.item.id} inicial={editando.item} destino={nomeDestino} aoSalvar={(p) => salvar('puzzle', p)} aoCancelar={() => setEditando(null)} />
  if (editando?.tipo === 'prancheta')
    return <EditorPrancheta key={editando.item.id} inicial={editando.item} destino={nomeDestino} aoSalvar={(p) => salvar('prancheta', p)} aoCancelar={() => setEditando(null)} />

  const linha = (tipo: 'puzzle' | 'prancheta', item: Puzzle | Prancheta) => (
    <li key={item.id} className="flex items-center gap-2 rounded-2xl border-2 border-emerald-200 bg-white p-2">
      <span aria-hidden className="text-2xl">
        {EMOJI_CATEGORIA[item.categoria] ?? '🧠'}
      </span>
      <span className="flex flex-1 flex-col leading-tight">
        <span className="font-extrabold">{item.titulo || '(sem título)'}</span>
        <span className="text-xs">{tipo === 'puzzle' ? `🧩 Puzzle · ${(item as Puzzle).passos.length} pergunta(s)` : `📋 Prancheta · ${(item as Prancheta).quadros.length} quadros`}</span>
      </span>
      <button type="button" onClick={() => setEditando(tipo === 'puzzle' ? { tipo, item: item as Puzzle } : { tipo, item: item as Prancheta })} className="rounded-xl border-2 border-emerald-300 px-2 py-1 text-sm font-bold">
        ✏️ Editar
      </button>
      <button type="button" onClick={() => apagar(tipo, item)} className="rounded-xl px-2 py-1 text-sm" aria-label={`Apagar ${item.titulo}`}>
        🗑️
      </button>
    </li>
  )

  const carregando = destino !== 'familia' && daTurma === null
  const vazio = itens.puzzles.length === 0 && itens.pranchetas.length === 0

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 font-extrabold">
        Para quem
        <select
          value={destino}
          onChange={(e) => {
            setDaTurma(null)
            setErro('')
            setDestino(e.target.value)
          }}
          className="min-h-12 rounded-2xl border-2 border-emerald-300 bg-white px-3 text-base"
        >
          {esc?.turmas.map((t) => (
            <option key={t.id} value={t.id}>
              ⚽ Turma {t.nome} (chega no app dos atletas)
            </option>
          ))}
          <option value="familia">🏠 Minha família (meus filhos)</option>
        </select>
      </label>
      <p className="rounded-2xl bg-sky-50 p-2 text-sm">
        {destino === 'familia'
          ? 'Fica neste aparelho e vai para os aparelhos da família pela conta. Aparece no Futsal Tático dos seus filhos.'
          : 'Fica na nuvem da escolinha e aparece no Futsal Tático de cada atleta da turma (puzzles na aba Puzzles, pranchetas na aba Lances).'}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setEditando({ tipo: 'puzzle', item: puzzleEmBranco() })} className="min-h-14 rounded-2xl bg-sol text-base font-extrabold shadow">
          + 🧩 Novo puzzle
        </button>
        <button type="button" onClick={() => setEditando({ tipo: 'prancheta', item: pranchetaEmBranco() })} className="min-h-14 rounded-2xl bg-sol text-base font-extrabold shadow">
          + 📋 Nova prancheta
        </button>
      </div>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Ou comece de um pronto do app (vira uma cópia sua)
        <select value={modelo} onChange={(e) => usarModelo(e.target.value)} className="min-h-11 rounded-xl border-2 border-emerald-200 bg-white px-2 text-base">
          <option value="">Escolher um modelo…</option>
          <optgroup label="Pranchetas">
            {PRANCHETAS_PRONTAS.map((p) => (
              <option key={p.id} value={`pr:${p.id}`}>
                {p.titulo}
              </option>
            ))}
          </optgroup>
          <optgroup label="Puzzles">
            {PUZZLES.map((p) => (
              <option key={p.id} value={`pz:${p.id}`}>
                {EMOJI_CATEGORIA[p.categoria]} {p.titulo}
              </option>
            ))}
          </optgroup>
        </select>
      </label>

      {erro && <p className="font-bold text-red-700">❌ {erro}</p>}
      <h3 className="text-lg font-extrabold">Feitos para {nomeDestino}</h3>
      {carregando && <p>Carregando…</p>}
      {!carregando && vazio && <p className="text-sm">Nada ainda. Crie o primeiro aqui em cima!</p>}
      <ul className="flex flex-col gap-2">
        {itens.puzzles.map((p) => linha('puzzle', p))}
        {itens.pranchetas.map((p) => linha('prancheta', p))}
      </ul>
    </div>
  )
}
