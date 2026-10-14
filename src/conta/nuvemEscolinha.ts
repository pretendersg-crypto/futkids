// Escolinha, turmas e treinadores no Firestore (fase 2 de ARQUITETURA_CONTAS.md). Carregado só
// quando usado (import dinâmico), junto com o Firebase.
//
//   escolinhas/{e}                       { nome, donos[], treinadores[], turmas{t: nome}, plano, limites }
//   escolinhas/{e}/turmas/{t}            { nome, codigo }
//   escolinhas/{e}/turmas/{t}/plano/atual { dias{AAAA-MM-DD: [{treino, video?}]}, em }
//   escolinhas/{e}/turmas/{t}/membros/{m} { apelido, familia, atleta, autorizado, codigo }
//   escolinhas/{e}/turmas/{t}/taticas/{id} puzzles e pranchetas do treinador (nuvemTatica.ts)
//      m = id do atleta (família autorizou) ou o código do convite (cadastrado pelo treinador)
//   codigosTurma/{c}                     { escolinha, turma, nomes, ativo }  (vários usos)
//   atletas/{a}                          + { escolinha, escolinhaNome, turmas[], turmasNomes{}, autorizacao }
import { getAuth, type User } from 'firebase/auth'
import { arrayRemove, arrayUnion, deleteDoc, deleteField, doc, getDoc, getDocs, onSnapshot, setDoc, Timestamp, updateDoc, collection, type Unsubscribe } from 'firebase/firestore'
import { VERSAO_TERMOS } from '../data/legal'
import { gerarCodigo } from './codigos'
import { apagarColecao, gravarUsuario, iniciar, novoId } from './nuvem'
import type { ItemDia } from '../data/calendarioGoleiros'
import { useTurmasStore, type PlanoDaTurma } from './turmasStore'

export const LIMITES_GRATIS = { treinadores: 1, turmas: 1, atletas: 20, videosMB: 1024 } as const

const DIA = 24 * 60 * 60 * 1000

export interface Turma {
  id: string
  nome: string
}

export interface DadosEscolinha {
  id: string
  nome: string
  donos: string[]
  treinadores: string[]
  turmas: Turma[]
  plano: string
  limites: { treinadores: number; turmas: number; atletas: number; videosMB?: number }
  /** Até quando o plano pago vale (ms); null = grátis */
  validoAte: number | null
  renovacaoAutomatica: boolean
  /** Atletas contados pelo servidor (todas as turmas) */
  atletas: number | null
  /** Espaço usado pelos vídeos (contado pelo servidor) */
  videosBytes: number
}

// ---------- escolinha (treinador) ----------

export async function criarEscolinha(u: User, nome: string): Promise<string> {
  const { db } = iniciar()
  const e = novoId('esc')
  await setDoc(doc(db, 'escolinhas', e), {
    nome,
    donos: [u.uid],
    treinadores: [u.uid],
    turmas: {},
    plano: 'gratis',
    limites: { ...LIMITES_GRATIS },
    // Aceite dos Termos (parte das escolinhas) por quem criou
    aceiteTermos: { versao: VERSAO_TERMOS, por: u.uid, em: Date.now() },
    criadoEm: Date.now(),
  })
  await gravarUsuario(u, { escolinha: e })
  return e
}

export async function lerEscolinha(e: string): Promise<DadosEscolinha> {
  const { db } = iniciar()
  const r = await getDoc(doc(db, 'escolinhas', e))
  const d = r.data() ?? {}
  return {
    id: e,
    nome: String(d.nome ?? ''),
    donos: (d.donos as string[] | undefined) ?? [],
    treinadores: (d.treinadores as string[] | undefined) ?? [],
    turmas: Object.entries((d.turmas as Record<string, string> | undefined) ?? {}).map(([id, nome]) => ({ id, nome })),
    plano: String(d.plano ?? 'gratis'),
    limites: (d.limites as DadosEscolinha['limites'] | undefined) ?? { ...LIMITES_GRATIS },
    validoAte: typeof d.validoAte === 'number' ? d.validoAte : null,
    renovacaoAutomatica: d.renovacaoAutomatica === true,
    atletas: typeof d.contagem?.atletas === 'number' ? d.contagem.atletas : null,
    videosBytes: typeof d.contagem?.videosBytes === 'number' ? d.contagem.videosBytes : 0,
  }
}

export async function renomearEscolinha(e: string, nome: string) {
  await updateDoc(doc(iniciar().db, 'escolinhas', e), { nome })
}

