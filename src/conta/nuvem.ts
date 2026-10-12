// Tudo que fala com o Firebase (login e Firestore). Carregado só quando a conta é usada (import
// dinâmico): o app da criança sem conta não baixa o Firebase. Desenho em ARQUITETURA_CONTAS.md.
//
//   usuarios/{uid}                    { email, familia, aceite }
//   familias/{f}                      { responsaveis[], atletas{id: apelido}, plano }
//   familias/{f}/dados/{chave}        { json, em }   biblioteca da família (treinos, gestos, PIN...)
//   familias/{f}/aparelhos/{dev}      aparelho de criança ligado (lê a biblioteca)
//   atletas/{a}                       { apelido, familia, criadoPor, turmas[] }
//   atletas/{a}/dados/{chave}         { json, em }   jogador, progresso, plano de casa...
//   atletas/{a}/aparelhos/{dev}       aparelho de criança ligado a este atleta
//   convites/{código}                 { tipo, familia, atleta?, expiraEm, usadoPor }
import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  deleteUser,
  getAuth,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInAnonymously,
  signInWithEmailLink,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import {
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'
import { CHAVES_FAMILIA, CHAVES_FILHO, type ChaveSincronizada } from './chaves'
import { useContaStore, type Atleta } from './contaStore'
import { decidir, type MetaChave, type Remoto } from './decidir'
import { FIREBASE_CONFIG } from './firebaseConfig'
import { gerarCodigo, VERSAO_TERMOS } from './codigos'
import { recarregarStore } from './registro'

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

export function iniciar() {
  if (!FIREBASE_CONFIG) throw new Error('A conta ainda não foi configurada (FIREBASE.md).')
  if (!app) {
    app = initializeApp(FIREBASE_CONFIG)
    auth = getAuth(app)
    auth.languageCode = 'pt'
    db = getFirestore(app)
  }
  return { auth: auth!, db: db! }
}

// ---------- login ----------

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
    return (await signInWithPopup(auth, provedor)).user
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

const CHAVE_EMAIL = 'futkids-email-para-entrar'

/** Manda o link de entrada para o e-mail (sem senha). Ele volta para /entrar */
export async function enviarLinkPorEmail(email: string) {
  const { auth } = iniciar()
  const url = new URL(`${import.meta.env.BASE_URL}entrar`, location.origin).href
  await sendSignInLinkToEmail(auth, email, { url, handleCodeInApp: true })
  localStorage.setItem(CHAVE_EMAIL, email)
}

export function ehLinkDeEntrada(url: string): boolean {
  return isSignInWithEmailLink(iniciar().auth, url)
}

/** Termina a entrada pelo link do e-mail. Sem o e-mail guardado (abriu em outro aparelho), pede de novo */
export async function concluirLinkDeEmail(url: string, emailDigitado?: string): Promise<User> {
  const { auth } = iniciar()
  const email = emailDigitado ?? localStorage.getItem(CHAVE_EMAIL)
  if (!email) throw new Error('Digite o e-mail para o qual o link foi enviado.')
  const r = await signInWithEmailLink(auth, email, url)
  localStorage.removeItem(CHAVE_EMAIL)
  return r.user
}

export async function sair() {
  pararSincronia()
  await signOut(iniciar().auth)
}

// ---------- usuário e família ----------

export interface DadosUsuario {
  familia: string | null
  escolinha: string | null
}

export async function lerUsuario(uid: string): Promise<DadosUsuario> {
  const { db } = iniciar()
  const r = await getDoc(doc(db, 'usuarios', uid))
  return { familia: (r.data()?.familia as string | undefined) ?? null, escolinha: (r.data()?.escolinha as string | undefined) ?? null }
}

export async function gravarUsuario(u: User, campos: { familia?: string; escolinha?: string | null }) {
  const { db } = iniciar()
  await setDoc(doc(db, 'usuarios', u.uid), { email: u.email ?? null, ...campos, aceite: { versao: VERSAO_TERMOS, em: Date.now() } }, { merge: true })
}

export const novoId = (prefixo: string) => `${prefixo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

/** Cria a família do responsável (plano grátis) */
export async function criarFamilia(u: User): Promise<string> {
  const { db } = iniciar()
  const f = novoId('fam')
  await setDoc(doc(db, 'familias', f), { responsaveis: [u.uid], atletas: {}, plano: 'gratis', criadoEm: Date.now() })
  await gravarUsuario(u, { familia: f })
  return f
}

/** 2º responsável entra na família pelo código que o 1º gerou */
export async function entrarNaFamilia(u: User, codigo: string): Promise<string> {
  const { db } = iniciar()
  const c = await getDoc(doc(db, 'convites', codigo))
  if (!c.exists() || c.data().tipo !== 'responsavel') throw new Error('Código não encontrado. Confira as letras.')
  if ((c.data().expiraEm as Timestamp).toMillis() < Date.now()) throw new Error('Este código venceu. Peça um novo.')
  const f = String(c.data().familia)
  await updateDoc(doc(db, 'convites', codigo), { usadoPor: u.uid, usadoEm: Date.now() })
  // arrayUnion: o servidor acrescenta o novo à lista (ele ainda não pode ler a família)
  await updateDoc(doc(db, 'familias', f), { responsaveis: arrayUnion(u.uid), conviteEntrada: codigo })
  await gravarUsuario(u, { familia: f })
  return f
}

export interface DadosFamilia {
  responsaveis: string[]
  atletas: Atleta[]
}

export async function lerFamilia(f: string): Promise<DadosFamilia> {
  const { db } = iniciar()
  const r = await getDoc(doc(db, 'familias', f))
  const dados = r.data() ?? {}
  const atletas = Object.entries((dados.atletas as Record<string, string> | undefined) ?? {}).map(([id, apelido]) => ({ id, apelido }))
  return { responsaveis: (dados.responsaveis as string[] | undefined) ?? [], atletas }
}

/** Cria um atleta da família só com o apelido. "dados" = dados iniciais dele (ex.: o jogador) */
export async function criarAtleta(uid: string, f: string, apelido: string, dados: Partial<Record<ChaveSincronizada, string>> = {}): Promise<Atleta> {
  const { db } = iniciar()
  const id = novoId('atl')
  await setDoc(doc(db, 'atletas', id), { apelido, familia: f, criadoPor: uid, turmas: [], criadoEm: Date.now() })
  await updateDoc(doc(db, 'familias', f), { [`atletas.${id}`]: apelido })
  for (const [chave, json] of Object.entries(dados)) {
    if (json) await setDoc(doc(db, 'atletas', id, 'dados', chave), { json, em: Date.now() })
  }
  return { id, apelido }
}

export async function renomearAtleta(f: string, id: string, apelido: string) {
  const { db } = iniciar()
  await updateDoc(doc(db, 'atletas', id), { apelido })
  await updateDoc(doc(db, 'familias', f), { [`atletas.${id}`]: apelido })
}

export async function apagarColecao(...caminho: [string, ...string[]]) {
  const { db } = iniciar()
  const r = await getDocs(collection(db, ...caminho))
  await Promise.all(r.docs.map((d) => deleteDoc(d.ref)))
}

export async function apagarAtleta(f: string, id: string) {
  const { db } = iniciar()
  await apagarColecao('atletas', id, 'dados')
  await apagarColecao('atletas', id, 'aparelhos')
  await deleteDoc(doc(db, 'atletas', id))
  await updateDoc(doc(db, 'familias', f), { [`atletas.${id}`]: deleteField() })
}

/**
 * Apaga a conta. Sendo o único responsável, apaga TUDO da família na nuvem (atletas, dados,
 * aparelhos). Havendo outro responsável, só sai da família (os dados continuam com o outro).
 */
export async function apagarConta(uid: string, f: string) {
  pararSincronia()
  const { db, auth } = iniciar()
  const familia = await lerFamilia(f)
  if (familia.responsaveis.length > 1) {
    await updateDoc(doc(db, 'familias', f), { responsaveis: familia.responsaveis.filter((r) => r !== uid) })
  } else {
    for (const a of familia.atletas) await apagarAtleta(f, a.id)
    await apagarColecao('familias', f, 'dados')
    await apagarColecao('familias', f, 'aparelhos')
    await deleteDoc(doc(db, 'familias', f))
  }
  await deleteDoc(doc(db, 'usuarios', uid))
  if (auth.currentUser) await deleteUser(auth.currentUser)
}

/** A família já tem dados na nuvem? (no 1º login de um aparelho, para saber quem vale) */
export async function familiaTemDados(f: string): Promise<boolean> {
  const { db } = iniciar()
  return !(await getDocs(collection(db, 'familias', f, 'dados'))).empty
}

// ---------- convites e aparelhos ----------

const DIA = 24 * 60 * 60 * 1000

/** Código para ligar o aparelho da criança a um atleta (vale 24 h, uso único) */
export async function gerarCodigoAparelho(uid: string, f: string, atleta: string): Promise<string> {
  const { db } = iniciar()
  const codigo = gerarCodigo()
  await setDoc(doc(db, 'convites', codigo), {
    tipo: 'aparelho',
    familia: f,
    atleta,
    criadoPor: uid,
    usadoPor: null,
    expiraEm: Timestamp.fromMillis(Date.now() + DIA),
  })
  return codigo
}

/** Código para o outro responsável (pai/mãe) entrar na família (vale 7 dias, uso único) */
export async function gerarCodigoResponsavel(uid: string, f: string): Promise<string> {
  const { db } = iniciar()
  const codigo = gerarCodigo()
  await setDoc(doc(db, 'convites', codigo), {
    tipo: 'responsavel',
    familia: f,
    criadoPor: uid,
    usadoPor: null,
    expiraEm: Timestamp.fromMillis(Date.now() + 7 * DIA - 60_000),
  })
  return codigo
}

export interface Ligacao {
  familia: string
  atleta: Atleta
}

/** Aparelho da criança: entra sem e-mail (anônimo) e troca o código pelo acesso àquele atleta */
export async function ligarAparelho(codigo: string): Promise<Ligacao & { uid: string }> {
  const { auth, db } = iniciar()
  const u = auth.currentUser ?? (await signInAnonymously(auth)).user
  const c = await getDoc(doc(db, 'convites', codigo))
  if (!c.exists() || c.data().tipo !== 'aparelho') throw new Error('Código não encontrado. Confira as letras.')
  const convite = c.data()
  if ((convite.expiraEm as Timestamp).toMillis() < Date.now()) throw new Error('Este código venceu. Peça um novo na área dos pais.')
  if (convite.usadoPor && convite.usadoPor !== u.uid) throw new Error('Este código já foi usado em outro aparelho. Peça um novo.')
  const familia = String(convite.familia)
  const atletaId = String(convite.atleta)
  if (!convite.usadoPor) await updateDoc(doc(db, 'convites', codigo), { usadoPor: u.uid, usadoEm: Date.now() })
  const agora = Date.now()
  await setDoc(doc(db, 'atletas', atletaId, 'aparelhos', u.uid), { convite: codigo, em: agora })
  await setDoc(doc(db, 'familias', familia, 'aparelhos', u.uid), { convite: codigo, atleta: atletaId, em: agora })
  const atleta = await getDoc(doc(db, 'atletas', atletaId))
  return { uid: u.uid, familia, atleta: { id: atletaId, apelido: String(atleta.data()?.apelido ?? '') } }
}

export interface AparelhoLigado {
  id: string
  em: number
}

export async function listarAparelhos(atleta: string): Promise<AparelhoLigado[]> {
  const r = await getDocs(collection(iniciar().db, 'atletas', atleta, 'aparelhos'))
  return r.docs.map((d) => ({ id: d.id, em: Number(d.data().em ?? 0) }))
}

export async function desligarAparelho(f: string, atleta: string, dev: string) {
  const { db } = iniciar()
  await deleteDoc(doc(db, 'atletas', atleta, 'aparelhos', dev))
  await deleteDoc(doc(db, 'familias', f, 'aparelhos', dev)).catch(() => undefined)
}

// ---------- sincronia ----------

const CHAVE_META = 'futkids-sincronia'
/** De quanto em quanto tempo olha se algo mudou no aparelho */
const INTERVALO_MS = 4000
const TODAS: ChaveSincronizada[] = [...CHAVES_FAMILIA, ...CHAVES_FILHO]

function caminhoDe(familia: string, atleta: string, chave: ChaveSincronizada): string {
  return (CHAVES_FAMILIA as readonly string[]).includes(chave) ? `familias/${familia}/dados/${chave}` : `atletas/${atleta}/dados/${chave}`
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
let aoEsconder: () => void = () => {}

export function pararSincronia() {
  void import('./nuvemEscolinha').then((m) => m.pararTurmas())
  paradas.forEach((p) => p())
  paradas = []
  if (relogio) clearInterval(relogio)
  relogio = null
  window.removeEventListener('visibilitychange', aoEsconder)
}

/**
 * Liga a sincronia da família e do atleta ativo: aplica o que mudou dos dois lados agora, fica
 * ouvindo a nuvem (o plano mudou no celular do pai → atualiza aqui na hora) e envia o que mudar.
 */
export async function iniciarSincronia(familia: string, atleta: string) {
  pararSincronia()
  const { db } = iniciar()
  useContaStore.getState().definirEstado(navigator.onLine ? 'sincronizando' : 'sem-internet')
  ultimosVistos = {}

  async function resolver(chave: ChaveSincronizada, remoto: Remoto | null) {
    const caminho = caminhoDe(familia, atleta, chave)
    const metas = lerMetas()
    const local = localStorage.getItem(chave)
    const acao = decidir(local, metas[caminho] ?? {}, remoto)
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

  async function olharAparelho() {
    if (!navigator.onLine) return useContaStore.getState().definirEstado('sem-internet')
    const metas = lerMetas()
    for (const chave of TODAS) {
      const local = localStorage.getItem(chave)
      if (local === ultimosVistos[chave]) continue
      ultimosVistos[chave] = local
      const caminho = caminhoDe(familia, atleta, chave)
      if (local === (metas[caminho]?.base ?? null)) continue
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
    useContaStore.getState().marcarSincronizado()
  }

  try {
    for (const chave of TODAS) {
      const r = await getDoc(doc(db, caminhoDe(familia, atleta, chave)))
      await resolver(chave, r.exists() ? (r.data() as Remoto) : null)
      ultimosVistos[chave] = localStorage.getItem(chave)
    }
    useContaStore.getState().marcarSincronizado()
  } catch (erro) {
    useContaStore.getState().definirEstado(navigator.onLine ? 'erro' : 'sem-internet', (erro as Error).message)
  }

  for (const chave of TODAS) {
    paradas.push(
      onSnapshot(
        doc(db, caminhoDe(familia, atleta, chave)),
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

  // Plano das turmas da escolinha (se o atleta estiver em alguma)
  void import('./nuvemEscolinha').then((m) => m.ouvirTurmas(atleta))

  relogio = setInterval(() => void olharAparelho(), INTERVALO_MS)
  aoEsconder = () => {
    if (document.visibilityState === 'hidden') void olharAparelho()
  }
  window.addEventListener('visibilitychange', aoEsconder)
}

/** Baixa da nuvem os dados da família e de um atleta direto para o aparelho (antes de recarregar) */
export async function baixarPerfil(familia: string, atleta: string) {
  const { db } = iniciar()
  const metas = lerMetas()
  for (const chave of TODAS) {
    const caminho = caminhoDe(familia, atleta, chave)
    const r = await getDoc(doc(db, caminho))
    if (!r.exists()) continue
    const remoto = r.data() as Remoto
    if (decidir(localStorage.getItem(chave), metas[caminho] ?? {}, remoto) !== 'baixar') continue
    localStorage.setItem(chave, remoto.json)
    metas[caminho] = { base: remoto.json, baseEm: remoto.em }
  }
  gravarMetas(metas)
}

/** Envia agora o que estiver pendente (antes de trocar de atleta ou sair) */
export async function enviarPendentes(familia: string, atleta: string, tudo = false) {
  const { db } = iniciar()
  const metas = lerMetas()
  for (const chave of tudo ? CHAVES_FILHO : TODAS) {
    const caminho = caminhoDe(familia, atleta, chave)
    const local = localStorage.getItem(chave)
    if (local && (tudo || local !== metas[caminho]?.base)) {
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
