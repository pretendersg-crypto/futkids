// Endereço (blob:) para mostrar uma imagem guardada no IndexedDB; libera a memória ao sair.
import { useEffect, useState } from 'react'
import { lerImagem } from '../utils/midiaLocal'

export function useImagemLocal(id: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelado = false
    let criado: string | null = null
    void lerImagem(id).then((blob) => {
      if (cancelado || !blob) return
      criado = URL.createObjectURL(blob)
      setUrl(criado)
    })
    return () => {
      cancelado = true
      if (criado) URL.revokeObjectURL(criado)
      setUrl(null)
    }
  }, [id])

  return id ? url : null
}
