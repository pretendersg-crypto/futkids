// Editor de puzzle do Futsal Tático (pais e treinador). Em abas:
//  🎬 Cena: título, situação, tipo, dificuldade e os jogadores na quadra (arrastar);
//  1, 2, 3…: cada pergunta, de um destes tipos:
//    - ⚽ Qual a melhor jogada? (opções com setas; uma é a certa)
//    - 📍 Onde se posicionar? (toque na quadra o lugar certo)
//    - 🔎 Encontre o erro (toque no jogador mal posicionado e onde ele deveria estar)
// Embaixo: dica, o que aprender, recado. "Testar" abre o puzzle como a criança vê (sem contar
// no rating); "Salvar" só com tudo conferido.
import { useState, type ReactNode } from 'react'
import { Quadra, type EstadoOpcao, type Marca } from '../Quadra'
import { ResolverPuzzle } from '../ResolverPuzzle'
import {
  CATEGORIAS_TATICA,
  DIFICULDADES_TATICA,
  EMOJI_ACAO,
  EMOJI_CATEGORIA,
  EMOJI_DIFICULDADE,
  NOMES_ACAO,
  NOMES_CATEGORIA,
  NOMES_DIFICULDADE,
  RAIO_POSICAO,
  tipoDoPasso,
  type Alvo,
  type Jogador,
  type Opcao,
  type Passo,
  type PassoErro,
  type PassoJogada,
  type PassoPosicao,
  type Ponto,
  type Puzzle,
  type TipoAcao,
} from '../tipos'
import { cenasDosPassos, conferirPuzzle } from '../validador'
import { ControlesJogadores } from './ControlesJogadores'
import { acabarPuzzle, nomeDoJogador, novoId, rotuloPadrao } from './novos'

interface Props {
  inicial: Puzzle
  /** Para onde vai (ex.: "⚽ Sub-9", "🏠 Família"), só para mostrar */
  destino: string
  aoSalvar: (p: Puzzle) => Promise<void> | void
  aoCancelar: () => void
}

export const CAMPO = 'min-h-10 w-full rounded-xl border-2 border-emerald-200 bg-white px-2 text-base'
const ROTULO = 'flex flex-col gap-1 text-sm font-bold'
const VERDE = '#4ade80'

const TIPOS_PERGUNTA: { tipo: 'jogada' | 'posicao' | 'erro'; nome: string }[] = [
  { tipo: 'jogada', nome: '⚽ Qual a melhor jogada?' },
  { tipo: 'posicao', nome: '📍 Onde se posicionar?' },
  { tipo: 'erro', nome: '🔎 Encontre o erro' },
]

const RAIOS: { valor: number; nome: string }[] = [
  { valor: 0.05, nome: 'Pequena (precisa acertar bem)' },
  { valor: RAIO_POSICAO, nome: 'Média' },
  { valor: 0.12, nome: 'Grande (mais fácil)' },
]

function passoNovo(tipo: 'jogada' | 'posicao' | 'erro', azuis: string[]): Passo {
  if (tipo === 'posicao') return { tipo: 'posicao', pergunta: '', jogador: azuis[1] ?? azuis[0] ?? '', certo: { x: 0.5, y: 0.5 }, raio: RAIO_POSICAO, explicacao: '' }
  if (tipo === 'erro') return { tipo: 'erro', pergunta: '', errado: '', explicacao: '' }
  return { pergunta: '', opcoes: [] }
}

/** O que o próximo toque na quadra marca */
type ModoToque = { tipo: 'alvo'; opcao: string } | { tipo: 'corrigir' } | null

