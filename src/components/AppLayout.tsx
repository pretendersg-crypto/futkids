// Moldura de todas as telas: conteúdo da rota atual + barra de navegação fixa embaixo.
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { BottomNav } from './ui/BottomNav'

export function AppLayout() {
  const { pathname } = useLocation()

  // Cada tela nova começa do topo
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      {/* pb-28 deixa espaço para a barra inferior não cobrir o fim da tela.
          A entrada da tela é animação CSS (index.css): se o celular travar quadros, o conteúdo
          continua visível, diferente de uma animação JS que começa com opacidade 0. */}
      <main
        key={pathname}
        className="entrada-tela mx-auto min-h-full max-w-md px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-28"
      >
        <Outlet />
      </main>
      <BottomNav />
    </>
  )
}
