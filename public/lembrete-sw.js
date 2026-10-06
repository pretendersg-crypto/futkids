// Lembrete de treino em segundo plano. Este arquivo é carregado pelo service worker gerado pelo
// vite-plugin-pwa (workbox.importScripts em vite.config.ts).
// Só funciona no Chrome com o app instalado (Periodic Background Sync) e o navegador decide
// quando acordar o app: por isso o lembrete NÃO tem horário garantido.
// Lê a cópia mínima gravada pela página em src/features/agenda/lembrete.ts (mesmos nomes).

const BANCO = 'futkids-lembrete'
const LOJA = 'dados'
const TAG = 'lembrete-treino'

function abrirBanco() {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(BANCO, 1)
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(LOJA)
    pedido.onsuccess = () => resolve(pedido.result)
    pedido.onerror = () => reject(pedido.error)
  })
}

async function ler(chave) {
  const banco = await abrirBanco()
  return new Promise((resolve) => {
    const pedido = banco.transaction(LOJA, 'readonly').objectStore(LOJA).get(chave)
    pedido.onsuccess = () => resolve(pedido.result)
    pedido.onerror = () => resolve(undefined)
  })
}

async function gravar(chave, valor) {
  const banco = await abrirBanco()
  banco.transaction(LOJA, 'readwrite').objectStore(LOJA).put(valor, chave)
}

function hojeISO() {
  const agora = new Date()
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`
}

async function verificarLembrete() {
  const config = await ler('config')
  if (!config || !config.ativo) return
  const hoje = hojeISO()
  if (config.ultimoDiaTreinado === hoje) return
  if ((await ler('ultimoAviso')) === hoje) return
  const [h, m] = config.horario.split(':').map(Number)
  const agora = new Date()
  if (agora.getHours() * 60 + agora.getMinutes() < h * 60 + m) return
  await gravar('ultimoAviso', hoje)
  await self.registration.showNotification('⚽ Hora do treino!', {
    body: 'Bora treinar um pouquinho hoje? 💪',
    icon: '/pwa-192x192.png',
    tag: TAG,
    data: { url: '/agenda' },
  })
}

self.addEventListener('periodicsync', (evento) => {
  if (evento.tag === TAG) evento.waitUntil(verificarLembrete().catch(() => {}))
})

// Tocar na notificação abre (ou traz para frente) o app na agenda
self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  const url = (evento.notification.data && evento.notification.data.url) || '/'
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
      const aberta = janelas.find((j) => 'focus' in j)
      if (aberta) return aberta.focus().then((j) => j && 'navigate' in j && j.navigate(url))
      return self.clients.openWindow(url)
    }),
  )
})