export function EditorPuzzle({ inicial, destino, aoSalvar, aoCancelar }: Props) {
  const [p, setP] = useState<Puzzle>(inicial)
  /** -1 = a cena; 0, 1, 2… = as perguntas */
  const [aba, setAba] = useState(-1)
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [opcaoAberta, setOpcaoAberta] = useState<string | null>(null)
  const [modo, setModo] = useState<ModoToque>(null)
  const [testando, setTestando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState('')
  const mudar = (parte: Partial<Puzzle>) => setP((x) => ({ ...x, ...parte }))

  const cenas = cenasDosPassos(p)
  const azuis = p.jogadores.filter((j) => j.time === 'A')
  const pronto = acabarPuzzle(p)
  const problemas = conferirPuzzle(pronto)
  const numero = (id: string) => p.jogadores.find((j) => j.id === id)?.numero ?? '?'

  function mudarPasso(i: number, novo: Passo) {
    setP((x) => ({ ...x, passos: x.passos.map((q, k) => (k === i ? novo : q)) }))
  }

  function incluirPasso(tipo: 'jogada' | 'posicao' | 'erro') {
    setP((x) => ({ ...x, passos: [...x.passos, passoNovo(tipo, azuis.map((j) => j.id))] }))
    setAba(p.passos.length)
    setModo(null)
  }

  function tirarPasso(i: number) {
    if (!confirm(`Apagar a pergunta ${i + 1}?`)) return
    setP((x) => ({ ...x, passos: x.passos.filter((_, k) => k !== i) }))
    setAba(Math.max(-1, i - 1))
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

  // ---------- a quadra de cada aba ----------
  let quadra: ReactNode
  let painel: ReactNode
  if (aba === -1) {
    quadra = (
      <Quadra
        jogadores={p.jogadores}
        bola={p.bola}
        selecionado={selecionado}
        aoArrastar={(id, pos) => mudar({ jogadores: p.jogadores.map((j) => (j.id === id ? { ...j, pos } : j)) })}
        aoTocarJogador={setSelecionado}
        rotulo="Cena do puzzle: arraste os jogadores"
      />
    )
    painel = (
      <div className="flex flex-col gap-3">
        <ControlesJogadores jogadores={p.jogadores} bola={p.bola} selecionado={selecionado} aoMudar={(jogadores, bola) => mudar({ jogadores, bola: bola ?? p.bola })} aoSelecionar={setSelecionado} />
        <label className={ROTULO}>
          Título
          <input value={p.titulo} maxLength={60} onChange={(e) => mudar({ titulo: e.target.value })} placeholder="Ex.: Saída de bola contra a pressão" className={CAMPO} />
        </label>
        <label className={ROTULO}>
          A situação do jogo
          <textarea value={p.contexto} maxLength={240} rows={2} onChange={(e) => mudar({ contexto: e.target.value })} placeholder="Ex.: Placar 1 a 1, o goleiro defendeu e tem a bola." className={CAMPO} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className={ROTULO}>
            Tipo
            <select value={p.categoria} onChange={(e) => mudar({ categoria: e.target.value as Puzzle['categoria'] })} className={CAMPO}>
              {CATEGORIAS_TATICA.map((c) => (
                <option key={c} value={c}>
                  {EMOJI_CATEGORIA[c]} {NOMES_CATEGORIA[c]}
                </option>
              ))}
            </select>
          </label>
          <label className={ROTULO}>
            Dificuldade
            <select value={p.dificuldade} onChange={(e) => mudar({ dificuldade: e.target.value as Puzzle['dificuldade'] })} className={CAMPO}>
              {DIFICULDADES_TATICA.map((d) => (
                <option key={d} value={d}>
                  {EMOJI_DIFICULDADE[d]} {NOMES_DIFICULDADE[d]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-slate-600">O seu time é sempre o AZUL, atacando para a direita ➡️. Depois, monte as perguntas nas abas 1, 2…</p>
      </div>
    )
  } else {
    const passo = p.passos[aba]
    const cena = cenas[aba]
    const tipo = tipoDoPasso(passo)
    const tocarQuadra = (pos: Ponto) => {
      if (tipo === 'posicao') return mudarPasso(aba, { ...(passo as PassoPosicao), certo: pos })
      if (modo?.tipo === 'corrigir' && tipo === 'erro') {
        mudarPasso(aba, { ...(passo as PassoErro), corrigir: pos })
        return setModo(null)
      }
      if (modo?.tipo === 'alvo' && tipo === 'jogada') {
        const q = passo as PassoJogada
        mudarPasso(aba, { ...q, opcoes: q.opcoes.map((o) => (o.id === modo.opcao ? { ...o, alvo: { tipo: 'ponto', pos } } : o)) })
        setModo(null)
      }
    }

    let marcas: Marca[] = []
    let opcoesNaQuadra: Opcao[] = []
    let estados: Record<string, EstadoOpcao> = {}
    let quemDestacar: string | null = null
    let clicaveis: string[] = []
    if (tipo === 'posicao') {
      const q = passo as PassoPosicao
      marcas = [{ pos: q.certo, cor: VERDE, raio: q.raio ?? RAIO_POSICAO, rotulo: 'certo' }]
      quemDestacar = q.jogador
    } else if (tipo === 'erro') {
      const q = passo as PassoErro
      marcas = q.corrigir ? [{ pos: q.corrigir, cor: VERDE, raio: 0.04, rotulo: 'deveria estar aqui' }] : []
      quemDestacar = q.errado || null
      clicaveis = modo ? [] : cena.jogadores.filter((j) => j.time === 'A').map((j) => j.id)
    } else {
      const q = passo as PassoJogada
      const aberta = q.opcoes.find((o) => o.id === opcaoAberta) ?? q.opcoes[0]
      if (aberta) {
        quemDestacar = aberta.jogador
        opcoesNaQuadra = q.opcoes.filter((o) => o.jogador === aberta.jogador)
        estados = Object.fromEntries(opcoesNaQuadra.filter((o) => o.correta).map((o) => [o.id, 'certo' as const]))
      }
    }

    quadra = (
      <Quadra
        jogadores={cena.jogadores}
        bola={cena.bola}
        selecionado={quemDestacar}
        opcoes={opcoesNaQuadra}
        estados={estados}
        marcas={marcas}
        clicaveis={clicaveis}
        aoTocarJogador={(id) => tipo === 'erro' && mudarPasso(aba, { ...(passo as PassoErro), errado: id })}
        aoTocarQuadra={tipo === 'posicao' || modo ? tocarQuadra : undefined}
        rotulo={`Pergunta ${aba + 1}`}
      />
    )
    painel = (
      <div className="flex flex-col gap-3">
        <p className="rounded-xl bg-emerald-100 px-2 py-1 text-sm font-extrabold">{TIPOS_PERGUNTA.find((t) => t.tipo === tipo)?.nome}</p>
        <label className={ROTULO}>
          Pergunta para a criança
          <input
            value={passo.pergunta}
            maxLength={140}
            onChange={(e) => mudarPasso(aba, { ...passo, pergunta: e.target.value })}
            placeholder={tipo === 'posicao' ? 'Ex.: Toque onde o 4 deve ficar.' : tipo === 'erro' ? 'Ex.: Quem esqueceu de marcar?' : 'Ex.: Qual a melhor jogada para o 10?'}
            className={CAMPO}
          />
        </label>
        {tipo === 'posicao' && <PainelPosicao passo={passo as PassoPosicao} azuis={cena.jogadores.filter((j) => j.time === 'A')} mudar={(q) => mudarPasso(aba, q)} />}
        {tipo === 'erro' && (
          <PainelErro passo={passo as PassoErro} numero={numero} marcando={modo?.tipo === 'corrigir'} aoMarcar={() => setModo(modo ? null : { tipo: 'corrigir' })} mudar={(q) => mudarPasso(aba, q)} />
        )}
        {tipo === 'jogada' && (
          <PainelJogada
            passo={passo as PassoJogada}
            jogadores={cena.jogadores}
            aberta={opcaoAberta}
            aoAbrir={setOpcaoAberta}
            marcando={modo?.tipo === 'alvo' ? modo.opcao : null}
            aoMarcar={(id) => setModo(modo?.tipo === 'alvo' && modo.opcao === id ? null : { tipo: 'alvo', opcao: id })}
            mudar={(q) => mudarPasso(aba, q)}
          />
        )}
        <button type="button" onClick={() => tirarPasso(aba)} className="self-start text-sm font-bold text-red-700 underline">
          🗑️ Apagar esta pergunta
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex-1 text-xl font-extrabold">✏️ Puzzle {p.titulo ? `· ${p.titulo}` : ''}</h2>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-bold">Para: {destino}</span>
      </div>

      {/* Abas: cena e perguntas */}
      <div className="flex flex-wrap gap-1.5" role="tablist">
        <Aba
          ativa={aba === -1}
          aoTocar={() => {
            setAba(-1)
            setModo(null)
          }}
        >
          🎬 Cena
        </Aba>
        {p.passos.map((q, i) => (
          <Aba
            key={i}
            ativa={aba === i}
            aoTocar={() => {
              setAba(i)
              setModo(null)
              setOpcaoAberta(null)
            }}
          >
            {tipoDoPasso(q) === 'posicao' ? '📍' : tipoDoPasso(q) === 'erro' ? '🔎' : '⚽'} Pergunta {i + 1}
          </Aba>
        ))}
        {p.passos.length < 5 && (
          <span className="flex flex-wrap items-center gap-1 text-sm">
            <span className="font-bold">+ pergunta:</span>
            {TIPOS_PERGUNTA.map((t) => (
              <button key={t.tipo} type="button" onClick={() => incluirPasso(t.tipo)} className="rounded-full border-2 border-emerald-300 bg-white px-2 py-1 font-bold">
                {t.nome.split(' ')[0]} {t.tipo === 'jogada' ? 'jogada' : t.tipo === 'posicao' ? 'posição' : 'erro'}
              </button>
            ))}
          </span>
        )}
      </div>
      {aba > 0 && <p className="text-xs text-slate-600">A quadra desta pergunta começa como ficou depois da resposta certa da pergunta anterior.</p>}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-3 lg:self-start">{quadra}</div>
        <div>{painel}</div>
      </div>

      {/* Fim do puzzle */}
      <details className="rounded-2xl border-2 border-emerald-200 bg-white p-3" open>
        <summary className="cursor-pointer font-extrabold">📘 Dica, o que aprender e recado</summary>
        <div className="mt-2 grid gap-2 lg:grid-cols-2">
          <label className={ROTULO}>
            Dica (opcional)
            <input value={p.dica ?? ''} maxLength={140} onChange={(e) => mudar({ dica: e.target.value })} className={CAMPO} />
          </label>
          <label className={ROTULO}>
            O que aprender (aparece no fim)
            <textarea value={p.conceito} maxLength={400} rows={2} onChange={(e) => mudar({ conceito: e.target.value })} className={CAMPO} />
          </label>
          <label className={ROTULO}>
            🗣️ Recado / observação para os atletas (opcional)
            <textarea value={p.comentario ?? ''} maxLength={500} rows={2} onChange={(e) => mudar({ comentario: e.target.value })} placeholder="Ex.: Lembram do jogo de sábado? Foi esse lance!" className={CAMPO} />
          </label>
          <label className={ROTULO}>
            Assinatura do recado (opcional)
            <input value={p.autor ?? ''} maxLength={40} onChange={(e) => mudar({ autor: e.target.value })} placeholder="Ex.: Professor Luiz" className={CAMPO} />
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
        <p className="rounded-2xl bg-green-50 p-2 text-sm font-bold">✅ Tudo conferido. Teste antes de salvar!</p>
      )}
      {erroSalvar && <p className="font-bold text-red-700">❌ {erroSalvar}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={problemas.length > 0} onClick={() => setTestando(true)} className="min-h-12 flex-1 rounded-2xl border-4 border-emerald-300 bg-white px-4 font-extrabold disabled:opacity-40">
          🧪 Testar
        </button>
        <button type="button" disabled={problemas.length > 0 || salvando} onClick={salvar} className="min-h-12 flex-1 rounded-2xl bg-sol px-4 font-extrabold shadow disabled:opacity-40">
          {salvando ? 'Salvando…' : '💾 Salvar'}
        </button>
        <button type="button" onClick={aoCancelar} className="min-h-12 rounded-2xl border-2 border-slate-300 bg-white px-4 font-bold">
          Voltar sem salvar
        </button>
      </div>

      {testando && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-3">
          <div className="mx-auto flex max-w-xl flex-col gap-2 rounded-3xl bg-campo-claro p-3 shadow-xl">
            <button type="button" onClick={() => setTestando(false)} className="self-end rounded-full bg-white px-3 py-1 font-bold shadow">
              ✖️ Fechar o teste
            </button>
            <ResolverPuzzle puzzle={pronto} teste aoTerminar={() => undefined} aoProximo={() => setTestando(false)} textoProximo="Voltar ao editor ✏️" />
          </div>
        </div>
      )}
    </div>
  )
}

export function Aba({ ativa, aoTocar, children }: { ativa: boolean; aoTocar: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      onClick={aoTocar}
      className={`rounded-full border-2 px-3 py-1 text-sm font-extrabold ${ativa ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-emerald-200 bg-white'}`}
    >
      {children}
    </button>
  )
}

// ---------- painéis de cada tipo de pergunta ----------

function PainelPosicao({ passo, azuis, mudar }: { passo: PassoPosicao; azuis: Jogador[]; mudar: (p: PassoPosicao) => void }) {
  return (
    <>
      <label className={ROTULO}>
        Quem vai para o lugar
        <select value={passo.jogador} onChange={(e) => mudar({ ...passo, jogador: e.target.value })} className={CAMPO}>
          {azuis.map((j) => (
            <option key={j.id} value={j.id}>
              {j.goleiro ? 'Goleiro ' : ''}
              {j.numero}
            </option>
          ))}
        </select>
      </label>
      <p className="rounded-xl bg-green-50 p-2 text-sm font-bold">📍 Toque na quadra no lugar certo (o círculo verde). Toques dentro do círculo valem.</p>
      <label className={ROTULO}>
        Tamanho da área certa
        <select value={passo.raio ?? RAIO_POSICAO} onChange={(e) => mudar({ ...passo, raio: Number(e.target.value) })} className={CAMPO}>
          {RAIOS.map((r) => (
            <option key={r.valor} value={r.valor}>
              {r.nome}
            </option>
          ))}
        </select>
      </label>
      <label className={ROTULO}>
        Por que ali (aparece quando acerta)
        <textarea value={passo.explicacao} maxLength={300} rows={2} onChange={(e) => mudar({ ...passo, explicacao: e.target.value })} className={CAMPO} />
      </label>
      <label className={ROTULO}>
        O que dizer quando erra (opcional)
        <input value={passo.explicacaoErro ?? ''} maxLength={200} onChange={(e) => mudar({ ...passo, explicacaoErro: e.target.value || undefined })} className={CAMPO} />
      </label>
    </>
  )
}

function PainelErro({ passo, numero, marcando, aoMarcar, mudar }: { passo: PassoErro; numero: (id: string) => number | string; marcando: boolean; aoMarcar: () => void; mudar: (p: PassoErro) => void }) {
  return (
    <>
      <p className="rounded-xl bg-green-50 p-2 text-sm font-bold">
        {passo.errado ? `🔎 O errado é o ${numero(passo.errado)}. Toque em outro azul para trocar.` : '🔎 Toque na quadra no jogador AZUL que está mal posicionado.'}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button type="button" disabled={!passo.errado} onClick={aoMarcar} className={`min-h-10 rounded-xl border-2 px-3 font-bold ${marcando ? 'border-green-600 bg-green-100' : 'border-emerald-300 bg-white'} disabled:opacity-40`}>
          📍 {marcando ? 'Toque na quadra…' : passo.corrigir ? 'Mudar onde ele deveria estar' : 'Marcar onde ele deveria estar'}
        </button>
        {passo.corrigir && (
          <button type="button" onClick={() => mudar({ ...passo, corrigir: undefined })} className="underline">
            tirar a marca
          </button>
        )}
      </div>
      <label className={ROTULO}>
        O que está errado e como corrigir
        <textarea value={passo.explicacao} maxLength={300} rows={3} onChange={(e) => mudar({ ...passo, explicacao: e.target.value })} className={CAMPO} />
      </label>
    </>
  )
}

const ACOES: TipoAcao[] = ['passe', 'finalizacao', 'drible', 'movimentacao', 'marcacao', 'desarme']

function PainelJogada({
  passo,
  jogadores,
  aberta,
  aoAbrir,
  marcando,
  aoMarcar,
  mudar,
}: {
  passo: PassoJogada
  jogadores: Jogador[]
  aberta: string | null
  aoAbrir: (id: string | null) => void
  marcando: string | null
  aoMarcar: (id: string) => void
  mudar: (p: PassoJogada) => void
}) {
  const azuis = jogadores.filter((j) => j.time === 'A')
  const mudarOpcao = (id: string, parte: Partial<Opcao>) => mudar({ ...passo, opcoes: passo.opcoes.map((o) => (o.id === id ? { ...o, ...parte } : o)) })
  const aberto = passo.opcoes.find((o) => o.id === aberta) ?? passo.opcoes[0]

  function incluir() {
    const quem = passo.opcoes[passo.opcoes.length - 1]?.jogador ?? azuis.find((j) => !j.goleiro)?.id ?? azuis[0]?.id ?? ''
    const nova: Opcao = { id: novoId('o'), jogador: quem, acao: 'passe', alvo: { tipo: 'gol' }, rotulo: '', correta: passo.opcoes.length === 0, explicacao: '' }
    mudar({ ...passo, opcoes: [...passo.opcoes, nova] })
    aoAbrir(nova.id)
  }

  const valorAlvo = (a: Alvo) => (a.tipo === 'jogador' ? `j:${a.id}` : a.tipo)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-slate-600">Crie de 2 a 4 opções e marque qual é a certa. A criança toca no jogador e depois na seta.</p>
      {passo.opcoes.map((o, i) => {
        const aberta = aberto?.id === o.id
        return (
          <div key={o.id} className={`flex flex-col gap-2 rounded-2xl border-2 p-2 ${o.correta ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white'}`}>
            <button type="button" onClick={() => aoAbrir(o.id)} className="flex items-center gap-2 text-left font-bold">
              <span aria-hidden>{EMOJI_ACAO[o.acao]}</span>
              <span className="flex-1">
                {i + 1}. {o.rotulo || rotuloPadrao(o, jogadores)} {o.correta && '✅'}
              </span>
              <span className="text-xs">{aberta ? '▲' : '✏️'}</span>
            </button>
            {aberta && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <label className={ROTULO}>
                    Quem faz
                    <select value={o.jogador} onChange={(e) => mudarOpcao(o.id, { jogador: e.target.value })} className={CAMPO}>
                      {azuis.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.goleiro ? 'Goleiro ' : ''}
                          {j.numero}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={ROTULO}>
                    O quê
                    <select value={o.acao} onChange={(e) => mudarOpcao(o.id, { acao: e.target.value as TipoAcao })} className={CAMPO}>
                      {ACOES.map((a) => (
                        <option key={a} value={a}>
                          {EMOJI_ACAO[a]} {NOMES_ACAO[a]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className={ROTULO}>
                  Para onde
                  <select
                    value={valorAlvo(o.alvo)}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === 'gol') mudarOpcao(o.id, { alvo: { tipo: 'gol' } })
                      else if (v === 'ponto') {
                        mudarOpcao(o.id, { alvo: { tipo: 'ponto', pos: { x: 0.6, y: 0.5 } } })
                        aoMarcar(o.id)
                      } else mudarOpcao(o.id, { alvo: { tipo: 'jogador', id: v.slice(2) } })
                    }}
                    className={CAMPO}
                  >
                    <option value="gol">🥅 O gol</option>
                    <option value="ponto">📍 Um lugar da quadra</option>
                    {jogadores
                      .filter((j) => j.id !== o.jogador)
                      .map((j) => (
                        <option key={j.id} value={`j:${j.id}`}>
                          {nomeDoJogador(j)}
                        </option>
                      ))}
                  </select>
                </label>
                {o.alvo.tipo === 'ponto' && (
                  <button type="button" onClick={() => aoMarcar(o.id)} className={`min-h-10 rounded-xl border-2 px-3 text-sm font-bold ${marcando === o.id ? 'border-green-600 bg-green-100' : 'border-emerald-300 bg-white'}`}>
                    📍 {marcando === o.id ? 'Toque na quadra no lugar…' : 'Mudar o lugar na quadra'}
                  </button>
                )}
                <label className={ROTULO}>
                  Texto do botão (opcional)
                  <input value={o.rotulo} maxLength={50} onChange={(e) => mudarOpcao(o.id, { rotulo: e.target.value })} placeholder={rotuloPadrao(o, jogadores)} className={CAMPO} />
                </label>
                <label className="flex items-center gap-2 font-bold">
                  <input
                    type="radio"
                    name={`certa-${passo.opcoes[0]?.id}`}
                    checked={o.correta}
                    onChange={() => mudar({ ...passo, opcoes: passo.opcoes.map((x) => ({ ...x, correta: x.id === o.id })) })}
                    className="size-5 accent-green-600"
                  />
                  ✅ Esta é a jogada certa
                </label>
                <label className={ROTULO}>
                  {o.correta ? 'Por que é a melhor' : 'Por que não é a melhor'}
                  <textarea value={o.explicacao} maxLength={300} rows={2} onChange={(e) => mudarOpcao(o.id, { explicacao: e.target.value })} className={CAMPO} />
                </label>
                {!o.correta && (
                  <label className={ROTULO}>
                    O que aconteceria no jogo (opcional)
                    <input value={o.consequencia ?? ''} maxLength={160} onChange={(e) => mudarOpcao(o.id, { consequencia: e.target.value })} placeholder="Ex.: O 5 corta o passe e sai no contra-ataque." className={CAMPO} />
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => {
                    mudar({ ...passo, opcoes: passo.opcoes.filter((x) => x.id !== o.id) })
                    aoAbrir(null)
                  }}
                  className="self-start text-sm font-bold text-red-700 underline"
                >
                  🗑️ Tirar esta opção
                </button>
              </>
            )}
          </div>
        )
      })}
      {passo.opcoes.length < 5 && (
        <button type="button" onClick={incluir} className="min-h-11 rounded-2xl border-2 border-dashed border-emerald-400 font-extrabold">
          + Opção
        </button>
      )}
    </div>
  )
}
