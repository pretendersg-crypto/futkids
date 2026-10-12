// Tudo que fala com o Firebase (login com Google e Firestore). Este arquivo é carregado só quando a
// conta da família é usada (import dinâmico), então o app da criança sem conta não baixa o Firebase.
//
// Na nuvem (só a própria família lê e grava, ver firestore.rules):
//   familias/{uid}                         { aceiteEm }            aceite do aviso de privacidade
//   familias/{uid}/dados/{chave}           { json, em }            dados da família (treinos, gestos, PIN...)
//   familias/{uid}/filhos/{id}             { apelido, criadoEm }   cada filho (só o apelido)
//   familias/{uid}/filhos/{id}/dados/{chave} { json, em }          dados do filho (plano, progresso...)
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { deleteUser, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type Auth, type User } from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, setDoc, type Firestore, type Unsubscribe } from 'firebase/firestore'
import { CHAVES_FAMILIA, CHAVES_FILHO, type ChaveSincronizada } from './chaves'
import { useContaStore, type Filho } from './contaStore'
import { decidir, type MetaChave, type Remoto } from './decidir'
import { FIREBASE_CONFIG } from './firebaseConfig'
import { recarregarStore } from './registro'

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

function iniciar() {
  if (!FIREBASE_CONFIG) throw new Error('A conta da família ainda não foi configurada (FIREBASE.md).')
  if (!app) {
    app = initializeApp(FIREBASE_CONFIG)
    auth = getAuth(app)
    db = getFirestore(app)
  }
  return { auth: auth!, db: db! }
}

/** Espera o Firebase dizer quem está logado (ele lembra o login sozinho) */
export function usuarioAtual(): Promise<User | null> {
  const { auth } = iniciar()
  return new Promise((resolve) => {
    const parar = onAuthStateChanged(auth, (u) => {
      parar()
      resolve(u)
    })
  })
}

/** Abre a janela do Google. Se o navegador bloquear a janela, vai para a página do Google e volta */
export async function entrarComGoogle(): Promise<User | null> {
  const { auth } = iniciar()
  const provedor = new GoogleAuthProvider()
  provedor.setCustomParameters({ prompt: 'select_account' })
  try {
    const r = await signInWithPopup(auth, provedor)
    return r.user
  } catch (erro) {
    const codigo = (erro as { code?: string }).code
    if (codigo === 'auth/popup-blocked' || codigo === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provedor)
      return null
    }
    if (codigo === 'auth/popup-closed-by-user' || codigo === 'auth/cancelled-popup-request') return null
    throw erro
  }
}

export async function sair() {
  pararSincronia()
  const { auth } = iniciar()
  await signOut(auth)
}

// ---------- família e filhos ----------

export async function registrarAceite(uid: string) {
  const { db } = iniciar()
  await setDoc(doc(db, 'familias', uid), { aceiteEm: Date.now() }, { merge: true })
}

export async function listarFilhos(uid: string): Promise<Filho[]> {
  const { db } = iniciar()
  const r = await getDocs(collection(db, 'familias', uid, 'filhos'))
  return r.docs
    .map((d) => ({ id: d.id, apelido: String(d.data().apelido ?? ''), criadoEm: Number(d.data().criadoEm ?? 0) }))
    .sort((a, b) => a.criadoEm - b.criadoEm)
    .map(({ id, apelido }) => ({ id, apelido }))
}

/** Cria um filho só com o apelido. "dados" = dados iniciais dele (ex.: o jogador já montado) */
export async function criarFilho(uid: string, apelido: string, dados: Partial<Record<ChaveSincronizada, string>> = {}): Promise<Filho> {
  const { db } = iniciar()
  const id = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  await setDoc(doc(db, 'familias', uid, 'filhos', id), { apelido, criadoEm: Date.now() })
  for (const [chave, json] of Object.entries(dados)) {
    if (json) await setDoc(doc(db, 'familias', uid, 'filhos', id, 'dados', chave), { json, em: Date.now() })
  }
  return { id, apelido }
}

export async function renomearFilho(uid: string, id: string, apelido: string) {
  const { db } = iniciar()
  await setDoc(doc(db, 'familias', uid, 'filhos', id), { apelido }, { merge: true })
}

