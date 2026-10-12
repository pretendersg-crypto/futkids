// Quem é o responsável pelo FutKids (o "controlador" dos dados, na LGPD) e as versões dos textos
// legais. PREENCHA antes de abrir o app ao público e peça a revisão de um advogado: o app trata dados
// de crianças (LGPD art. 14). Enquanto RASCUNHO = true, as páginas mostram o aviso de rascunho.

export const RASCUNHO = true

export const CONTROLADOR = {
  /** Nome completo (pessoa física) ou razão social (empresa) */
  nome: 'Luiz Antônio Rosanelli Dalla Costa',
  /**
   * CPF ou CNPJ. Vazio por enquanto: o site e o código são públicos, e um CPF publicado fica exposto.
   * Preencher com o CNPJ quando houver (obrigatório para vender online, Decreto 7.962/2013).
   */
  documento: '',
  /** Cidade/UF (foro) */
  cidade: 'Santana do Livramento/RS',
  /** E-mail para pedidos de privacidade (acesso, correção, exclusão) e dúvidas */
  email: 'pretendersg@gmail.com',
}

/** Versão da Política de Privacidade e dos Termos (mude quando o texto mudar: o aceite guarda esta versão) */
export const VERSAO_TERMOS = '2026-10-12c'
