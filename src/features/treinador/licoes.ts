// Estudo do Pai/Mãe Treinador: lições curtas (leitura de 2 a 3 minutos) sobre como treinar um
// goleiro de 6 a 12 anos, cada uma com um mini-quiz. Concluir dá XP de treinador; acertar tudo
// dá um bônus. É orientação geral para pais: não substitui um professor de educação física.

export interface Pergunta {
  texto: string
  opcoes: string[]
  /** Índice da opção certa */
  certa: number
  /** Por que essa é a certa (aparece depois de responder) */
  porque: string
}

export interface Licao {
  id: string
  titulo: string
  emoji: string
  minutos: number
  /** Parágrafos curtos */
  texto: string[]
  /** Para lembrar (lista) */
  dicas: string[]
  quiz: Pergunta[]
}

export const LICOES: Licao[] = [
  {
    id: 'como-ensinar',
    titulo: 'Como ensinar uma criança goleira',
    emoji: '🧒',
    minutos: 3,
    texto: [
      'Entre 6 e 12 anos, a criança aprende brincando. O treino precisa ser curto, variado e divertido: 20 a 40 minutos já são suficientes, com pausas para água.',
      'Um tema por treino funciona melhor do que muitos: por exemplo, "hoje é dia de encaixe". Mostre o gesto, deixe tentar, corrija uma coisa de cada vez.',
      'Elogie o esforço e a coragem, não só a defesa. Levar gol faz parte: o goleiro que não tem medo de errar aprende mais rápido.',
    ],
    dicas: ['Treino curto e frequente vale mais que treino longo de vez em quando', 'Uma correção por vez', 'Nunca compare com outras crianças'],
    quiz: [
      {
        texto: 'Quanto tempo é um bom treino para uma criança de 8 anos?',
        opcoes: ['2 horas seguidas', '20 a 40 minutos, com pausas', '5 minutos por semana'],
        certa: 1,
        porque: 'Treinos curtos mantêm a atenção e a vontade de voltar no dia seguinte.',
      },
      {
        texto: 'A criança levou um gol. O que dizer?',
        opcoes: ['"Você tinha que ter pegado!"', '"Boa tentativa! Vamos ver como chegar mais rápido?"', 'Não dizer nada'],
        certa: 1,
        porque: 'Elogiar a tentativa e mostrar o próximo passo ensina sem tirar a coragem.',
      },
      {
        texto: 'Quantas correções de cada vez?',
        opcoes: ['Uma', 'Todas que der', 'Nenhuma'],
        certa: 0,
        porque: 'Com uma correção por vez a criança consegue focar e acertar.',
      },
    ],
  },
  {
    id: 'seguranca',
    titulo: 'Segurança em primeiro lugar',
    emoji: '🦺',
    minutos: 2,
    texto: [
      'Antes de qualquer treino, aquecimento (o app já coloca o aquecimento primeiro). Músculo frio se machuca mais.',
      'Quedas, mergulhos, cruz e abafa só na grama, na areia ou no colchonete. No chão duro, treine só a posição e o movimento, sem cair.',
      'Bola leve para os menores, chutes fracos e de perto no começo. Água sempre por perto e descanso quando a criança pedir.',
    ],
    dicas: ['Aquecer sempre', 'Cair só em lugar macio', 'Bola leve e chute fraco no começo', 'Dor é sinal para parar'],
    quiz: [
      {
        texto: 'Onde treinar quedas laterais e mergulhos?',
        opcoes: ['No piso da sala', 'Na grama, areia ou colchonete', 'Na calçada'],
        certa: 1,
        porque: 'Lugar macio protege quadril, ombros e cotovelos enquanto a criança aprende a cair.',
      },
      {
        texto: 'O que vem antes de qualquer treino?',
        opcoes: ['Aquecimento', 'Chutes fortes', 'Nada'],
        certa: 0,
        porque: 'O aquecimento prepara o corpo e diminui o risco de lesão.',
      },
      {
        texto: 'A criança reclamou de dor no punho. E agora?',
        opcoes: ['Continuar até o fim', 'Parar e observar', 'Trocar de mão e seguir'],
        certa: 1,
        porque: 'Dor é sinal para parar. Se continuar, procure um profissional de saúde.',
      },
    ],
  },
  {
    id: 'base-posicionamento',
    titulo: 'Posição base e posicionamento',
    emoji: '🧍',
    minutos: 3,
    texto: [
      'A posição base é o "pronto para defender": pés na largura dos ombros, joelhos dobrados, peso na ponta dos pés e mãos na frente do corpo.',
      'Posicionar é escolher onde ficar: na linha imaginária entre a bola e o meio do gol, um pouco à frente da linha. Assim os dois cantos ficam menores.',
      'Quando a bola muda de lugar, o goleiro muda junto, com passos laterais curtos, sem cruzar as pernas.',
    ],
    dicas: ['Calcanhar levemente fora do chão', 'Linha bola → meio do gol', 'Andar de lado sem cruzar'],
    quiz: [
      {
        texto: 'Onde o goleiro deve ficar quando a bola está na diagonal?',
        opcoes: ['Sempre no meio da linha do gol', 'Na linha entre a bola e o meio do gol', 'No poste mais longe da bola'],
        certa: 1,
        porque: 'Na linha da bola, o goleiro diminui o espaço dos dois cantos.',
      },
      {
        texto: 'Na posição base, onde fica o peso do corpo?',
        opcoes: ['Nos calcanhares', 'Na ponta dos pés', 'Em uma perna só'],
        certa: 1,
        porque: 'Na ponta dos pés o goleiro sai mais rápido para qualquer lado.',
      },
      {
        texto: 'Para andar de lado, o goleiro deve...',
        opcoes: ['Cruzar as pernas', 'Abrir um pé e trazer o outro, sem cruzar', 'Pular com os dois pés'],
        certa: 1,
        porque: 'Sem cruzar as pernas, ele continua equilibrado se a bola vier naquela hora.',
      },
    ],
  },
  {
    id: 'encaixes',
    titulo: 'Encaixes e desvios',
    emoji: '🤲',
    minutos: 3,
    texto: [
      'Bola rasteira: corpo atrás da bola, um joelho desce perto do outro pé (uma "parede") e as mãos juntas embaixo trazem a bola ao peito.',
      'Bola na barriga ou no peito: braços em "cestinha" por baixo, abraçando a bola contra o corpo. Bola alta: mãos em W, polegares quase se tocando atrás da bola.',
      'Quando não dá para agarrar, espalmar: mão firme, bola para FORA, para o lado do gol, nunca para o meio da área.',
    ],
    dicas: ['Rasteira: pernas fechadas, ninguém passa por baixo', 'Alta: mãos em W', 'Espalmar para fora'],
    quiz: [
      {
        texto: 'Como ficam as mãos para agarrar uma bola alta?',
        opcoes: ['Em W, polegares quase se tocando', 'Separadas, uma em cada lado', 'Fechadas em soco'],
        certa: 0,
        porque: 'As mãos em W formam uma "concha" atrás da bola e ela não escapa.',
      },
      {
        texto: 'Para onde espalmar uma bola forte?',
        opcoes: ['Para o meio da área', 'Para fora, pelo lado do gol', 'Para cima'],
        certa: 1,
        porque: 'Espalmando para o meio, a bola sobra para o atacante.',
      },
      {
        texto: 'Qual o erro mais comum no encaixe da bola rasteira?',
        opcoes: ['Pernas abertas: a bola passa no meio', 'Olhar a bola', 'Ajoelhar'],
        certa: 0,
        porque: 'Com o joelho perto do outro pé, o corpo fecha o espaço por onde a bola passaria.',
      },
    ],
  },
  {
    id: 'saida-um-contra-um',
    titulo: 'Saída do gol e 1 contra 1',
    emoji: '✝️',
    minutos: 3,
    texto: [
      'Sair do gol é encurtar a distância até a bola. Passos curtos e rápidos, mãos prontas e frear já na posição base.',
      'No 1 contra 1, chegar perto do atacante, ficar baixo e esperar o chute. A cruz (um joelho no chão, a outra perna esticada para o lado, braços abertos) fecha o gol de perto.',
      'Fazer a cruz longe do atacante é o erro mais comum: ele dribla ou chuta por cima. Depois de sair, voltar de costas, sem perder a bola de vista.',
    ],
    dicas: ['Passos curtos na saída', 'Cruz só bem perto', 'Recuo sempre de frente para a bola'],
    quiz: [
      {
        texto: 'Quando fazer a cruz?',
        opcoes: ['Assim que o atacante passar do meio', 'Bem perto do atacante, na hora do chute', 'Nunca'],
        certa: 1,
        porque: 'Perto, a cruz fecha o ângulo; longe, ela deixa espaço para drible ou cobertura.',
      },
      {
        texto: 'Como voltar para o gol depois de sair?',
        opcoes: ['Correndo de costas para a bola', 'De costas, olhando a bola, com passos curtos', 'Andando devagar'],
        certa: 1,
        porque: 'Olhando a bola, o goleiro reage se o atacante chutar.',
      },
      {
        texto: 'Na saída do gol, os passos devem ser...',
        opcoes: ['Longos e lentos', 'Curtos e rápidos', 'Pulos'],
        certa: 1,
        porque: 'Passos curtos permitem frear e mudar de direção.',
      },
    ],
  },
  {
    id: 'reposicao',
    titulo: 'Reposição e saída de bola',
    emoji: '🎯',
    minutos: 3,
    texto: [
      'Depois da defesa, o goleiro olha primeiro se dá contra-ataque. Se o adversário já voltou, sai jogando curto e com calma.',
      'Rolando: rente ao chão, como no boliche, para o companheiro livre. Por cima: lançamento no espaço à frente de quem corre.',
      'Reponha para o lado livre, pelo canto. Perder a bola no meio, perto do próprio gol, é o maior perigo.',
    ],
    dicas: ['Primeiro olhar o contra-ataque', 'Lado livre, nunca o meio congestionado', 'Lançar no espaço, não no pé de quem corre'],
    quiz: [
      {
        texto: 'O adversário está todo recuado. Qual a melhor reposição?',
        opcoes: ['Chutão para frente', 'Curta e segura para o companheiro livre', 'Segurar a bola o máximo possível'],
        certa: 1,
        porque: 'Sem chance de contra-ataque, manter a bola é o mais importante.',
      },
      {
        texto: 'Um companheiro está correndo no contra-ataque. Onde lançar?',
        opcoes: ['No pé dele', 'No espaço à frente dele', 'Atrás dele'],
        certa: 1,
        porque: 'No espaço à frente ele não precisa frear e o adversário não alcança.',
      },
      {
        texto: 'Onde é mais perigoso perder a bola na saída?',
        opcoes: ['Na lateral, longe do gol', 'No meio, perto do próprio gol', 'No campo adversário'],
        certa: 1,
        porque: 'Bola roubada no meio, perto do gol, vira chance clara para o adversário.',
      },
    ],
  },
  {
    id: 'regras',
    titulo: 'Regras do futsal para o goleiro',
    emoji: '📏',
    minutos: 3,
    texto: [
      'No próprio campo, o goleiro pode ficar no máximo 4 segundos com a bola (nas mãos ou nos pés). Passou disso, é tiro livre indireto para o adversário.',
      'O tiro de meta é feito com as MÃOS, de dentro da área, também em até 4 segundos.',
      'Depois de jogar a bola, o goleiro não pode tocar nela de novo no próprio campo até um adversário tocar. E não pode pegar com as mãos uma bola recuada de propósito com o pé por um companheiro.',
      'Regras podem ter adaptações nas categorias de base e em cada federação: confira com o treinador ou a liga da criança.',
    ],
    dicas: ['4 segundos no próprio campo', 'Tiro de meta com a mão', 'Sem 2º toque no próprio campo'],
    quiz: [
      {
        texto: 'Quanto tempo o goleiro pode ficar com a bola no próprio campo?',
        opcoes: ['4 segundos', '10 segundos', 'Quanto quiser'],
        certa: 0,
        porque: 'A regra dos 4 segundos vale com a bola nas mãos ou nos pés, no próprio campo.',
      },
      {
        texto: 'Como é cobrado o tiro de meta no futsal?',
        opcoes: ['Com o pé, no chão', 'Com as mãos, de dentro da área', 'Pelo jogador de linha'],
        certa: 1,
        porque: 'No futsal o tiro de meta é uma reposição com as mãos.',
      },
      {
        texto: 'O goleiro rolou a bola e o companheiro devolveu para ele no próprio campo. Pode pegar?',
        opcoes: ['Pode, sempre', 'Não, até um adversário tocar na bola', 'Só com o pé'],
        certa: 1,
        porque: 'É a regra do 2º toque: no próprio campo, o goleiro só toca de novo depois de um adversário.',
      },
    ],
  },
  {
    id: 'plano-semana',
    titulo: 'Como montar o plano da semana',
    emoji: '📅',
    minutos: 3,
    texto: [
      'Um bom plano tem: aquecimento sempre, um tema por dia (posição, encaixe, quedas, saída, reposição), dias de descanso e repetição ao longo das semanas.',
      'No app: monte um Treino de fundamentos com 4 a 6 gestos (Pais → Treinos de fundamentos), depois coloque nos dias da agenda (toque no dia → Incluir treino).',
      'Comece pelo simples (Baby e Novato) e avance quando a criança fizer o gesto com confiança. Misture com jogos (Reação, Futsal Tático) para manter a diversão.',
    ],
    dicas: ['Aquecer + 1 tema + descanso', '4 a 6 gestos por treino', 'Avançar quando estiver confiante'],
    quiz: [
      {
        texto: 'Quantos gestos é um bom tamanho para um treino de fundamentos?',
        opcoes: ['1', '4 a 6', '20'],
        certa: 1,
        porque: 'De 4 a 6 gestos dá para repetir bem sem cansar demais.',
      },
      {
        texto: 'Como colocar um treino de fundamentos num dia da agenda?',
        opcoes: ['Não dá', 'Tocar no dia no calendário dos Pais → Incluir treino', 'Pedir para a criança'],
        certa: 1,
        porque: 'Na área dos Pais, o calendário deixa incluir qualquer treino salvo.',
      },
      {
        texto: 'Descanso no plano da semana é...',
        opcoes: ['Perda de tempo', 'Parte do treino: o corpo fica forte descansando', 'Só para adultos'],
        certa: 1,
        porque: 'O descanso ajuda o corpo a se recuperar e evita lesões e cansaço.',
      },
    ],
  },
]

export const licaoPorId = (id: string | undefined) => LICOES.find((l) => l.id === id)
