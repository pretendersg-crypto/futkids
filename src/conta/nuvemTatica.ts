// Futsal Tático e circuitos com cones da turma: puzzles, pranchetas e circuitos que o treinador cria
// e que chegam ao app de cada atleta da turma. Só texto (JSON), no Firestore, então funciona no plano grátis do Firebase.
//   escolinhas/{e}/turmas/{t}/taticas/{id}  { tipo, titulo, json, em, por }
// Quem lê: os treinadores e os "leitores" da turma (aparelho/responsável registrado por um atleta
// que ainda está na turma, como nos vídeos). Ver firestore.rules.
import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, type Unsubscribe } from 'firebase/firestore'
import { iniciar } from './nuvem'
import { useTurmasStore, type TaticaGuardada } from './turmasStore'

/** O que o treinador manda para a turma: puzzle e prancheta do Futsal Tático e circuito com cones */
export type TipoDaTurma = 'puzzle' | 'prancheta' | 'circuito'
const TIPOS: TipoDaTurma[] = ['puzzle', 'prancheta', 'circuito']

export interface TaticaDaTurma {
  id: string
  tipo: TipoDaTurma
  titulo: string
  json: string
  em: number
}

/** Tamanho máximo do JSON de um puzzle/prancheta (as regras também conferem) */
export const MAX_JSON_TATICA = 100_000

const pasta = (e: string, t: string) => collection(iniciar().db, 'escolinhas', e, 'turmas', t, 'taticas')

function lerRegistro(id: string, d: Record<string, unknown>): TaticaDaTurma {
  return { id, tipo: TIPOS.includes(d.tipo as TipoDaTurma) ? (d.tipo as TipoDaTurma) : 'puzzle', titulo: String(d.titulo ?? ''), json: String(d.json ?? ''), em: Number(d.em ?? 0) }
}

/** Treinador: o que já foi criado para a turma (mais novo primeiro) */
export async function listarTaticas(e: string, t: string): Promise<TaticaDaTurma[]> {
  const r = await getDocs(query(pasta(e, t), orderBy('em', 'desc')))
  return r.docs.map((d) => lerRegistro(d.id, d.data()))
}

/** Treinador: cria ou troca um puzzle/prancheta na turma */
export async function salvarTatica(e: string, t: string, item: { id: string; tipo: TipoDaTurma; titulo: string; dados: unknown }, uid: string) {
  const json = JSON.stringify(item.dados)
  if (json.length > MAX_JSON_TATICA) throw new Error('Ficou grande demais. Tire alguns quadros ou perguntas.')
  await setDoc(doc(pasta(e, t), item.id), { tipo: item.tipo, titulo: item.titulo.slice(0, 80), json, em: Date.now(), por: uid })
}

export async function apagarTatica(e: string, t: string, id: string) {
  await deleteDoc(doc(pasta(e, t), id))
}

// ---------- aparelho do atleta ----------

/**
 * Ouve os puzzles/pranchetas da turma (registrando este aparelho como leitor da turma por este
 * atleta). Devolve como parar.
 */
export function ouvirTaticas(uid: string, e: string, t: string, turmaNome: string, a: string, aoMudar: (turma: string, lista: TaticaGuardada[]) => void): Unsubscribe {
  const { db } = iniciar()
  let parar: Unsubscribe | null = null
  let parado = false
  void setDoc(doc(db, 'escolinhas', e, 'turmas', t, 'leitores', uid), { atleta: a, em: Date.now() })
    .then(() => {
      if (parado) return
      parar = onSnapshot(
        query(pasta(e, t), orderBy('em', 'desc')),
        (r) => aoMudar(t, r.docs.map((d) => ({ ...lerRegistro(d.id, d.data()), turma: t, turmaNome }))),
        () => undefined,
      )
    })
    .catch(() => undefined)
  return () => {
    parado = true
    parar?.()
  }
}

/** Junta o que vem de cada turma e guarda no aparelho do atleta */
export function guardarTaticas(a: string) {
  const porTurma: Record<string, TaticaGuardada[]> = {}
  return (turma: string, lista: TaticaGuardada[]) => {
    porTurma[turma] = lista
    useTurmasStore.getState().definirTaticas(
      a,
      Object.values(porTurma)
        .flat()
        .sort((x, y) => y.em - x.em),
    )
  }
}