/** Código para outro treinador entrar na escolinha (7 dias, uso único) */
export async function gerarCodigoTreinador(uid: string, e: string): Promise<string> {
  const codigo = gerarCodigo()
  await setDoc(doc(iniciar().db, 'convites', codigo), {
    tipo: 'treinador',
    escolinha: e,
    criadoPor: uid,
    usadoPor: null,
    expiraEm: Timestamp.fromMillis(Date.now() + 7 * DIA - 60_000),
  })
  return codigo
}

export async function entrarNaEscolinha(u: User, codigo: string): Promise<string> {
  const { db } = iniciar()
  const c = await getDoc(doc(db, 'convites', codigo))
  if (!c.exists() || c.data().tipo !== 'treinador') throw new Error('Código não encontrado. Confira as letras.')
  if ((c.data().expiraEm as Timestamp).toMillis() < Date.now()) throw new Error('Este código venceu. Peça um novo.')
  const e = String(c.data().escolinha)
  await updateDoc(doc(db, 'convites', codigo), { usadoPor: u.uid, usadoEm: Date.now() })
  await updateDoc(doc(db, 'escolinhas', e), { treinadores: arrayUnion(u.uid), conviteEntrada: codigo })
  await gravarUsuario(u, { escolinha: e })
  return e
}

/** Sai da escolinha. Sendo o último treinador e dono, apaga a escolinha inteira */
export async function sairDaEscolinha(u: User, e: string) {
  const { db } = iniciar()
  const esc = await lerEscolinha(e)
  if (esc.treinadores.length <= 1 && esc.donos.includes(u.uid)) {
    for (const t of esc.turmas) await apagarTurma(e, t.id)
    await deleteDoc(doc(db, 'escolinhas', e))
  } else {
    await updateDoc(doc(db, 'escolinhas', e), { treinadores: arrayRemove(u.uid) })
  }
  await gravarUsuario(u, { escolinha: null })
}

// ---------- turmas ----------

export async function criarTurma(e: string, nome: string): Promise<Turma> {
  const { db } = iniciar()
  const t = novoId('tur')
  await setDoc(doc(db, 'escolinhas', e, 'turmas', t), { nome, criadoEm: Date.now() })
  await updateDoc(doc(db, 'escolinhas', e), { [`turmas.${t}`]: nome })
  return { id: t, nome }
}

export async function renomearTurma(e: string, t: string, nome: string) {
  const { db } = iniciar()
  await updateDoc(doc(db, 'escolinhas', e, 'turmas', t), { nome })
  await updateDoc(doc(db, 'escolinhas', e), { [`turmas.${t}`]: nome })
}

export async function apagarTurma(e: string, t: string) {
  const { db } = iniciar()
  const turma = await getDoc(doc(db, 'escolinhas', e, 'turmas', t))
  const codigo = turma.data()?.codigo as string | undefined
  if (codigo) await deleteDoc(doc(db, 'codigosTurma', codigo)).catch(() => undefined)
  // Vídeos (arquivos e registros) da turma e dos atletas
  const v = await import('./nuvemVideos')
  for (const video of await v.listarVideos(e, t, null).catch(() => [])) await v.apagarVideo(e, video)
  for (const ind of (await getDocs(collection(db, 'escolinhas', e, 'turmas', t, 'individuais'))).docs) {
    for (const video of await v.listarVideos(e, t, ind.id).catch(() => [])) await v.apagarVideo(e, video)
    await deleteDoc(ind.ref)
  }
  await apagarColecao('escolinhas', e, 'turmas', t, 'leitores')
  await apagarColecao('escolinhas', e, 'turmas', t, 'membros')
  await apagarColecao('escolinhas', e, 'turmas', t, 'plano')
  await deleteDoc(doc(db, 'escolinhas', e, 'turmas', t))
  await updateDoc(doc(db, 'escolinhas', e), { [`turmas.${t}`]: deleteField() })
}

/** Código da turma (vários usos): as famílias digitam para pôr o atleta na turma. Troca o anterior */
export async function gerarCodigoTurma(uid: string, esc: DadosEscolinha, t: string): Promise<string> {
  const { db } = iniciar()
  const turma = await getDoc(doc(db, 'escolinhas', esc.id, 'turmas', t))
  const antigo = turma.data()?.codigo as string | undefined
  if (antigo) await deleteDoc(doc(db, 'codigosTurma', antigo)).catch(() => undefined)
  const codigo = gerarCodigo()
  await setDoc(doc(db, 'codigosTurma', codigo), {
    escolinha: esc.id,
    turma: t,
    escolinhaNome: esc.nome,
    turmaNome: esc.turmas.find((x) => x.id === t)?.nome ?? '',
    criadoPor: uid,
    ativo: true,
    criadoEm: Date.now(),
  })
  await updateDoc(doc(db, 'escolinhas', esc.id, 'turmas', t), { codigo })
  return codigo
}

