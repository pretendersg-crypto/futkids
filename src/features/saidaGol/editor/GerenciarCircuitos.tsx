// Criar e editar circuitos com cones (pais e treinador). Primeiro PARA QUEM: a família (fica no
// aparelho e vai para os aparelhos da família pela sincronia) ou uma turma da escolinha (fica na
// nuvem e chega no app de cada atleta da turma). Depois: a lista do que já foi feito (editar,
// apagar), circuito novo ou um pronto do app como modelo. Usado no app (/goleiro/saida/criar) e no
// painel do computador (aba Circuitos).
import { useEffect, useState } from 'react'
import { useContaStore } from '../../../conta/contaStore'
import type { DadosEscolinha } from '../../../conta/nuvemEscolinha'
import type { TaticaDaTurma } from '../../../conta/nuvemTatica'
import { useCircuitosStore } from '../../../stores/circuitosStore'
import { traduzirErro } from '../../conta/acao'
import { circuitoEmBranco, CIRCUITOS, NOME_NIVEL, type Circuito } from '../circuitos'
import { GESTOS_PRONTOS } from '../gestos'
import { QuadraCones } from '../QuadraCones'
import { useGestos } from '../useGestos'
import { EditorCircuito } from './EditorCircuito'

const nuvem = () => import('../../../conta/nuvemTatica')

function lerCircuitos(lista: TaticaDaTurma[]): Circuito[] {
  return lista.flatMap((t) => {
    if (t.tipo !== 'circuito') return []
    try {
      return [{ ...(JSON.parse(t.json) as Circuito), id: t.id }]
    } catch {
      return []
    }
  })
}

const novoId = () => `cc-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function GerenciarCircuitos() {
  const uid = useContaStore((s) => s.uid)
  const escolinha = useContaStore((s) => s.escolinha)
  const familia = useCircuitosStore()
  const gestosDaFamilia = useGestos()
  const [esc, setEsc] = useState<DadosEscolinha | null>(null)
  /** 'familia' ou o id de uma turma */
  const [destino, setDestino] = useState('familia')
  const [daTurma, setDaTurma] = useState<TaticaDaTurma[] | null>(null)
  const [editando, setEditando] = useState<Circuito | null>(null)
  const [modelo, setModelo] = useState('')
  const [erro, setErro] = useState('')
  const [recarregar, setRecarregar] = useState(0)

  // Treinador: as turmas da escolinha (começa na primeira turma)
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

  useEffect(() => {
    if (destino === 'familia' || !escolinha) return
    let vivo = true
    nuvem()
      .then((n) => n.listarTaticas(escolinha, destino))
      .then((l) => vivo && setDaTurma(l))
      .catch((e) => vivo && setErro(traduzirErro(e)))
    return () => {
      vivo = false
    }
  }, [destino, escolinha, recarregar])

  const turma = esc?.turmas.find((t) => t.id === destino)
  const nomeDestino = turma ? `⚽ ${turma.nome}` : '🏠 Família'
  const naTurma = destino !== 'familia'
  // Na turma, só os gestos do app (os criados pela família não existem nos aparelhos dos atletas)
  const gestos = naTurma ? GESTOS_PRONTOS : gestosDaFamilia
  const lista = naTurma ? lerCircuitos(daTurma ?? []) : familia.criados

  async function salvar(c: Circuito) {
    if (!naTurma) familia.salvarCircuito(c)
    else {
      if (!escolinha || !uid) throw new Error('Entre na conta de treinador para salvar na turma.')
      try {
        await (await nuvem()).salvarTatica(escolinha, destino, { id: c.id, tipo: 'circuito', titulo: c.nome, dados: c }, uid)
      } catch (e) {
        throw new Error(traduzirErro(e))
      }
      setRecarregar((r) => r + 1)
    }
    setEditando(null)
  }

  async function apagar(c: Circuito) {
    if (!confirm(`Apagar o circuito "${c.nome}"?${naTurma ? ' Ele some do app dos atletas da turma.' : ''}`)) return
    setErro('')
    if (!naTurma) return familia.apagarCircuito(c.id)
    try {
      await (await nuvem()).apagarTatica(escolinha!, destino, c.id)
      setRecarregar((r) => r + 1)
    } catch (e) {
      setErro(traduzirErro(e))
    }
  }

  function usarModelo(id: string) {
    setModelo('')
    const c = CIRCUITOS.find((x) => x.id === id)
    if (c) setEditando({ ...structuredClone(c), id: novoId(), nome: `${c.nome} (cópia)`.slice(0, 40) })
  }

  if (editando) return <EditorCircuito key={editando.id} inicial={editando} destino={nomeDestino} gestos={gestos} aoSalvar={salvar} aoCancelar={() => setEditando(null)} />

  const carregando = naTurma && daTurma === null
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
          className="min-h-12 rounded-2xl border-2 border-sky-300 bg-white px-3 text-base"
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
        {naTurma
          ? 'Fica na nuvem da escolinha e aparece em Goleiro → Saída do gol com cones, no app de cada atleta da turma.'
          : 'Fica neste aparelho e vai para os aparelhos da família pela conta. Aparece em Goleiro → Saída do gol com cones.'}
      </p>

      <button type="button" onClick={() => setEditando(circuitoEmBranco())} className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow">
        + 🔶 Novo circuito
      </button>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Ou comece de um pronto do app (vira uma cópia sua)
        <select value={modelo} onChange={(e) => usarModelo(e.target.value)} className="min-h-11 rounded-xl border-2 border-sky-200 bg-white px-2 text-base">
          <option value="">Escolher um modelo…</option>
          {CIRCUITOS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.nome}
            </option>
          ))}
        </select>
      </label>

      {erro && <p className="font-bold text-red-700">❌ {erro}</p>}
      <h3 className="text-lg font-extrabold">Feitos para {nomeDestino}</h3>
      {carregando && <p>Carregando…</p>}
      {!carregando && lista.length === 0 && <p className="text-sm">Nenhum ainda. Crie o primeiro aqui em cima!</p>}
      <ul className="flex flex-col gap-2">
        {lista.map((c) => (
          <li key={c.id} className="flex items-center gap-2 rounded-2xl border-2 border-sky-200 bg-white p-2">
            <div className="w-24 shrink-0">
              <QuadraCones circuito={c} modo="percurso" />
            </div>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="font-extrabold">
                {c.emoji} {c.nome}
              </span>
              <span className="text-xs">
                {NOME_NIVEL[c.nivel]} · {c.cones.length} cones · {c.passos.length} passos {c.video ? '· 🎬 vídeo' : ''}
              </span>
            </span>
            <button type="button" onClick={() => setEditando(c)} className="rounded-xl border-2 border-sky-300 px-2 py-1 text-sm font-bold">
              ✏️ Editar
            </button>
            <button type="button" onClick={() => apagar(c)} className="rounded-xl px-2 py-1 text-sm" aria-label={`Apagar ${c.nome}`}>
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
