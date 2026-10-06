// Lembrete diário de treino, sem servidor:
//  - com o app aberto: no horário, aviso dentro do app (ou notificação, se o app estiver em segundo plano)
//  - com o app fechado: o aviso aparece na próxima vez que abrir
//  - Chrome no Android com o app instalado: às vezes avisa em segundo plano (Periodic Background
//    Sync, sem garantia de horário). Para isso, uma cópia mínima dos dados vai para o IndexedDB,
//    que o service worker (public/lembrete-sw.js) consegue ler.
// Nada sai do aparelho.

const BANCO = 'futkids-lembrete'
const LOJA = 'dados'
export const TAG_SEGUNDO_PLANO = 'lembrete-treino'

export const MENSAGEM = { titulo: '⚽ Hora do treino!', corpo: 'Bora treinar um pouquinho hoje? 💪' }

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(BANCO, 1)
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(LOJA)
    pedido.onsuccess = () => resolve(pedido.result)
    pedido.onerror = () => reject(pedido.error)
  })
}

async function gravar(chave: string, valor: unknown) {
  try {
    const banco = await abrirBanco()
    banco.transaction(LOJA, 'readwrite').objectStore(LOJA).put(valor, chave)
  } catch {
    // Sem IndexedDB (ex.: janela anônima): o lembrete em segundo plano só não funciona
  }
}

export async function lerDoBanco<T>(chave: string): Promise<T | undefined> {
  try {
    const banco = await abrirBanco()
    return await new Promise((resolve) => {
      const pedido = banco.transaction(LOJA, 'readonly').objectStore(LOJA).get(chave)
      pedido.onsuccess = () => resolve(pedido.result as T)
      pedido.onerror = () => resolve(undefined)
    })
  } catch {
    return undefined
  }
}

export interface DadosSegundoPlano {
  ativo: boolean
  horario: string
  /** Último dia treinado: se for hoje, não precisa lembrar */
  ultimoDiaTreinado: string | null
}

/** Atualiza a cópia que o service worker lê */
export function espelharParaSegundoPlano(dados: DadosSegundoPlano) {
  void gravar('config', dados)
}

export function marcarAvisoNoBanco(dia: string) {
  void gravar('ultimoAviso', dia)
}

export type PermissaoNotificacao = 'permitida' | 'bloqueada' | 'perguntar' | 'sem-suporte'

export function permissaoNotificacao(): PermissaoNotificacao {
  if (!('Notification' in window)) return 'sem-suporte'
  return Notification.permission === 'granted' ? 'permitida' : Notification.permission === 'denied' ? 'bloqueada' : 'perguntar'
}

export async function pedirPermissaoNotificacao(): Promise<PermissaoNotificacao> {
  if (!('Notification' in window)) return 'sem-suporte'
  try {
    await Notification.requestPermission()
  } catch {
    // navegadores antigos usam callback; o estado abaixo já reflete a resposta
  }
  return permissaoNotificacao()
}

/** Mostra a notificação do sistema (pelo service worker, que é o que funciona no Android) */
export async function mostrarNotificacao(): Promise<boolean> {
  if (permissaoNotificacao() !== 'permitida') return false
  const base = import.meta.env.BASE_URL // "/" ou a subpasta onde o app está publicado
  const opcoes = { body: MENSAGEM.corpo, icon: `${base}pwa-192x192.png`, tag: TAG_SEGUNDO_PLANO, data: { url: `${base}agenda` } }
  try {
    const registro = await navigator.serviceWorker?.getRegistration()
    if (registro) await registro.showNotification(MENSAGEM.titulo, opcoes)
    else new Notification(MENSAGEM.titulo, opcoes)
    return true
  } catch {
    return false
  }
}

type RegistroComSync = ServiceWorkerRegistration & {
  periodicSync?: { register: (tag: string, opcoes: { minInterval: number }) => Promise<void>; unregister: (tag: string) => Promise<void> }
}

/** Liga/desliga o aviso em segundo plano (só existe no Chrome com o app instalado; nos outros, ignora) */
export async function configurarSegundoPlano(ativo: boolean) {
  try {
    const registro = (await navigator.serviceWorker?.ready) as RegistroComSync | undefined
    if (!registro?.periodicSync) return
    if (!ativo) return await registro.periodicSync.unregister(TAG_SEGUNDO_PLANO)
    const estado = await navigator.permissions.query({ name: 'periodic-background-sync' as PermissionName })
    if (estado.state === 'granted') await registro.periodicSync.register(TAG_SEGUNDO_PLANO, { minInterval: 60 * 60 * 1000 })
  } catch {
    // sem suporte: fica só o aviso com o app aberto
  }
}