export async function codigoDaTurma(e: string, t: string): Promise<string | null> {
  const r = await getDoc(doc(iniciar().db, 'escolinhas', e, 'turmas', t))
  return (r.data()?.codigo as string | undefined) ?? null
}

// ---------- atletas da turma ----------

export interface Membro {
  id: string
  apelido: string
  autorizado: boolean
  atleta: string | null
  /** Código do convite (atleta cadastrado pelo treinador, esperando a família) */
  codigo: string | null
}

export async function listarMembros(e: string, t: string): Promise<Membro[]> {
  const r = await getDocs(collection(iniciar().db, 'escolinhas', e, 'turmas', t, 'membros'))
  return r.docs
    .map((d) => ({
      id: d.id,
      apelido: String(d.data().apelido ?? ''),
      autorizado: d.data().autorizado === true,
      atleta: (d.data().atleta as string | null | undefined) ?? null,
      codigo: d.data().autorizado === true ? null : d.id,
    }))
    .sort((a, b) => a.apelido.localeCompare(b.apelido, 'pt-BR'))
}

/** Treinador cadastra um atleta (só o apelido) e recebe o convite para a família (30 dias) */
export async function convidarAtleta(uid: string, esc: DadosEscolinha, t: string, apelido: string): Promise<string> {
  const { db } = iniciar()
  const codigo = gerarCodigo()
  await setDoc(doc(db, 'convites', codigo), {
    tipo: 'atleta',
    escolinha: esc.id,
    turma: t,
    escolinhaNome: esc.nome,
    turmaNome: esc.turmas.find((x) => x.id === t)?.nome ?? '',
    apelido,
    criadoPor: uid,
    usadoPor: null,
    expiraEm: Timestamp.fromMillis(Date.now() + 30 * DIA - 60_000),
  })
  await setDoc(doc(db, 'escolinhas', esc.id, 'turmas', t, 'membros', codigo), { apelido, familia: null, atleta: null, autorizado: false, em: Date.now() })
  return codigo
}

export async function removerMembro(e: string, t: string, m: Membro) {
  const { db } = iniciar()
  await deleteDoc(doc(db, 'escolinhas', e, 'turmas', t, 'membros', m.id))
  if (m.codigo) await deleteDoc(doc(db, 'convites', m.codigo)).catch(() => undefined)
}

// ---------- plano da turma ----------

export type DiasDaTurma = Record<string, ItemDia[]>

export async function lerPlanoTurma(e: string, t: string): Promise<DiasDaTurma> {
  const r = await getDoc(doc(iniciar().db, 'escolinhas', e, 'turmas', t, 'plano', 'atual'))
  return (r.data()?.dias as DiasDaTurma | undefined) ?? {}
}

export async function salvarPlanoTurma(e: string, t: string, dias: DiasDaTurma) {
  // Só os dias com treino (e sem campos vazios: o Firestore não aceita undefined)
  const limpos = Object.fromEntries(
    Object.entries(dias)
      .filter(([, itens]) => itens.length > 0)
      .map(([data, itens]) => [data, itens.map((i) => (i.video ? { treino: i.treino, video: i.video } : { treino: i.treino }))]),
  )
  await setDoc(doc(iniciar().db, 'escolinhas', e, 'turmas', t, 'plano', 'atual'), { dias: limpos, em: Date.now() })
}

// ---------- plano individual de um atleta (treinador) ----------

const caminhoIndividual = (e: string, t: string, a: string) => ['escolinhas', e, 'turmas', t, 'individuais', a] as const

export async function lerPlanoIndividual(e: string, t: string, a: string): Promise<DiasDaTurma> {
  const r = await getDoc(doc(iniciar().db, ...caminhoIndividual(e, t, a)))
  return (r.data()?.dias as DiasDaTurma | undefined) ?? {}
}

export async function salvarPlanoIndividual(e: string, t: string, a: string, dias: DiasDaTurma) {
  const limpos = Object.fromEntries(
    Object.entries(dias)
      .filter(([, itens]) => itens.length > 0)
      .map(([data, itens]) => [data, itens.map((i) => (i.video ? { treino: i.treino, video: i.video } : { treino: i.treino }))]),
  )
  await setDoc(doc(iniciar().db, ...caminhoIndividual(e, t, a)), { dias: limpos, em: Date.now() })
}

