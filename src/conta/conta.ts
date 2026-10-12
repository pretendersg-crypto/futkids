// Ações da conta usadas pelas telas. O Firebase (nuvem.ts) só é baixado quando uma destas funções é
// chamada, ou na abertura do app quando o aparelho já está ligado a uma conta.
import type { User } from 'firebase/auth'
import { AVATAR_PADRAO } from '../features/avatar/opcoesAvatar'
import { CHAVES_FAMILIA } from './chaves'
import { useContaStore, type Atleta } from './contaStore'
import { FIREBASE_CONFIG } from './firebaseConfig'
import { carregarPerfil, esquecerPerfil, guardarPerfil, PERFIL_ANTES_DA_CONTA } from './perfis'
import { manterPaisLiberado } from './sessaoPais'

export const contaConfigurada = () => FIREBASE_CONFIG !== null

const nuvem = () => import('./nuvem')

function estado() {
  return useContaStore.getState()
}

/** Abre o app já sincronizando, se este aparelho está ligado a uma conta e a um atleta */
export async function iniciarConta() {
  const { uid, familia, atletaAtivo, definirEstado } = estado()
  if (!contaConfigurada() || !uid || !familia || !atletaAtivo) return
  try {
    const n = await nuvem()
    const usuario = await n.usuarioAtual()
    if (usuario?.uid !== uid) return definirEstado('erro', 'Entre de novo na conta (área dos pais).')
    await n.iniciarSincronia(familia, atletaAtivo)
  } catch (erro) {
    definirEstado('erro', (erro as Error).message)
  }
}

// ---------- entrar (responsável) ----------

export interface Entrada {
  /** Família do usuário (null = ainda não tem: criar uma ou entrar com o código do outro responsável) */
  familia: string | null
}

async function depoisDeEntrar(usuario: User): Promise<Entrada> {
  const n = await nuvem()
  const { familia, escolinha } = await n.lerUsuario(usuario.uid)
  estado().entrou({ uid: usuario.uid, email: usuario.email, aparelhoDaCrianca: false, familia, escolinha })
  if (familia) estado().definirAtletas((await n.lerFamilia(familia)).atletas)
  return { familia }
}

/** Login com Google. null = a pessoa fechou a janela (ou foi para a página do Google e vai voltar) */
export async function entrarComGoogle(): Promise<Entrada | null> {
  const n = await nuvem()
  const usuario = (await n.entrarComGoogle()) ?? (await n.usuarioAtual())
  return usuario && !usuario.isAnonymous ? depoisDeEntrar(usuario) : null
}

export async function enviarLinkPorEmail(email: string) {
  await (await nuvem()).enviarLinkPorEmail(email)
}

/** Página /entrar: termina o login pelo link do e-mail (null = o endereço não é um link de entrada) */
export async function concluirLinkDeEmail(url: string, email?: string): Promise<Entrada | null> {
  const n = await nuvem()
  if (!n.ehLinkDeEntrada(url)) return null
  return depoisDeEntrar(await n.concluirLinkDeEmail(url, email))
}

/** Usuário que voltou do Google pela página (quando a janela foi bloqueada) */
export async function retomarEntrada(): Promise<Entrada | null> {
  if (!contaConfigurada() || estado().uid) return null
  const n = await nuvem()
  const usuario = await n.usuarioAtual()
  return usuario && !usuario.isAnonymous ? depoisDeEntrar(usuario) : null
}

async function usuarioLogado(): Promise<User> {
  const usuario = await (await nuvem()).usuarioAtual()
  if (!usuario || usuario.isAnonymous) throw new Error('Entre na conta primeiro.')
  return usuario
}

export async function criarFamilia() {
  const n = await nuvem()
  const usuario = await usuarioLogado()
  const familia = await n.criarFamilia(usuario)
  estado().entrou({ uid: usuario.uid, email: usuario.email, aparelhoDaCrianca: false, familia, escolinha: estado().escolinha })
  estado().definirAtletas([])
}

/** O outro responsável (pai/mãe) entra na família com o código */
export async function entrarNaFamilia(codigo: string) {
  const n = await nuvem()
  const usuario = await usuarioLogado()
  const familia = await n.entrarNaFamilia(usuario, codigo)
  estado().entrou({ uid: usuario.uid, email: usuario.email, aparelhoDaCrianca: false, familia, escolinha: estado().escolinha })
  estado().definirAtletas((await n.lerFamilia(familia)).atletas)
}

// ---------- este aparelho e os atletas ----------

