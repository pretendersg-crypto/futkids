// Mantém a tela acesa durante o exercício (a criança não está tocando no celular).
// Em navegadores sem suporte, simplesmente não faz nada.
import { useEffect } from 'react'

export function useWakeLock(ativo: boolean) {
  useEffect(() => {
    if (!ativo || !('wakeLock' in navigator)) return
    let trava: WakeLockSentinel | null = null
    let cancelado = false

    const pedir = () =>
      navigator.wakeLock
        .request('screen')
        .then((t) => {
          if (cancelado) void t.release()
          else trava = t
        })
        .catch(() => {}) // ex.: modo economia de bateria; segue sem travar a tela

    void pedir()
    // O navegador solta a trava quando o app sai da tela; pede de novo quando volta
    const aoVoltar = () => document.visibilityState === 'visible' && void pedir()
    document.addEventListener('visibilitychange', aoVoltar)

    return () => {
      cancelado = true
      document.removeEventListener('visibilitychange', aoVoltar)
      void trava?.release()
    }
  }, [ativo])
}
