// Aviso rápido de pontos do treinador ("+30 XP · Criou um treino de fundamentos"), com nível novo e
// medalhas novas. Aparece por cima da área dos pais e some sozinho.
import { useEffect } from 'react'
import { useTreinadorStore } from '../../stores/treinadorStore'

export function AvisoTreinador() {
  const aviso = useTreinadorStore((s) => s.aviso)
  const fechar = useTreinadorStore((s) => s.fecharAviso)

  useEffect(() => {
    if (!aviso) return
    const t = window.setTimeout(fechar, aviso.subiu || aviso.medalhas.length ? 5000 : 3000)
    return () => window.clearTimeout(t)
  }, [aviso, fechar])

  if (!aviso) return null
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 top-[max(0.5rem,env(safe-area-inset-top))] z-50 flex justify-center px-4">
      <button
        type="button"
        onClick={fechar}
        className="pop pointer-events-auto flex max-w-md flex-col items-center gap-0.5 rounded-3xl border-4 border-violet-400 bg-white px-4 py-2 text-center shadow-xl"
      >
        <span className="text-lg font-extrabold text-violet-800">
          👨‍🏫 +{aviso.xp} XP de treinador
        </span>
        <span className="text-sm">{aviso.texto}</span>
        {aviso.subiu && <span className="text-base font-extrabold">🎉 Você subiu: {aviso.subiu}!</span>}
        {aviso.medalhas.map((m) => (
          <span key={m} className="text-base font-extrabold">
            🏅 Medalha nova: {m}
          </span>
        ))}
      </button>
    </div>
  )
}
