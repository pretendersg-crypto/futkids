// Aviso de privacidade da conta da família (LGPD: dados de crianças só com o responsável, o mínimo
// necessário, para uma finalidade clara, e com como apagar).
export function AvisoPrivacidade({ aberto = false }: { aberto?: boolean }) {
  return (
    <details open={aberto} className="rounded-2xl bg-white p-3 text-sm">
      <summary className="cursor-pointer text-base font-bold">🔒 Aviso de privacidade</summary>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
        <li>
          <b>O que fica na nuvem:</b> o e-mail da conta Google do responsável, os <b>apelidos</b> dos filhos, os planos de treino e o progresso
          (treinos feitos, pontos, conquistas).
        </li>
        <li>
          <b>O que nunca pedimos:</b> nome verdadeiro, foto, data de nascimento, escola, endereço ou telefone da criança. Fotos e vídeos gravados
          no app continuam só no aparelho.
        </li>
        <li>
          <b>Para quê:</b> só para o plano montado pelos pais chegar no aparelho da criança e os pais acompanharem o progresso.
        </li>
        <li>
          <b>Onde:</b> no Firebase (serviço do Google). Só a sua conta lê e grava os dados da sua família.
        </li>
        <li>
          <b>Sem anúncios</b> e sem vender ou passar os dados para ninguém.
        </li>
        <li>
          <b>Apagar:</b> a qualquer momento, em "Apagar a conta e todos os dados da nuvem".
        </li>
      </ul>
    </details>
  )
}