async function apagarColecao(db: Firestore, ...caminho: [string, ...string[]]) {
  const r = await getDocs(collection(db, ...caminho))
  await Promise.all(r.docs.map((d) => deleteDoc(d.ref)))
}

export async function apagarFilho(uid: string, id: string) {
  const { db } = iniciar()
  await apagarColecao(db, 'familias', uid, 'filhos', id, 'dados')
  await deleteDoc(doc(db, 'familias', uid, 'filhos', id))
}

/** Apaga TUDO da família na nuvem e a conta (login) do Firebase */
export async function apagarConta(uid: string) {
  pararSincronia()
  const { db, auth } = iniciar()
  for (const filho of await listarFilhos(uid)) await apagarFilho(uid, filho.id)
  await apagarColecao(db, 'familias', uid, 'dados')
  await deleteDoc(doc(db, 'familias', uid))
  if (auth.currentUser) await deleteUser(auth.currentUser)
}

/** A família já tem dados na nuvem? (para saber, no 1º login de um aparelho, quem vale) */
export async function familiaTemDados(uid: string): Promise<boolean> {
  const { db } = iniciar()
  return !(await getDocs(collection(db, 'familias', uid, 'dados'))).empty
}

// ---------- sincronia ----------

const CHAVE_META = 'futkids-sincronia'
/** De quanto em quanto tempo olha se algo mudou no aparelho */
const INTERVALO_MS = 4000

function caminhoDe(uid: string, filho: string, chave: ChaveSincronizada): string[] {
  return (CHAVES_FAMILIA as readonly string[]).includes(chave) ? ['familias', uid, 'dados', chave] : ['familias', uid, 'filhos', filho, 'dados', chave]
}

function lerMetas(): Record<string, MetaChave> {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_META) ?? '{}') as Record<string, MetaChave>
  } catch {
    return {}
  }
}

function gravarMetas(metas: Record<string, MetaChave>) {
  try {
    localStorage.setItem(CHAVE_META, JSON.stringify(metas))
  } catch {
    // sem espaço: na próxima vez compara de novo
  }
}

let paradas: Unsubscribe[] = []
let relogio: ReturnType<typeof setInterval> | null = null
let ultimosVistos: Record<string, string | null> = {}

export function pararSincronia() {
  paradas.forEach((p) => p())
  paradas = []
  if (relogio) clearInterval(relogio)
  relogio = null
  window.removeEventListener('visibilitychange', aoEsconder)
}

let aoEsconder: () => void = () => {}

/**
 * Liga a sincronia da família e do filho ativo: aplica o que mudou dos dois lados agora, fica ouvindo
 * a nuvem (o plano mudou no celular do pai → atualiza aqui na hora) e envia o que mudar no aparelho.
 */