/** Guarda uma cópia dos dados de família deste aparelho antes da nuvem trocar pelos dela */
function guardarFamiliaAntesDaConta() {
  for (const chave of CHAVES_FAMILIA) {
    const valor = localStorage.getItem(chave)
    if (valor !== null) localStorage.setItem(`futkids-perfil:${PERFIL_ANTES_DA_CONTA}:${chave}`, valor)
  }
}

function exigirFamilia() {
  const { uid, familia } = estado()
  if (!uid || !familia) throw new Error('Entre na conta primeiro.')
  return { uid, familia }
}

/** 1º uso da conta neste aparelho: os dados que já estão aqui viram um atleta novo da família */
export async function usarEsteAparelhoComoAtletaNovo(apelido: string) {
  const { uid, familia } = exigirFamilia()
  const n = await nuvem()
  if (await n.familiaTemDados(familia)) guardarFamiliaAntesDaConta()
  const atleta = await n.criarAtleta(uid, familia, apelido)
  estado().definirAtletas([...estado().atletas, atleta])
  estado().definirAtletaAtivo(atleta.id)
  // A nuvem do atleta está vazia: a sincronia envia o que está aqui
  await n.iniciarSincronia(familia, atleta.id)
}

/** Cria um atleta na família (sem trocar o aparelho para ele), já com o apelido no jogador */
export async function adicionarAtleta(apelido: string): Promise<Atleta> {
  const { uid, familia } = exigirFamilia()
  const n = await nuvem()
  const jogador = JSON.stringify({ state: { apelido, avatar: AVATAR_PADRAO, itensComprados: [], categoriaFixa: null }, version: 3 })
  const atleta = await n.criarAtleta(uid, familia, apelido, { 'futkids-jogador': jogador })
  estado().definirAtletas([...estado().atletas, atleta])
  return atleta
}

/** Troca o atleta deste aparelho (ex.: o pai vai montar o plano de outro filho). Recarrega a página */
export async function trocarAtleta(id: string) {
  const { familia, atletaAtivo } = estado()
  if (!familia || id === atletaAtivo) return
  const n = await nuvem()
  if (atletaAtivo) {
    try {
      await n.enviarPendentes(familia, atletaAtivo)
    } catch {
      // sem internet: a cópia guardada no aparelho segura até a próxima vez
    }
    n.pararSincronia()
    guardarPerfil(atletaAtivo)
  } else {
    // 1ª escolha neste aparelho: o que ele tinha antes fica guardado (nada se perde)
    guardarPerfil(PERFIL_ANTES_DA_CONTA)
    guardarFamiliaAntesDaConta()
  }
  carregarPerfil(id)
  try {
    await n.baixarPerfil(familia, id)
  } catch {
    // sem internet: abre com a cópia que o aparelho tiver
  }
  estado().definirAtletaAtivo(id)
  manterPaisLiberado()
  location.reload()
}

export async function renomearAtleta(id: string, apelido: string) {
  const { familia } = exigirFamilia()
  await (await nuvem()).renomearAtleta(familia, id, apelido)
  estado().definirAtletas(estado().atletas.map((a) => (a.id === id ? { ...a, apelido } : a)))
}

/** Apaga um atleta da família (e da nuvem). Não deixa apagar o atleta ativo neste aparelho */
export async function apagarAtleta(id: string) {
  const { familia } = exigirFamilia()
  if (id === estado().atletaAtivo) throw new Error('Troque este aparelho para outro atleta antes de apagar este.')
  await (await nuvem()).apagarAtleta(familia, id)
  esquecerPerfil(id)
  estado().definirAtletas(estado().atletas.filter((a) => a.id !== id))
}

export async function gerarCodigoAparelho(atleta: string): Promise<string> {
  const { uid, familia } = exigirFamilia()
  return (await nuvem()).gerarCodigoAparelho(uid, familia, atleta)
}

export async function gerarCodigoResponsavel(): Promise<string> {
  const { uid, familia } = exigirFamilia()
  return (await nuvem()).gerarCodigoResponsavel(uid, familia)
}

export async function listarAparelhos(atleta: string) {
  return (await nuvem()).listarAparelhos(atleta)
}

export async function desligarAparelho(atleta: string, dev: string) {
  const { familia } = exigirFamilia()
  await (await nuvem()).desligarAparelho(familia, atleta, dev)
}

// ---------- aparelho da criança ----------

/**
 * Liga este aparelho a um atleta pelo código (sem e-mail). "usarDadosDaqui": o que este aparelho já
 * tinha (jogador, progresso) vai para o atleta; senão vale o que já está na conta. Recarrega a página.
 */
