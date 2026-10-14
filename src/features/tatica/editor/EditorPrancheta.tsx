// Editor de prancheta (lance explicado), para pais e treinador. Cada quadro é um momento do lance:
// arraste os jogadores para onde eles estão naquele momento, diga com quem está a bola, desenhe
// setas (passe, corrida, condução, chute) e escreva o que acontece. No quadro 1 também dá para
// pôr e tirar jogadores. "Ver como o atleta" mostra a prancheta animada.
import { useState } from 'react'
import { conferirPrancheta, jogadoresNoQuadro } from '../pranchetas'
import { Quadra, type Marca } from '../Quadra'
import { CATEGORIAS_TATICA, EMOJI_CATEGORIA, NOMES_CATEGORIA, NOMES_SETA, type Jogador, type Ponto, type Prancheta, type QuadroPrancheta, type TipoSeta } from '../tipos'
import { VerPrancheta } from '../VerPrancheta'
import { ControlesJogadores } from './ControlesJogadores'
import { Aba, CAMPO } from './EditorPuzzle'
import { nomeDoJogador, semVazios } from './novos'

interface Props {
  inicial: Prancheta
  destino: string
  aoSalvar: (p: Prancheta) => Promise<void> | void
  aoCancelar: () => void
}

const ROTULO = 'flex flex-col gap-1 text-sm font-bold'
const TIPOS_SETA: TipoSeta[] = ['passe', 'corrida', 'conducao', 'chute']

