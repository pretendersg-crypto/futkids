// Onde fica cada dado salvo do app (cada store do zustand é uma chave no localStorage), para a conta
// da família saber o que é de quem:
//  - FAMÍLIA: vale para todos os filhos e todos os aparelhos (biblioteca de treinos, gestos e treinos
//    de fundamentos que os pais criam, puzzles e pranchetas do Futsal Tático, circuitos com cones, o PIN e o Pai/Mãe
//    Treinador);
//  - FILHO: de cada criança (jogador, progresso, conquistas, o plano/agenda montado para ela...);
//  - APARELHO: só deste aparelho (som, faixa de instalar, a própria conta) e nunca vai para a nuvem.
// Ao criar um store novo com persist, coloque a chave dele numa das listas (o teste confere).

export const CHAVES_FAMILIA = ['futkids-pais', 'futkids-treinos', 'futkids-gestos', 'futkids-treinos-fundamentos', 'futkids-treinador', 'futkids-tatica-criada', 'futkids-circuitos'] as const

export const CHAVES_FILHO = [
  'futkids-jogador',
  'futkids-progresso',
  'futkids-conquistas',
  'futkids-agenda',
  'futkids-alimentacao',
  'futkids-programa',
  'futkids-reacao',
  'futkids-tatica',
  'futkids-gestos-concluidos',
] as const

// futkids-turmas: cópia do plano das turmas (vem da escolinha, não volta para a nuvem)
export const CHAVES_APARELHO = ['futkids-config', 'futkids-conta', 'futkids-sincronia', 'futkids-categoria-antiga', 'futkids-turmas'] as const

export type ChaveFamilia = (typeof CHAVES_FAMILIA)[number]
export type ChaveFilho = (typeof CHAVES_FILHO)[number]
export type ChaveSincronizada = ChaveFamilia | ChaveFilho

export const CHAVES_SINCRONIZADAS: readonly ChaveSincronizada[] = [...CHAVES_FAMILIA, ...CHAVES_FILHO]

/**
 * Versão do FORMATO dos dados sincronizados. Suba sempre que a "version" de algum store mudar (o teste
 * em conta.test.ts avisa). Um aparelho com o app antigo não aplica nem envia dados gravados por um app
 * mais novo: pede para atualizar (assim ele não estraga o formato novo).
 */
export const VERSAO_DADOS = 1

/** Cópia local do perfil de um filho que não está ativo neste aparelho */
export const chaveGuardada = (filho: string, chave: ChaveFilho) => `futkids-perfil:${filho}:${chave}`
