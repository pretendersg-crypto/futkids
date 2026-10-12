import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { iniciarConta } from './conta/conta'
import { iniciarVerificacaoDeConquistas } from './features/conquistas/verificador'
import { useAchievementsStore } from './stores/achievementsStore'
import { useProgressStore } from './stores/progressStore'
import { useUserStore } from './stores/userStore'
// Ouve desde o começo o aviso "pode instalar" do navegador (botão Instalar o app)
import './utils/instalar'

// Só no `npm run dev`: deixa os stores acessíveis no console para testar
// (ex.: __futkids.progresso.getState().ganharXP(120)). Não vai para o build de produção.
if (import.meta.env.DEV) {
  Object.assign(window, { __futkids: { progresso: useProgressStore, jogador: useUserStore, conquistas: useAchievementsStore } })
}

iniciarVerificacaoDeConquistas()
// Conta da família: se este aparelho está ligado a uma conta, liga a sincronia (baixa o Firebase só aí)
void iniciarConta()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
