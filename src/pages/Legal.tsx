// Páginas públicas /privacidade e /termos (fora da barra de baixo, abrem sem conta).
// RASCUNHO: os dados do controlador ficam em src/data/legal.ts e o texto deve passar por um advogado
// antes de abrir o app ao público (dados de crianças, LGPD art. 14).
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { CONTROLADOR, RASCUNHO, VERSAO_TERMOS } from '../data/legal'

function Pagina({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 bg-white p-4 text-base leading-relaxed">
      <header className="flex items-center gap-3">
        <Link to="/" aria-label="Voltar ao app" className="grid size-12 shrink-0 place-items-center rounded-full bg-sky-50 text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">{titulo}</h1>
      </header>
      {RASCUNHO && (
        <p role="note" className="rounded-2xl border-4 border-amber-400 bg-amber-50 p-3 font-bold">
          ⚠️ Rascunho: este texto ainda vai ser revisado e completado antes de o app abrir ao público.
        </p>
      )}
      <p className="text-sm">Versão {VERSAO_TERMOS}</p>
      {children}
      <nav className="flex gap-4 border-t pt-3 text-sm font-bold underline">
        <Link to="/privacidade">Política de Privacidade</Link>
        <Link to="/termos">Termos de Uso</Link>
      </nav>
    </main>
  )
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-extrabold">{titulo}</h2>
      {children}
    </section>
  )
}

const Lista = ({ itens }: { itens: ReactNode[] }) => (
  <ul className="flex list-disc flex-col gap-1 pl-6">
    {itens.map((i, n) => (
      <li key={n}>{i}</li>
    ))}
  </ul>
)

