// Ações da conta da família usadas pelas telas. O Firebase (nuvem.ts) só é baixado quando uma destas
// funções é chamada, ou na abertura do app quando o aparelho já está ligado a uma conta.
import { AVATAR_PADRAO } from '../features/avatar/opcoesAvatar'
import { CHAVES_FAMILIA } from './chaves'
import { useContaStore, type Filho } from './contaStore'
import { FIREBASE_CONFIG } from './firebaseConfig'
import { manterPaisLiberado } from './sessaoPais'
import { carregarPerfil, esquecerPerfil, guardarPerfil, PERFIL_ANTES_DA_CONTA } from './perfis'

export const contaConfigurada = () => FIREBASE_CONFIG !== null

const nuvem = () => import('./nuvem')

/** Abre o app já sincronizando, se este aparelho está ligado a uma conta e a um filho */
export async function iniciarConta() {
  const { uid, filhoAtivo, definirEstado } = useContaStore.getState()
  if (!contaConfigurada() || !uid || !filhoAtivo) return
  try {
    const n = await nuvem()
    const usuario = await n.usuarioAtual()
    if (usuario?.uid !== uid) return definirEstado('erro', 'Entre de novo na conta da família (área dos pais).')
    await n.iniciarSincronia(uid, filhoAtivo)
  } catch (erro) {
    definirEstado('erro', (erro as Error).message)
  }
}

export interface ResultadoEntrada {
  filhos: Filho[]
  /** A família já tinha dados na nuvem (outro aparelho entrou antes) */
  familiaNaNuvem: boolean
}

/** Login com Google. null = a pessoa fechou a janela (ou foi para a página do Google e vai voltar) */
export async function entrar(): Promise<ResultadoEntrada | null> {
  const n = await nuvem()
  const usuario = (await n.entrarComGoogle()) ?? (await n.usuarioAtual())
  if (!usuario) return null
  const conta = useContaStore.getState()
  conta.entrou(usuario.uid, usuario.email)
  await n.registrarAceite(usuario.uid)
  const filhos = await n.listarFilhos(usuario.uid)
  conta.definirFilhos(filhos)
  return { filhos, familiaNaNuvem: await n.familiaTemDados(usuario.uid) }
}

/** Guarda uma cópia dos dados de família deste aparelho antes da nuvem trocar por os dela */
function guardarFamiliaAntesDaConta() {
  for (const chave of CHAVES_FAMILIA) {
    const valor = localStorage.getItem(chave)
    if (valor !== null) localStorage.setItem(`futkids-perfil:${PERFIL_ANTES_DA_CONTA}:${chave}`, valor)
  }
}

/** 1º login neste aparelho: os dados que já estão aqui viram um filho novo na conta */
export async function vincularComoFilhoNovo(apelido: string, familiaNaNuvem: boolean) {
  const { uid } = useContaStore.getState()
  if (!uid) throw new Error('Entre na conta primeiro.')
  const n = await nuvem()
  if (familiaNaNuvem) guardarFamiliaAntesDaConta()
  const filho = await n.criarFilho(uid, apelido)
  const conta = useContaStore.getState()
  conta.definirFilhos([...conta.filhos, filho])
  conta.definirFilhoAtivo(filho.id)
  // A sincronia envia os dados do filho (a nuvem dele está vazia) e resolve os da família
  await n.iniciarSincronia(uid, filho.id)
}

/** 1º login neste aparelho: ele passa a ser de um filho que já está na conta */
export async function vincularAFilhoExistente(id: string) {
  const { uid } = useContaStore.getState()
  if (!uid) throw new Error('Entre na conta primeiro.')
  const n = await nuvem()
  guardarPerfil(PERFIL_ANTES_DA_CONTA)
  guardarFamiliaAntesDaConta()
  carregarPerfil(id)
  await n.baixarPerfil(uid, id)
  useContaStore.getState().definirFilhoAtivo(id)
  manterPaisLiberado()
  location.reload()
}

/** Troca o filho deste aparelho (ex.: o pai vai montar o plano de outro filho) */
export async function trocarFilho(id: string) {
  const { uid, filhoAtivo } = useContaStore.getState()
  if (!uid || id === filhoAtivo) return
  const n = await nuvem()
  if (filhoAtivo) {
    // Manda o que está pendente; sem internet, a cópia guardada no aparelho segura até a próxima vez
    try {
      await n.enviarPendentes(uid, filhoAtivo)
    } catch {
      // segue: a cópia local guarda
    }
    n.pararSincronia()
    guardarPerfil(filhoAtivo)
  }
  carregarPerfil(id)
  try {
    await n.baixarPerfil(uid, id)
  } catch {
    // sem internet: abre com a cópia que o aparelho tiver
  }
  useContaStore.getState().definirFilhoAtivo(id)
  manterPaisLiberado()
  location.reload()
}

/** Cria um filho na conta (sem trocar o aparelho para ele), já com o apelido no jogador */
export async function adicionarFilho(apelido: string): Promise<Filho> {
  const { uid } = useContaStore.getState()
  if (!uid) throw new Error('Entre na conta primeiro.')
  const n = await nuvem()
  const jogador = JSON.stringify({ state: { apelido, avatar: AVATAR_PADRAO, itensComprados: [], categoriaFixa: null }, version: 3 })
  const filho = await n.criarFilho(uid, apelido, { 'futkids-jogador': jogador })
  const conta = useContaStore.getState()
  conta.definirFilhos([...conta.filhos, filho])
  return filho
}

export async function renomearFilho(id: string, apelido: string) {
  const { uid } = useContaStore.getState()
  if (!uid) return
  const n = await nuvem()
  await n.renomearFilho(uid, id, apelido)
  const conta = useContaStore.getState()
  conta.definirFilhos(conta.filhos.map((f) => (f.id === id ? { ...f, apelido } : f)))
}

/** Apaga um filho da conta (e da nuvem). Não deixa apagar o filho ativo neste aparelho */
export async function apagarFilho(id: string) {
  const { uid, filhoAtivo } = useContaStore.getState()
  if (!uid || id === filhoAtivo) throw new Error('Troque este aparelho para outro filho antes de apagar este.')
  const n = await nuvem()
  await n.apagarFilho(uid, id)
  esquecerPerfil(id)
  const conta = useContaStore.getState()
  conta.definirFilhos(conta.filhos.filter((f) => f.id !== id))
}

function esquecerContaNoAparelho() {
  const { filhos, filhoAtivo } = useContaStore.getState()
  // Cópias de outros filhos não ficam num aparelho sem conta
  for (const f of filhos) if (f.id !== filhoAtivo) esquecerPerfil(f.id)
  useContaStore.getState().limpar()
}

/** Sai da conta neste aparelho. Os dados do filho ativo continuam aqui (como antes da conta) */
export async function sairDaConta() {
  const { uid, filhoAtivo } = useContaStore.getState()
  const n = await nuvem()
  if (uid && filhoAtivo) {
    try {
      await n.enviarPendentes(uid, filhoAtivo)
    } catch {
      // sem internet: o que não subiu fica só aqui
    }
  }
  await n.sair()
  n.esquecerSincronia()
  esquecerContaNoAparelho()
}

/** Apaga a conta e TODOS os dados da família na nuvem. O aparelho fica com os dados do filho ativo */
export async function apagarContaDaFamilia() {
  const { uid } = useContaStore.getState()
  if (!uid) return
  const n = await nuvem()
  await n.apagarConta(uid)
  n.esquecerSincronia()
  esquecerContaNoAparelho()
}
