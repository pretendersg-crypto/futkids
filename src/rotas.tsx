// Mapa de rotas do app. As telas dos módulos ficam dentro do AppLayout (que mostra a barra inferior);
// a tela "Meu jogador" fica fora, ocupando a tela inteira.
import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from './components/AppLayout'
import { Agenda } from './pages/Agenda'
import { Aquecimento } from './pages/Aquecimento'
import { FundamentosGoleiro } from './pages/FundamentosGoleiro'
import { Goleiro } from './pages/Goleiro'
import { Home } from './pages/Home'
import { Jogador } from './pages/Jogador'
import { Perfil } from './pages/Perfil'
import { Rali } from './pages/Rali'

export const router = createBrowserRouter([
  { path: '/jogador', element: <Jogador /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'aquecimento', element: <Aquecimento /> },
      {
        path: 'goleiro',
        children: [
          { index: true, element: <Goleiro /> },
          { path: 'fundamentos', element: <FundamentosGoleiro /> },
          // ex.: /goleiro/defesa/iniciante. Carregado só quando abre um jogo (arquivo separado,
          // mas guardado pelo PWA para funcionar offline)
          { path: ':jogo/:nivel', lazy: () => import('./pages/JogoGoleiro').then((m) => ({ Component: m.JogoGoleiro })) },
        ],
      },
      { path: 'rali', element: <Rali /> },
      { path: 'agenda', element: <Agenda /> },
      { path: 'perfil', element: <Perfil /> },
      // Endereço desconhecido: volta para o início em vez de mostrar página de erro
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