export function Privacidade() {
  return (
    <Pagina titulo="🔒 Política de Privacidade">
      <p>
        O FutKids é um app de treino de futebol e goleiro para crianças de 6 a 12 anos. Esta política explica, em linguagem simples, quais dados o
        app usa, para quê e como você controla isso. O app <b>não tem anúncios</b> e <b>não vende nem passa dados</b> para ninguém.
      </p>

      <Secao titulo="1. Quem é o responsável pelos dados">
        <p>
          {CONTROLADOR.nome} ({CONTROLADOR.documento}), {CONTROLADOR.cidade}. Contato para qualquer pedido sobre dados: <b>{CONTROLADOR.email}</b>.
        </p>
      </Secao>

      <Secao titulo="2. Sem conta: tudo fica no aparelho">
        <p>
          Sem entrar numa conta, o app guarda tudo <b>só no próprio aparelho</b>: apelido e avatar do jogador, treinos feitos, pontos, conquistas,
          agenda, fotos e vídeos gravados. Nada disso sai do aparelho. Apagar os dados do site no navegador (ou desinstalar o app) apaga tudo.
        </p>
      </Secao>

      <Secao titulo="3. Com a conta (opcional)">
        <p>A conta existe para o plano montado pelo responsável ou pelo treinador chegar no aparelho da criança. Com ela, guardamos na nuvem:</p>
        <Lista
          itens={[
            <>
              <b>Do responsável e do treinador:</b> o e-mail da conta Google ou o e-mail usado para entrar, e a data em que aceitou esta política.
            </>,
            <>
              <b>Da criança:</b> só um <b>apelido</b> (nunca o nome verdadeiro), o avatar desenhado, os planos de treino e o progresso (treinos feitos,
              pontos, nível, conquistas e resultados dos jogos do app).
            </>,
            <>
              <b>Da escolinha:</b> nome da escolinha e das turmas, o plano de treino da turma e os <b>vídeos enviados pelo treinador</b> (para a turma
              ou só para um atleta).
            </>,
          ]}
        />
        <p>
          <b>Nunca pedimos</b> nome verdadeiro, foto, data de nascimento, documento, escola, endereço, telefone ou localização da criança. Fotos e
          vídeos gravados pela família no app <b>não vão</b> para a nuvem. Os vídeos que o <b>treinador</b> envia ficam guardados no Google Firebase
          (Cloud Storage), visíveis só para a turma ou o atleta para quem foram enviados.
        </p>
      </Secao>

      <Secao titulo="4. Crianças e o consentimento do responsável">
        <p>
          Crianças não criam conta. Quem cria a conta, cadastra o atleta pelo apelido e liga o aparelho da criança é o <b>responsável</b> (pai, mãe ou
          responsável legal), que dá o consentimento específico para o tratamento dos dados da criança, como pede a LGPD (Lei 13.709/2018, art. 14).
        </p>
        <p>
          Quando o atleta entra numa turma de escolinha, o responsável <b>autoriza</b> os treinadores daquela escolinha a <b>ver</b> os treinos dele
          (nível, pontos, dias e treinos feitos e conquistas). O responsável pode tirar o atleta da escolinha a qualquer momento, e o acesso do
          treinador acaba na hora.
        </p>
      </Secao>

      <Secao titulo="5. Para que usamos os dados">
        <Lista
          itens={[
            'Mostrar o plano de treino no aparelho da criança e sincronizar entre os aparelhos da família.',
            'Mostrar o progresso da criança para o responsável e, com autorização, para o treinador da escolinha.',
            'Proteger o serviço contra uso indevido (ex.: verificação de que o acesso vem do app).',
          ]}
        />
        <p>Não usamos os dados para publicidade, perfil de consumo ou decisões automatizadas sobre a criança.</p>
      </Secao>

      <Secao titulo="6. Com quem os dados ficam">
        <Lista
          itens={[
            <>
              <b>Google Firebase</b> (operador): guarda a conta e os dados na nuvem. O banco de dados fica no Brasil (São Paulo). O login da conta é
              processado pelo Google, que pode guardar dados fora do Brasil, com as garantias da LGPD para transferência internacional.
            </>,
            <>
              <b>Treinadores da escolinha</b>: só os dados de treino dos atletas que o responsável autorizou.
            </>,
            <>
              <b>Mercado Pago</b>: quando uma escolinha (ou família) assina um plano pago, o pagamento é feito no Mercado Pago, que trata os dados de
              pagamento. O FutKids guarda só o e-mail de quem pagou, o plano, a validade e os números de referência do pagamento.
            </>,
            'Autoridades, apenas quando a lei obrigar.',
          ]}
        />
      </Secao>

      <Secao titulo="7. Por quanto tempo">
        <p>
          Enquanto a conta existir. Ao apagar a conta (sendo o único responsável), apagamos da nuvem todos os dados da família e dos atletas. Cópias
          de segurança do provedor são apagadas nos prazos dele.
        </p>
      </Secao>

      <Secao titulo="8. Seus direitos">
        <p>Você pode, a qualquer momento:</p>
        <Lista
          itens={[
            'ver e baixar os dados (Conta → Privacidade → "Baixar os meus dados");',
            'corrigir o apelido e os dados do atleta;',
            'tirar o atleta de uma escolinha (retirar a autorização);',
            'apagar a conta e todos os dados da nuvem (Conta → Privacidade → "Apagar a minha conta");',
            <>
              pedir informações ou qualquer outro direito da LGPD (art. 18) pelo e-mail <b>{CONTROLADOR.email}</b>.
            </>,
          ]}
        />
      </Secao>

      <Secao titulo="9. Segurança">
        <p>
          Os dados vão criptografados pela internet. Regras de acesso no banco de dados garantem que cada família só vê o que é dela, que o aparelho
          da criança só vê o próprio atleta e que o treinador só lê o treino dos atletas autorizados. O PIN da área dos pais é guardado de forma
          embaralhada (hash), nunca o número em si.
        </p>
      </Secao>

      <Secao titulo="10. Armazenamento no aparelho">
        <p>
          O app usa o armazenamento do navegador (localStorage e IndexedDB) para funcionar sem internet. Não usamos cookies de propaganda nem
          ferramentas de análise de uso.
        </p>
      </Secao>

      <Secao titulo="11. Mudanças nesta política">
        <p>Se a política mudar, avisamos no app e pedimos um novo aceite quando a mudança afetar os dados da conta.</p>
      </Secao>
    </Pagina>
  )
}

