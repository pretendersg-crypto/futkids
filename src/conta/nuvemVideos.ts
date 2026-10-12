// Vídeos do treinador no Cloud Storage (privados): da turma toda (ex.: táticos) ou só de um atleta
// (ex.: correção do exercício). O arquivo vai para o Storage e um registro dele para o Firestore, no
// mesmo caminho; as regras (storage.rules / firestore.rules) deixam ver só quem é da turma ou do atleta.
//   escolinhas/{e}/turmas/{t}/videos/{v}                  (+ arquivo em .../videos/{v}/{nome})
//   escolinhas/{e}/turmas/{t}/individuais/{a}/videos/{v}  (+ arquivo)
// No plano, um treino aponta para o vídeo com "fkvideo:<caminho do arquivo>" no campo do vídeo.
import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, type Unsubscribe } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { armazenamento, iniciar, novoId } from './nuvem'
import { useTurmasStore } from './turmasStore'

export type TipoVideo = 'tatico' | 'exercicio' | 'outro'

export interface VideoDoTreinador {
  id: string
  titulo: string
  tipo: TipoVideo
  /** Caminho do arquivo no Storage */
  caminho: string
  bytes: number
  em: number
  /** null = turma toda; senão o atleta */
  atleta: string | null
  turma: string
}

/** Até 200 MB por vídeo (as regras do Storage também conferem) */
export const MAX_BYTES_VIDEO = 200 * 1024 * 1024

const pastaDosDocs = (e: string, t: string, atleta: string | null) =>
  atleta ? `escolinhas/${e}/turmas/${t}/individuais/${atleta}/videos` : `escolinhas/${e}/turmas/${t}/videos`

export interface Envio {
  escolinha: string
  turma: string
  /** null = turma toda */
  atleta: string | null
  arquivo: File
  titulo: string
  tipo: TipoVideo
  uid: string
  aoProgresso: (fracao: number) => void
}

/** Sobe o vídeo (com progresso) e registra. O treinador já declarou a autorização de imagem */
export async function subirVideo(e: Envio): Promise<VideoDoTreinador> {
  if (!e.arquivo.type.startsWith('video/')) throw new Error('Escolha um arquivo de vídeo.')
  if (e.arquivo.size > MAX_BYTES_VIDEO) throw new Error('O vídeo passa de 200 MB. Grave mais curto ou em 720p.')
  const id = novoId('vid')
  const nome = e.arquivo.name.replace(/[^A-Za-z0-9._-]/g, '_').slice(-60) || 'video.mp4'
  const pasta = pastaDosDocs(e.escolinha, e.turma, e.atleta)
  const caminho = `${pasta}/${id}/${nome}`
  const tarefa = uploadBytesResumable(ref(armazenamento(), caminho), e.arquivo, { contentType: e.arquivo.type })
  await new Promise<void>((resolve, reject) => {
    tarefa.on('state_changed', (s) => e.aoProgresso(s.totalBytes ? s.bytesTransferred / s.totalBytes : 0), reject, () => resolve())
  })
  const agora = Date.now()
  const registro = {
    titulo: e.titulo,
    tipo: e.tipo,
    caminho,
    bytes: e.arquivo.size,
    contentType: e.arquivo.type,
    criadoPor: e.uid,
    em: agora,
    declaracaoImagem: { por: e.uid, em: agora },
  }
  await setDoc(doc(iniciar().db, pasta, id), registro)
  return { id, titulo: e.titulo, tipo: e.tipo, caminho, bytes: e.arquivo.size, em: agora, atleta: e.atleta, turma: e.turma }
}

function lerRegistro(id: string, d: Record<string, unknown>, turma: string, atleta: string | null): VideoDoTreinador {
  return {
    id,
    titulo: String(d.titulo ?? ''),
    tipo: (d.tipo as TipoVideo) ?? 'outro',
    caminho: String(d.caminho ?? ''),
    bytes: Number(d.bytes ?? 0),
    em: Number(d.em ?? 0),
    atleta,
    turma,
  }
}

export async function listarVideos(e: string, t: string, atleta: string | null): Promise<VideoDoTreinador[]> {
  const r = await getDocs(query(collection(iniciar().db, pastaDosDocs(e, t, atleta)), orderBy('em', 'desc')))
  return r.docs.map((d) => lerRegistro(d.id, d.data(), t, atleta))
}

export async function apagarVideo(e: string, v: VideoDoTreinador) {
  await deleteObject(ref(armazenamento(), v.caminho)).catch(() => undefined)
  await deleteDoc(doc(iniciar().db, pastaDosDocs(e, v.turma, v.atleta), v.id))
}

const urls = new Map<string, string>()
/** Endereço para tocar o vídeo (só sai para quem as regras deixam ver) */
export async function enderecoDoVideo(caminho: string): Promise<string> {
  const pronto = urls.get(caminho)
  if (pronto) return pronto
  const url = await getDownloadURL(ref(armazenamento(), caminho))
  urls.set(caminho, url)
  return url
}

// ---------- aparelho do atleta: registrar-se como leitor e ouvir os vídeos ----------

/**
 * Ouve os vídeos da turma (registrando este aparelho/responsável como leitor da turma por este
 * atleta) e os vídeos individuais do atleta. Devolve como parar.
 */
export function ouvirVideos(uid: string, e: string, t: string, a: string, aoMudar: (chave: string, lista: VideoDoTreinador[]) => void): Unsubscribe {
  const { db } = iniciar()
  const paradas: Unsubscribe[] = []
  void setDoc(doc(db, 'escolinhas', e, 'turmas', t, 'leitores', uid), { atleta: a, em: Date.now() })
    .then(() => {
      paradas.push(
        onSnapshot(
          query(collection(db, pastaDosDocs(e, t, null)), orderBy('em', 'desc')),
          (r) => aoMudar(`${t}:turma`, r.docs.map((d) => lerRegistro(d.id, d.data(), t, null))),
          () => undefined,
        ),
      )
    })
    .catch(() => undefined)
  paradas.push(
    onSnapshot(
      query(collection(db, pastaDosDocs(e, t, a)), orderBy('em', 'desc')),
      (r) => aoMudar(`${t}:individual`, r.docs.map((d) => lerRegistro(d.id, d.data(), t, a))),
      () => undefined,
    ),
  )
  return () => paradas.forEach((p) => p())
}

/** Junta os vídeos de cada turma/individual do atleta no store do aparelho */
export function guardarVideos(a: string) {
  const porChave: Record<string, VideoDoTreinador[]> = {}
  return (chave: string, lista: VideoDoTreinador[]) => {
    porChave[chave] = lista
    useTurmasStore.getState().definirVideos(
      a,
      Object.values(porChave)
        .flat()
        .sort((x, y) => y.em - x.em),
    )
  }
}
