// Aviso "Está no computador? Abra o painel" — só aparece em tela larga (notebook/computador).
import { useEffect, useState } from 'react'
import { Link } from 'react-router'

const LARGA = '(min-width: 900px)'

export function AtalhoPainel() {
  const [larga, setLarga] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(LARGA).matches)
  useEffect(() => {
    const m = matchMedia(LARGA)
    const mudar = () => setLarga(m.matches)
    m.addEventListener('change', mudar)
    return () => m.removeEventListener('change', mudar)
  }, [])
  if (!larga) return null
  return (
    <Link to="/painel" className="flex items-center gap-3 rounded-3xl border-4 border-violet-400 bg-violet-50 p-3 font-bold shadow">
      <span aria-hidden className="text-3xl">
        🖥️
      </span>
      <span className="flex-1">
        Está no computador? Abra o <u>painel</u>: planos em grade de semanas, arrastando os treinos para os dias.
      </span>
    </Link>
  )
}