export function Termos() {
  return (
    <Pagina titulo="📄 Termos de Uso">
      <Secao titulo="1. O que é o FutKids">
        <p>
          Um app de treino de futebol e goleiro para crianças, com jogos, treinos animados e agenda. Responsáveis e treinadores podem montar planos de
          treino. O serviço é oferecido por {CONTROLADOR.nome} ({CONTROLADOR.documento}).
        </p>
      </Secao>

      <Secao titulo="2. Quem pode ter conta">
        <p>
          Só adultos (18 anos ou mais): o responsável pela criança ou o treinador. Crianças usam o app sem conta própria, no aparelho ligado pelo
          responsável. Ao criar a conta, você confirma que é o responsável legal pelas crianças que cadastra.
        </p>
      </Secao>

      <Secao titulo="3. Segurança nos treinos">
        <Lista
          itens={[
            'Os treinos são orientações gerais e não substituem a avaliação de um médico ou de um profissional de educação física.',
            'Toda atividade física de criança deve ter a supervisão de um adulto, em lugar seguro e com aquecimento antes.',
            'Se a criança sentir dor, tontura ou falta de ar, pare o treino e procure um médico.',
            'Os vídeos de terceiros (YouTube, cursos) são responsabilidade de quem os publicou.',
          ]}
        />
      </Secao>

      <Secao titulo="4. Escolinhas e treinadores">
        <Lista
          itens={[
            'O treinador só vê os treinos dos atletas cuja família autorizou, e usa essas informações apenas para acompanhar o treino na escolinha.',
            'É proibido copiar, divulgar ou usar os dados dos atletas para outro fim, ou cadastrar o nome verdadeiro de uma criança no lugar do apelido.',
            'Vídeos: o treinador só envia vídeos em que as crianças que aparecem tenham autorização dos responsáveis (ele declara isso a cada envio). Os vídeos ficam visíveis só para a turma ou o atleta escolhido, dentro do app, e não podem ser publicados fora dele. O treinador apaga quando quiser; apagar a turma ou a escolinha apaga os vídeos.',
            'A escolinha é responsável pelo uso que seus treinadores fazem do app e deve tirar o acesso de quem sair da equipe.',
            'O plano grátis tem limites (treinadores, turmas e atletas). Os planos pagos aumentam esses limites; preço e condições aparecem na tela "Planos" antes de pagar.',
          ]}
        />
      </Secao>

      <Secao titulo="5. Pagamentos, renovação e cancelamento">
        <Lista
          itens={[
            'Os pagamentos são feitos pelo Mercado Pago (Pix, cartão ou boleto). O FutKids não recebe nem guarda os dados do cartão.',
            'Assinatura mensal no cartão: renova sozinha todo mês até ser cancelada. Cancelar para a renovação; o plano continua até o fim do período já pago.',
            'Pagamento avulso (1 mês ou 1 ano): vale pelo período pago e não renova sozinho.',
            'O plano pago começa quando o Mercado Pago confirma o pagamento. Ao vencer sem renovação, a escolinha volta ao plano grátis: nada é apagado, mas novas turmas, treinadores e atletas acima do limite ficam bloqueados.',
            'Direito de arrependimento: até 7 dias depois do pagamento, você pode pedir a devolução integral (Código de Defesa do Consumidor, art. 49) pelo e-mail de contato.',
          ]}
        />
      </Secao>

      <Secao titulo="6. Uso correto">
        <p>
          Não use o app para nada ilegal, ofensivo ou que coloque crianças em risco. Não tente acessar dados de outras famílias ou burlar as proteções do
          serviço. Podemos suspender contas que descumprirem estes termos.
        </p>
      </Secao>

      <Secao titulo="7. Disponibilidade">
        <p>
          O app funciona sem internet, mas a conta e a sincronia dependem dela e de serviços de terceiros (Google Firebase). Podemos mudar ou
          encerrar recursos, avisando antes quando afetar a conta.
        </p>
      </Secao>

      <Secao titulo="8. Seus dados">
        <p>
          O tratamento de dados segue a <Link to="/privacidade" className="font-bold underline">Política de Privacidade</Link>. Você pode baixar ou
          apagar seus dados a qualquer momento na tela da conta.
        </p>
      </Secao>

      <Secao titulo="9. Lei e foro">
        <p>
          Estes termos seguem as leis do Brasil. Fica eleito o foro de {CONTROLADOR.cidade}, sem prejuízo do direito do consumidor de usar o foro do
          próprio domicílio. Dúvidas: {CONTROLADOR.email}.
        </p>
      </Secao>
    </Pagina>
  )
}