export async function iniciarSincronia(uid: string, filho: string) {
  pararSincronia()
  const { db } = iniciar()
  const conta = useContaStore.getState()
  conta.definirEstado(navigator.onLine ? 'sincronizando' : 'sem-internet')
  const chaves: ChaveSincronizada[] = [...CHAVES_FAMILIA, ...CHAVES_FILHO]
  ultimosVistos = {}

  async function resolver(chave: ChaveSincronizada, remoto: Remoto | null) {
    const caminho = caminhoDe(uid, filho, chave).join('/')
    const metas = lerMetas()
    const meta = metas[caminho] ?? {}
    const local = localStorage.getItem(chave)
    const acao = decidir(local, meta, remoto)
    if (acao === 'baixar' && remoto) {
      localStorage.setItem(chave, remoto.json)
      ultimosVistos[chave] = remoto.json
      metas[caminho] = { base: remoto.json, baseEm: remoto.em }
      gravarMetas(metas)
      await recarregarStore(chave)
    } else if (acao === 'enviar' && local) {
      const em = Date.now()
      await setDoc(doc(db, caminho), { json: local, em })
      metas[caminho] = { base: local, baseEm: em }
      gravarMetas(metas)
    }
  }

  // Olha o aparelho: o que mudou desde a última olhada ganha a hora da mudança e é enviado
  async function olharAparelho() {
    if (!navigator.onLine) return useContaStore.getState().definirEstado('sem-internet')
    const metas = lerMetas()
    for (const chave of chaves) {
      const local = localStorage.getItem(chave)
      if (local === ultimosVistos[chave]) continue
      ultimosVistos[chave] = local
      const caminho = caminhoDe(uid, filho, chave).join('/')
      if (local !== (metas[caminho]?.base ?? null)) {
        metas[caminho] = { ...metas[caminho], alteradoEm: Date.now() }
        gravarMetas(metas)
        try {
          const r = await getDoc(doc(db, caminho))
          await resolver(chave, r.exists() ? (r.data() as Remoto) : null)
        } catch (erro) {
          useContaStore.getState().definirEstado('erro', (erro as Error).message)
          return
        }
      }
    }
    useContaStore.getState().marcarSincronizado()
  }

  try {
    // 1) Agora: compara cada dado dos dois lados
    for (const chave of chaves) {
      const r = await getDoc(doc(db, caminhoDe(uid, filho, chave).join('/')))
      await resolver(chave, r.exists() ? (r.data() as Remoto) : null)
      ultimosVistos[chave] = localStorage.getItem(chave)
    }
    useContaStore.getState().marcarSincronizado()
  } catch (erro) {
    useContaStore.getState().definirEstado(navigator.onLine ? 'erro' : 'sem-internet', (erro as Error).message)
  }

  // 2) Fica ouvindo a nuvem
  for (const chave of chaves) {
    paradas.push(
      onSnapshot(
        doc(db, caminhoDe(uid, filho, chave).join('/')),
        (r) => {
          if (r.metadata.hasPendingWrites || !r.exists()) return
          void resolver(chave, r.data() as Remoto).then(() => {
            ultimosVistos[chave] = localStorage.getItem(chave)
          })
        },
        (erro) => useContaStore.getState().definirEstado('erro', erro.message),
      ),
    )
  }

  // 3) E olha o aparelho de tempos em tempos (e ao sair do app)
  relogio = setInterval(() => void olharAparelho(), INTERVALO_MS)
  aoEsconder = () => {
    if (document.visibilityState === 'hidden') void olharAparelho()
  }
  window.addEventListener('visibilitychange', aoEsconder)
}

/**
 * Baixa da nuvem os dados da família e de um filho direto para o aparelho (antes de recarregar a
 * página ao trocar de filho), para o app já abrir com os dados dele.
 */
export async function baixarPerfil(uid: string, filho: string) {
  const { db } = iniciar()
  const metas = lerMetas()
  for (const chave of [...CHAVES_FAMILIA, ...CHAVES_FILHO] as ChaveSincronizada[]) {
    const caminho = caminhoDe(uid, filho, chave).join('/')
    const r = await getDoc(doc(db, caminho))
    if (!r.exists()) continue
    const remoto = r.data() as Remoto
    if (decidir(localStorage.getItem(chave), metas[caminho] ?? {}, remoto) !== 'baixar') continue
    localStorage.setItem(chave, remoto.json)
    metas[caminho] = { base: remoto.json, baseEm: remoto.em }
  }
  gravarMetas(metas)
}

/** Envia agora o que estiver pendente (antes de trocar de filho ou sair) */
export async function enviarPendentes(uid: string, filho: string) {
  const { db } = iniciar()
  const metas = lerMetas()
  for (const chave of [...CHAVES_FAMILIA, ...CHAVES_FILHO] as ChaveSincronizada[]) {
    const caminho = caminhoDe(uid, filho, chave).join('/')
    const local = localStorage.getItem(chave)
    if (local && local !== metas[caminho]?.base) {
      const em = Date.now()
      await setDoc(doc(db, caminho), { json: local, em })
      metas[caminho] = { base: local, baseEm: em }
    }
  }
  gravarMetas(metas)
}

/** Esquece as comparações guardadas (depois de sair da conta) */
export function esquecerSincronia() {
  try {
    localStorage.removeItem(CHAVE_META)
  } catch {
    // nada
  }
}