/** Copia o plano individual de um atleta para outros (substitui o deles) */
export async function copiarPlanoIndividual(e: string, t: string, de: string, para: string[]) {
  const dias = await lerPlanoIndividual(e, t, de)
  for (const a of para) if (a !== de) await salvarPlanoIndividual(e, t, a, dias)
}

// ---------- resumo do atleta (treinador, depois da autorização) ----------

export interface ResumoAtleta {
  apelido: string
  xp: number
  diasTreinados: string[]
  atividadesPorDia: Record<string, string[]>
  conquistas: number
}

export async function lerResumoAtleta(a: string): Promise<ResumoAtleta> {
  const { db } = iniciar()
  const ler = async (chave: string) => {
    const r = await getDoc(doc(db, 'atletas', a, 'dados', chave))
    try {
      return (JSON.parse(String(r.data()?.json ?? '{}')) as { state?: Record<string, unknown> }).state ?? {}
    } catch {
      return {}
    }
  }
  const [jogador, progresso, conquistas] = await Promise.all([ler('futkids-jogador'), ler('futkids-progresso'), ler('futkids-conquistas')])
  return {
    apelido: String(jogador.apelido ?? ''),
    xp: Number(progresso.xp ?? 0),
    diasTreinados: (progresso.diasTreinados as string[] | undefined) ?? [],
    atividadesPorDia: (progresso.atividadesPorDia as Record<string, string[]> | undefined) ?? {},
    conquistas: Object.keys((conquistas.desbloqueadas as Record<string, unknown> | undefined) ?? {}).length,
  }
}

// ---------- família: pôr o atleta numa turma / tirar ----------

export interface InfoEscolinhaDoAtleta {
  escolinha: string | null
  escolinhaNome: string | null
  turmas: Turma[]
}

export async function lerEscolinhaDoAtleta(a: string): Promise<InfoEscolinhaDoAtleta> {
  const r = await getDoc(doc(iniciar().db, 'atletas', a))
  const d = r.data() ?? {}
  const nomes = (d.turmasNomes as Record<string, string> | undefined) ?? {}
  return {
    escolinha: (d.escolinha as string | null | undefined) ?? null,
    escolinhaNome: (d.escolinhaNome as string | null | undefined) ?? null,
    turmas: ((d.turmas as string[] | undefined) ?? []).map((id) => ({ id, nome: nomes[id] ?? 'Turma' })),
  }
}

/**
 * A família põe o atleta numa turma, autorizando a escolinha a ver o treino dele. Aceita o código do
 * convite do treinador (atleta cadastrado por ele) ou o código da turma.
 */
export async function entrarNaTurma(u: User, familia: string, atleta: { id: string; apelido: string }, codigo: string): Promise<InfoEscolinhaDoAtleta> {
  const { db } = iniciar()
  let e: string
  let t: string
  let escolinhaNome: string
  let turmaNome: string
  let ehConvite = false
  const c = await getDoc(doc(db, 'convites', codigo))
  if (c.exists() && c.data().tipo === 'atleta') {
    if ((c.data().expiraEm as Timestamp).toMillis() < Date.now()) throw new Error('Este convite venceu. Peça um novo ao treinador.')
    if (c.data().usadoPor && c.data().usadoPor !== u.uid) throw new Error('Este convite já foi usado.')
    ;({ escolinha: e, turma: t, escolinhaNome, turmaNome } = c.data() as { escolinha: string; turma: string; escolinhaNome: string; turmaNome: string })
    ehConvite = true
  } else {
    const ct = await getDoc(doc(db, 'codigosTurma', codigo))
    if (!ct.exists() || ct.data().ativo !== true) throw new Error('Código não encontrado. Confira as letras.')
    ;({ escolinha: e, turma: t, escolinhaNome, turmaNome } = ct.data() as { escolinha: string; turma: string; escolinhaNome: string; turmaNome: string })
  }
  const atual = await lerEscolinhaDoAtleta(atleta.id)
  if (atual.escolinha && atual.escolinha !== e) throw new Error(`${atleta.apelido} já está na escolinha ${atual.escolinhaNome ?? ''}. Tire de lá antes de entrar em outra.`)

  if (ehConvite && !c.data()?.usadoPor) await updateDoc(doc(db, 'convites', codigo), { usadoPor: u.uid, usadoEm: Date.now() })
  await updateDoc(doc(db, 'atletas', atleta.id), {
    escolinha: e,
    escolinhaNome,
    turmas: arrayUnion(t),
    [`turmasNomes.${t}`]: turmaNome,
    autorizacao: { por: u.uid, em: Date.now() },
  })
  await setDoc(doc(db, 'escolinhas', e, 'turmas', t, 'membros', atleta.id), {
    apelido: atleta.apelido,
    familia,
    atleta: atleta.id,
    autorizado: true,
    codigo,
    em: Date.now(),
  })
  // O cadastro provisório do treinador vira o atleta da família
  if (ehConvite) await deleteDoc(doc(db, 'escolinhas', e, 'turmas', t, 'membros', codigo)).catch(() => undefined)
  return lerEscolinhaDoAtleta(atleta.id)
}

