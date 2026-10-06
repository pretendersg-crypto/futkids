// Moldura de todas as telas: conteúdo da rota atual + barra de navegação fixa embaixo.
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { AvisoLembrete } from '../features/agenda/AvisoLembrete'
import { useLembreteDiario } from '../features/agenda/useLembrete'
import { Celebracao } from '../features/conquistas/Celebracao'
import { useUserStore } from '../stores/userStore'
import { BottomNav } from './ui/BottomNav'

export function AppLayout() {
  const { pathname } = useLocation()
  const apelido = useUserStore((s) => s.apelido)
  useLembreteDiario()

  // Cada tela nova começa do topo
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Primeira vez no app: antes de tudo, monta o jogador
  if (!apelido) return <Navigate to="/jogador" replace />

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
      {/* Janela de figurinha nova, aparece por cima de qualquer tela */}
      <Celebracao />
      {/* Faixa "Hora de treinar!" do lembrete diário */}
      <AvisoLembrete />
    </>
  )
}
