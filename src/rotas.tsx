// Mapa de rotas do app. Todas as telas ficam dentro do AppLayout (que mostra a barra inferior).
import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from './components/AppLayout'
import { Agenda } from './pages/Agenda'
import { Aquecimento } from './pages/Aquecimento'
import { Goleiro } from './pages/Goleiro'
import { Home } from './pages/Home'
import { Perfil } from './pages/Perfil'
import { Rali } from './pages/Rali'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'aquecimento', element: <Aquecimento /> },
      { path: 'goleiro', element: <Goleiro /> },
      { path: 'rali', element: <Rali /> },
      { path: 'agenda', element: <Agenda /> },
      { path: 'perfil', element: <Perfil /> },
      // Endereço desconhecido: volta para o início em vez de mostrar página de erro
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
