// GIFs/imagens próprios dos exercícios, enviados pelos pais: ficam no IndexedDB do aparelho
// (o localStorage é pequeno demais para imagens). Nada é enviado para fora.

const BANCO = 'futkids-midia'
const LOJA = 'imagens'
/** Tamanho máximo de um GIF (o aparelho tem espaço limitado) */
export const TAMANHO_MAXIMO = 3 * 1024 * 1024
export const TIPOS_ACEITOS = ['image/gif', 'image/webp', 'image/png', 'image/jpeg']

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(BANCO, 1)
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(LOJA)
    pedido.onsuccess = () => resolve(pedido.result)
    pedido.onerror = () => reject(pedido.error)
  })
}

function operar<T>(modo: IDBTransactionMode, fazer: (loja: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return abrir().then(
    (banco) =>
      new Promise((resolve, reject) => {
        const pedido = fazer(banco.transaction(LOJA, modo).objectStore(LOJA))
        pedido.onsuccess = () => resolve(pedido.result)
        pedido.onerror = () => reject(pedido.error)
      }),
  )
}

/** Guarda o arquivo e devolve o id (ou lança erro com mensagem para os pais) */
export async function salvarImagem(arquivo: File): Promise<string> {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) throw new Error('Use um GIF, WebP, PNG ou JPG.')
  if (arquivo.size > TAMANHO_MAXIMO) throw new Error('A imagem passa de 3 MB. Use uma menor.')
  const id = `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  await operar('readwrite', (l) => l.put(arquivo, id))
  return id
}

export async function lerImagem(id: string): Promise<Blob | undefined> {
  try {
    return await operar<Blob | undefined>('readonly', (l) => l.get(id) as IDBRequest<Blob | undefined>)
  } catch {
    return undefined
  }
}

export async function apagarImagem(id: string): Promise<void> {
  try {
    await operar('readwrite', (l) => l.delete(id))
  } catch {
    // já não existia
  }
}

/** Apaga as imagens que nenhum exercício usa mais (ex.: GIF trocado, exercício removido) */
export async function limparImagensSoltas(usadas: Set<string>): Promise<void> {
  try {
    const ids = await operar<IDBValidKey[]>('readonly', (l) => l.getAllKeys())
    await Promise.all(ids.map(String).filter((id) => !usadas.has(id)).map(apagarImagem))
  } catch {
    // sem IndexedDB: nada a limpar
  }
}