export async function ligarAparelhoDaCrianca(codigo: string, usarDadosDaqui: boolean) {
  const n = await nuvem()
  const { uid, familia, atleta } = await n.ligarAparelho(codigo)
  estado().entrou({ uid, email: null, aparelhoDaCrianca: true, familia })
  estado().definirAtletas([atleta])
  guardarPerfil(PERFIL_ANTES_DA_CONTA)
  guardarFamiliaAntesDaConta()
  if (usarDadosDaqui) await n.enviarPendentes(familia, atleta.id, true)
  else {
    carregarPerfil(atleta.id)
    await n.baixarPerfil(familia, atleta.id)
  }
  estado().definirAtletaAtivo(atleta.id)
  manterPaisLiberado()
  location.reload()
}

// ---------- escolinha (treinador) ----------

const escolinhaNuvem = () => import('./nuvemEscolinha')

export async function criarEscolinha(nome: string) {
  const e = await (await escolinhaNuvem()).criarEscolinha(await usuarioLogado(), nome)
  estado().definirEscolinha(e)
}

export async function entrarNaEscolinha(codigo: string) {
  const e = await (await escolinhaNuvem()).entrarNaEscolinha(await usuarioLogado(), codigo)
  estado().definirEscolinha(e)
}

export async function sairDaEscolinha() {
  const { escolinha } = estado()
  if (!escolinha) return
  await (await escolinhaNuvem()).sairDaEscolinha(await usuarioLogado(), escolinha)
  estado().definirEscolinha(null)
}

// ---------- família: escolinha do atleta ----------

/** Põe o atleta numa turma (código do convite do treinador ou da turma), autorizando a escolinha */
export async function entrarNaTurma(atleta: Atleta, codigo: string) {
  const { familia } = exigirFamilia()
  const info = await (await escolinhaNuvem()).entrarNaTurma(await usuarioLogado(), familia, atleta, codigo)
  // Se é o atleta deste aparelho, começa a ouvir o plano da turma
  if (atleta.id === estado().atletaAtivo) (await escolinhaNuvem()).ouvirTurmas(atleta.id)
  return info
}

export async function tirarDaEscolinha(atleta: string) {
  await (await escolinhaNuvem()).sairDaEscolinhaFamilia(atleta)
}

export async function escolinhaDoAtleta(atleta: string) {
  return (await escolinhaNuvem()).lerEscolinhaDoAtleta(atleta)
}

// ---------- copiar o plano de casa entre filhos ----------

/** Copia o plano de casa do atleta deste aparelho para outros atletas da família (substitui o deles) */
export async function copiarPlanoDeCasa(para: string[]) {
  exigirFamilia()
  const { atletaAtivo } = estado()
  const json = localStorage.getItem('futkids-programa')
  if (!json) throw new Error('Este atleta ainda não tem plano de casa para copiar.')
  const n = await nuvem()
  for (const a of para) {
    if (a === atletaAtivo) continue
    await n.gravarDadoDoAtleta(a, 'futkids-programa', json)
    // A cópia guardada neste aparelho (se houver) também fica igual, para a troca de atleta não juntar com a antiga
    if (localStorage.getItem(`futkids-perfil:${a}:futkids-programa`) !== null) localStorage.setItem(`futkids-perfil:${a}:futkids-programa`, json)
  }
}

// ---------- baixar os dados (LGPD) ----------

/** Baixa um arquivo .json com tudo o que a nuvem guarda da família */
export async function baixarMeusDados() {
  const { familia } = exigirFamilia()
  const dados = await (await nuvem()).exportarDados(await usuarioLogado(), familia)
  const url = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `futkids-meus-dados-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

// ---------- sair e apagar ----------

function esquecerContaNoAparelho() {
  const { atletas, atletaAtivo } = estado()
  // Cópias de outros atletas não ficam num aparelho sem conta
  for (const a of atletas) if (a.id !== atletaAtivo) esquecerPerfil(a.id)
  estado().limpar()
}

/** Sai da conta neste aparelho. Os dados do atleta ativo continuam aqui (como antes da conta) */
export async function sairDaConta() {
  const { familia, atletaAtivo } = estado()
  const n = await nuvem()
  if (familia && atletaAtivo) {
    try {
      await n.enviarPendentes(familia, atletaAtivo)
    } catch {
      // sem internet: o que não subiu fica só aqui
    }
  }
  await n.sair()
  n.esquecerSincronia()
  esquecerContaNoAparelho()
}

/** Apaga a conta (e, sendo o único responsável, TODOS os dados da família na nuvem) */
export async function apagarConta() {
  const { uid, familia } = exigirFamilia()
  const n = await nuvem()
  await n.apagarConta(uid, familia)
  n.esquecerSincronia()
  esquecerContaNoAparelho()
}