export function EditorPrancheta({ inicial, destino, aoSalvar, aoCancelar }: Props) {
  const [pr, setPr] = useState<Prancheta>(inicial)
  const [i, setI] = useState(0)
  const [selecionado, setSelecionado] = useState<string | null>(null)
  /** Desenhando uma seta: o tipo e, depois do 1º toque, de onde ela sai */
  const [seta, setSeta] = useState<{ tipo: TipoSeta; de: Ponto | null } | null>(null)
  const [vendo, setVendo] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState('')

  const quadro = pr.quadros[i]
  const jogadores = jogadoresNoQuadro(pr, i)
  const pronto = semVazios({ ...pr, titulo: pr.titulo.trim(), descricao: pr.descricao.trim(), comentario: pr.comentario?.trim() || undefined, autor: pr.autor?.trim() || undefined })
  const problemas = conferirPrancheta(pronto)

  const mudar = (parte: Partial<Prancheta>) => setPr((x) => ({ ...x, ...parte }))
  const mudarQuadro = (parte: Partial<QuadroPrancheta>) => setPr((x) => ({ ...x, quadros: x.quadros.map((q, k) => (k === i ? { ...q, ...parte } : q)) }))

  function arrastar(id: string, pos: Ponto) {
    // No 1º quadro muda o lugar de começo; nos outros, o lugar naquele momento
    if (i === 0) mudar({ jogadores: pr.jogadores.map((j) => (j.id === id ? { ...j, pos } : j)) })
    else mudarQuadro({ posicoes: { ...quadro.posicoes, [id]: pos } })
  }

  function tocarPonto(pos: Ponto) {
    if (!seta) return
    if (!seta.de) return setSeta({ ...seta, de: pos })
    mudarQuadro({ setas: [...quadro.setas, { tipo: seta.tipo, de: seta.de, para: pos }] })
    setSeta(null)
  }

  function tocarJogador(id: string) {
    const j = jogadores.find((x) => x.id === id)
    if (seta && j) return tocarPonto(j.pos)
    setSelecionado(id)
  }

  function novoQuadro() {
    const q: QuadroPrancheta = { texto: '', posicoes: {}, bola: quadro.bola === 'gol' ? null : quadro.bola, setas: [] }
    setPr((x) => ({ ...x, quadros: [...x.quadros.slice(0, i + 1), q, ...x.quadros.slice(i + 1)] }))
    setI(i + 1)
    setSeta(null)
  }

  function tirarQuadro() {
    if (pr.quadros.length <= 1 || !confirm(`Apagar o quadro ${i + 1}?`)) return
    setPr((x) => ({ ...x, quadros: x.quadros.filter((_, k) => k !== i) }))
    setI(Math.max(0, i - 1))
  }

  /** Pôr/tirar jogadores (só no quadro 1): tirar também apaga o jogador dos outros quadros */
  function mudarJogadores(novos: Jogador[], bola: string | null) {
    const ids = new Set(novos.map((j) => j.id))
    setPr((x) => ({
      ...x,
      jogadores: novos,
      quadros: x.quadros.map((q, k) => ({
        ...q,
        bola: k === 0 ? bola : q.bola && q.bola !== 'gol' && !ids.has(q.bola) ? null : q.bola,
        posicoes: Object.fromEntries(Object.entries(q.posicoes).filter(([id]) => ids.has(id))),
      })),
    }))
  }

  async function salvar() {
    if (problemas.length) return
    setSalvando(true)
    setErroSalvar('')
    try {
      await aoSalvar(pronto)
    } catch (e) {
      setErroSalvar(e instanceof Error ? e.message : 'Não deu para salvar. Confira a internet e tente de novo.')
      setSalvando(false)
    }
  }

  const marcas: Marca[] = seta?.de ? [{ pos: seta.de, cor: '#fde047', rotulo: 'início' }] : []

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex-1 text-xl font-extrabold">✏️ Prancheta {pr.titulo ? `· ${pr.titulo}` : ''}</h2>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-bold">Para: {destino}</span>
      </div>

      <div className="grid gap-2 lg:grid-cols-[2fr_1fr]">
        <label className={ROTULO}>
          Título
          <input value={pr.titulo} maxLength={60} onChange={(e) => mudar({ titulo: e.target.value })} placeholder="Ex.: Nossa saída de bola" className={CAMPO} />
        </label>
        <label className={ROTULO}>
          Tipo
          <select value={pr.categoria} onChange={(e) => mudar({ categoria: e.target.value as Prancheta['categoria'] })} className={CAMPO}>
            {CATEGORIAS_TATICA.map((c) => (
              <option key={c} value={c}>
                {EMOJI_CATEGORIA[c]} {NOMES_CATEGORIA[c]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className={ROTULO}>
        Frase de abertura
        <input value={pr.descricao} maxLength={140} onChange={(e) => mudar({ descricao: e.target.value })} placeholder="Ex.: Como saímos jogando quando o adversário pressiona." className={CAMPO} />
      </label>

      {/* Quadros */}
      <div className="flex flex-wrap items-center gap-1.5" role="tablist">
        {pr.quadros.map((_, k) => (
          <Aba
            key={k}
            ativa={i === k}
            aoTocar={() => {
              setI(k)
              setSeta(null)
              setSelecionado(null)
            }}
          >
            Quadro {k + 1}
          </Aba>
        ))}
        {pr.quadros.length < 10 && (
          <button type="button" onClick={novoQuadro} className="rounded-full border-2 border-dashed border-emerald-400 px-3 py-1 text-sm font-extrabold">
            + Quadro depois deste
          </button>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-2 lg:sticky lg:top-3 lg:self-start">
          <Quadra
            jogadores={jogadores}
            bola={quadro.bola}
            setas={quadro.setas}
            marcas={marcas}
            selecionado={selecionado}
            aoArrastar={seta ? undefined : arrastar}
            aoTocarJogador={tocarJogador}
            clicaveis={seta ? jogadores.map((j) => j.id) : []}
            aoTocarQuadra={seta ? tocarPonto : undefined}
            rotulo={`Quadro ${i + 1}: arraste os jogadores`}
          />
          {i === 0 ? (
            <ControlesJogadores
              jogadores={pr.jogadores}
              bola={quadro.bola}
              selecionado={selecionado}
              aoMudar={mudarJogadores}
              aoSelecionar={setSelecionado}
              semBola
            />
          ) : (
            <p className="text-xs text-slate-600">Arraste os jogadores para onde eles estão neste momento. Para pôr ou tirar jogadores, volte ao quadro 1.</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label className={ROTULO}>
            O que acontece neste quadro
            <textarea value={quadro.texto} maxLength={300} rows={3} onChange={(e) => mudarQuadro({ texto: e.target.value })} placeholder="Ex.: O fixo abre o jogo para o ala." className={CAMPO} />
          </label>
          <label className={ROTULO}>
            ⚽ Com quem está a bola
            <select value={quadro.bola ?? ''} onChange={(e) => mudarQuadro({ bola: e.target.value || null })} className={CAMPO}>
              <option value="">Sem bola</option>
              <option value="gol">Dentro do gol (gol!)</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {nomeDoJogador(j)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-2 rounded-2xl border-2 border-emerald-200 bg-white p-2">
            <p className="text-sm font-extrabold">Setas deste quadro</p>
            <div className="flex flex-wrap gap-1.5">
              {TIPOS_SETA.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSeta(seta?.tipo === t ? null : { tipo: t, de: null })}
                  className={`min-h-10 rounded-xl border-2 px-2 text-sm font-bold ${seta?.tipo === t ? 'border-emerald-600 bg-emerald-100' : 'border-emerald-200 bg-white'}`}
                >
                  {NOMES_SETA[t]}
                </button>
              ))}
            </div>
            {seta && <p className="rounded-xl bg-yellow-100 p-2 text-sm font-bold">{seta.de ? '👆 Agora toque onde a seta termina.' : '👆 Toque onde a seta começa (num jogador ou na quadra).'}</p>}
            {quadro.setas.length > 0 && (
              <ul className="flex flex-col gap-1 text-sm">
                {quadro.setas.map((s, k) => (
                  <li key={k} className="flex items-center gap-2">
                    <span className="flex-1">
                      {k + 1}. {NOMES_SETA[s.tipo]}
                    </span>
                    <button type="button" onClick={() => mudarQuadro({ setas: quadro.setas.filter((_, m) => m !== k) })} className="text-red-700" aria-label={`Tirar a seta ${k + 1}`}>
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {pr.quadros.length > 1 && (
            <button type="button" onClick={tirarQuadro} className="self-start text-sm font-bold text-red-700 underline">
              🗑️ Apagar este quadro
            </button>
          )}
        </div>
      </div>

      <details className="rounded-2xl border-2 border-emerald-200 bg-white p-3">
        <summary className="cursor-pointer font-extrabold">🗣️ Recado no fim (opcional)</summary>
        <div className="mt-2 grid gap-2 lg:grid-cols-2">
          <label className={ROTULO}>
            Recado / observação para os atletas
            <textarea value={pr.comentario ?? ''} maxLength={500} rows={2} onChange={(e) => mudar({ comentario: e.target.value })} className={CAMPO} />
          </label>
          <label className={ROTULO}>
            Assinatura
            <input value={pr.autor ?? ''} maxLength={40} onChange={(e) => mudar({ autor: e.target.value })} placeholder="Ex.: Professor Luiz" className={CAMPO} />
          </label>
        </div>
      </details>

      {problemas.length > 0 ? (
        <div className="rounded-2xl bg-amber-50 p-3 text-sm">
          <p className="font-extrabold">Falta arrumar para salvar:</p>
          <ul className="list-disc pl-5">
            {problemas.slice(0, 6).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-2xl bg-green-50 p-2 text-sm font-bold">✅ Tudo conferido.</p>
      )}
      {erroSalvar && <p className="font-bold text-red-700">❌ {erroSalvar}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={problemas.length > 0} onClick={() => setVendo(true)} className="min-h-12 flex-1 rounded-2xl border-4 border-emerald-300 bg-white px-4 font-extrabold disabled:opacity-40">
          👀 Ver como o atleta
        </button>
        <button type="button" disabled={problemas.length > 0 || salvando} onClick={salvar} className="min-h-12 flex-1 rounded-2xl bg-sol px-4 font-extrabold shadow disabled:opacity-40">
          {salvando ? 'Salvando…' : '💾 Salvar'}
        </button>
        <button type="button" onClick={aoCancelar} className="min-h-12 rounded-2xl border-2 border-slate-300 bg-white px-4 font-bold">
          Voltar sem salvar
        </button>
      </div>

      {vendo && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-3">
          <div className="mx-auto flex max-w-xl flex-col gap-2 rounded-3xl bg-campo-claro p-3 shadow-xl">
            <button type="button" onClick={() => setVendo(false)} className="self-end rounded-full bg-white px-3 py-1 font-bold shadow">
              ✖️ Fechar
            </button>
            <h3 className="text-2xl font-extrabold">{pronto.titulo}</h3>
            {pronto.descricao && <p>{pronto.descricao}</p>}
            <VerPrancheta prancheta={pronto} />
          </div>
        </div>
      )}
    </div>
  )
}
