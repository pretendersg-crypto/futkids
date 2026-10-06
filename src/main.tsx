import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useProgressStore } from './stores/progressStore'
import { useUserStore } from './stores/userStore'

// Só no `npm run dev`: deixa os stores acessíveis no console para testar
// (ex.: __futkids.progresso.getState().ganharXP(120)). Não vai para o build de produção.
if (import.meta.env.DEV) {
  Object.assign(window, { __futkids: { progresso: useProgressStore, jogador: useUserStore } })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
