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
  // Conta (responsável entra sem precisar de jogador; aparelho da criança liga por código) e o link do e-mail
  { path: '/conta', lazy: () => import('./pages/ContaPagina').then((m) => ({ Component: m.ContaPagina })) },
  { path: '/entrar', lazy: () => import('./pages/EntrarPorLink').then((m) => ({ Component: m.EntrarPorLink })) },
  // Política de Privacidade e Termos de Uso (públicas, sem conta)
  { path: '/privacidade', lazy: () => import('./pages/Legal').then((m) => ({ Component: m.Privacidade })) },
  { path: '/termos', lazy: () => import('./pages/Legal').then((m) => ({ Component: m.Termos })) },
  // Painel para computador (planos em grade, arrastar e soltar)
  { path: '/painel', lazy: () => import('./pages/Painel').then((m) => ({ Component: m.Painel })) },
  // Área do treinador de escolinha (turmas, atletas e plano da turma)
  { path: '/treinador', lazy: () => import('./pages/TreinadorPagina').then((m) => ({ Component: m.TreinadorPagina })) },
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
          // Endereços antigos do catálogo (hoje em /fundamentos): continuam funcionando
          { path: 'gestos', lazy: () => import('./pages/FundamentosGestos').then((m) => ({ Component: m.FundamentosGestos })) },
          { path: 'gestos/:gesto', lazy: () => import('./pages/GestoDetalhe').then((m) => ({ Component: m.GestoDetalhe })) },
          // Treino de fundamentos montado pelos pais (ex.: /goleiro/treino/basicos)
          { path: 'treino/:treino', lazy: () => import('./pages/JogarTreinoFundamentos').then((m) => ({ Component: m.JogarTreinoFundamentos })) },
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
          // Lance explicado na prancheta (ex.: /tatica/lance/sistema-3-1)
          { path: 'lance/:lance', lazy: () => import('./pages/LanceTatico').then((m) => ({ Component: m.LanceTatico })) },
          // Criar e editar puzzles e pranchetas (pais e treinador)
          { path: 'criar', lazy: () => import('./pages/CriarTatica').then((m) => ({ Component: m.CriarTatica })) },
        ],
      },
      // Fundamentos e gestos de goleiro, de linha e comuns (ex.: /fundamentos?tipo=linha, /fundamentos/conducao)
      {
        path: 'fundamentos',
        children: [
          { index: true, lazy: () => import('./pages/FundamentosGestos').then((m) => ({ Component: m.FundamentosGestos })) },
          { path: ':gesto', lazy: () => import('./pages/GestoDetalhe').then((m) => ({ Component: m.GestoDetalhe })) },
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