/** A família tira o atleta da escolinha: o treinador deixa de ver o treino dele na hora */
export async function sairDaEscolinhaFamilia(a: string) {
  const { db } = iniciar()
  const info = await lerEscolinhaDoAtleta(a)
  if (info.escolinha) {
    for (const t of info.turmas) await deleteDoc(doc(db, 'escolinhas', info.escolinha, 'turmas', t.id, 'membros', a)).catch(() => undefined)
  }
  await updateDoc(doc(db, 'atletas', a), { escolinha: null, escolinhaNome: null, turmas: [], turmasNomes: {}, autorizacao: null })
}

// ---------- aparelho: ouvir o plano das turmas do atleta ----------

let paradasTurmas: Unsubscribe[] = []

export function pararTurmas() {
  paradasTurmas.forEach((p) => p())
  paradasTurmas = []
}

/** Fica ouvindo as turmas do atleta e o plano de cada uma (guarda no aparelho para a agenda) */
export function ouvirTurmas(a: string) {
  pararTurmas()
  const { db } = iniciar()
  let dasTurmas: Unsubscribe[] = []
  const parar = onSnapshot(
    doc(db, 'atletas', a),
    (r) => {
      dasTurmas.forEach((p) => p())
      dasTurmas = []
      const d = r.data() ?? {}
      const e = (d.escolinha as string | null | undefined) ?? null
      const nomes = (d.turmasNomes as Record<string, string> | undefined) ?? {}
      const turmas = e ? ((d.turmas as string[] | undefined) ?? []) : []
      const loja = useTurmasStore.getState()
      if (!e || turmas.length === 0) {
        loja.definirVideos(a, [])
        loja.definirTaticas(a, [])
        return loja.definir(a, [])
      }
      const planos: Record<string, PlanoDaTurma> = {}
      const publicar = () => useTurmasStore.getState().definir(a, Object.values(planos))
      // Vídeos do treinador (da turma e só deste atleta)
      const uid = getAuth().currentUser?.uid
      if (uid) {
        void import('./nuvemVideos').then((v) => {
          const guardar = v.guardarVideos(a)
          for (const t of turmas) dasTurmas.push(v.ouvirVideos(uid, e, t, a, guardar))
        })
        // Puzzles e pranchetas do Futsal Tático feitos pelo treinador
        void import('./nuvemTatica').then((n) => {
          const guardar = n.guardarTaticas(a)
          for (const t of turmas) dasTurmas.push(n.ouvirTaticas(uid, e, t, nomes[t] ?? 'Turma', a, guardar))
        })
      }
      for (const t of turmas) {
        // Plano da turma (vale para todos) e o plano individual deste atleta, se houver
        dasTurmas.push(
          onSnapshot(
            doc(db, 'escolinhas', e, 'turmas', t, 'plano', 'atual'),
            (p) => {
              planos[t] = { turma: t, nome: nomes[t] ?? 'Turma', escolinha: String(d.escolinhaNome ?? ''), dias: (p.data()?.dias as DiasDaTurma | undefined) ?? {} }
              publicar()
            },
            () => undefined,
          ),
          onSnapshot(
            doc(db, ...caminhoIndividual(e, t, a)),
            (p) => {
              const dias = (p.data()?.dias as DiasDaTurma | undefined) ?? {}
              if (Object.keys(dias).length === 0) delete planos[`${t}:individual`]
              else planos[`${t}:individual`] = { turma: t, nome: 'Para você', escolinha: String(d.escolinhaNome ?? ''), dias, individual: true }
              publicar()
            },
            () => undefined,
          ),
        )
      }
    },
    () => undefined,
  )
  paradasTurmas = [parar, () => dasTurmas.forEach((p) => p())]
}
