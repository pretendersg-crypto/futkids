// Mapa de rotas do app. As telas dos módulos ficam dentro do AppLayout (que mostra a barra inferior);
// a tela "Meu jogador" fica fora, ocupando a tela inteira.
// Início, menus e "Meu jogador" vêm no arquivo principal (abrem na hora); as telas maiores são
// carregadas sob demanda em arquivos separados, que o PWA também guarda para funcionar offline.
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { AppLayout } from './components/AppLayout'
import { Goleiro } from './pages/Goleiro'
import { Home } from './pages/Home'
import { Jogador } from './pages/Jogador'
import { Rali } from './pages/Rali'

const ROTAS: RouteObject[] = [
  { path: '/jogador', element: <Jogador /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'treinos',
        children: [
          { index: true, lazy: () => import('./pages/Treinos').then((m) => ({ Component: m.Treinos })) },
          { path: 'aquecimento', lazy: () => import('./pages/Aquecimento').then((m) => ({ Component: m.Aquecimento })) },
          { path: 'videos', lazy: () => import('./pages/VideosTreino').then((m) => ({ Component: m.VideosTreino })) },
          // ex.: /treinos/velocidade, /treinos/alongamento
          { path: ':modulo', lazy: () => import('./pages/SerieTreino').then((m) => ({ Component: m.SerieTreino })) },
        ],
      },
      // Endereço antigo do aquecimento (links salvos, notificações antigas)
      { path: 'aquecimento', element: <Navigate to="/treinos/aquecimento" replace /> },
      { path: 'alimentacao/*', lazy: () => import('./pages/Alimentacao').then((m) => ({ Component: m.Alimentacao })) },
      {
        path: 'goleiro',
        children: [
          { index: true, element: <Goleiro /> },
          { path: 'fundamentos', lazy: () => import('./pages/FundamentosGoleiro').then((m) => ({ Component: m.FundamentosGoleiro })) },
          // Saída do gol com cones: lista e um circuito (ex.: /goleiro/saida/saida-em-v)
          { path: 'saida', lazy: () => import('./pages/SaidaGol').then((m) => ({ Component: m.SaidaGol })) },
          { path: 'saida/:circuito', lazy: () => import('./pages/CircuitoSaida').then((m) => ({ Component: m.CircuitoSaida })) },
          // Catálogo dos fundamentos e gestos do goleiro e um gesto (ex.: /goleiro/gestos/cruz)
          { path: 'gestos', lazy: () => import('./pages/FundamentosGestos').then((m) => ({ Component: m.FundamentosGestos })) },
          { path: 'gestos/:gesto', lazy: () => import('./pages/GestoDetalhe').then((m) => ({ Component: m.GestoDetalhe })) },
          // ex.: /goleiro/defesa/iniciante
          { path: ':jogo/:nivel', lazy: () => import('./pages/JogoGoleiro').then((m) => ({ Component: m.JogoGoleiro })) },
        ],
      },
      {
        path: 'rali',
        children: [
          { index: true, element: <Rali /> },
          // ex.: /rali/embaixadinha
          { path: ':desafio', lazy: () => import('./pages/JogoRali').then((m) => ({ Component: m.JogoRali })) },
        ],
      },
      {
        path: 'reacao',
        children: [
          { index: true, lazy: () => import('./pages/Reacao').then((m) => ({ Component: m.Reacao })) },
          // ex.: /reacao/mergulho-seta
          { path: ':drill', lazy: () => import('./pages/DrillReacao').then((m) => ({ Component: m.DrillReacao })) },
        ],
      },
      {
        path: 'tatica',
        children: [
          { index: true, lazy: () => import('./pages/Tatica').then((m) => ({ Component: m.Tatica })) },
          // ex.: /tatica/jogar?modo=relogio&dif=facil ou /tatica/jogar?id=tabela
          { path: 'jogar', lazy: () => import('./pages/JogarTatica').then((m) => ({ Component: m.JogarTatica })) },
        ],
      },
      { path: 'agenda', lazy: () => import('./pages/Agenda').then((m) => ({ Component: m.Agenda })) },
      { path: 'perfil', lazy: () => import('./pages/Perfil').then((m) => ({ Component: m.Perfil })) },
      // Endereço desconhecido: volta para o início em vez de mostrar página de erro
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]

export const router = createBrowserRouter(ROTAS, {
  // Publicado numa subpasta (ex.: /futkids/ no GitHub Pages): as rotas continuam começando em "/"
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
})
