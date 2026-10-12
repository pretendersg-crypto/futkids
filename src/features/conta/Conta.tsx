// Painel da conta (área dos pais e página /conta): mostra a etapa certa conforme o estado do aparelho.
//   sem configurar → "em breve" | não entrou → Entrar | responsável sem família → SemFamilia |
//   família sem atleta neste aparelho → EscolherAtleta | responsável → ContaDoResponsavel |
//   aparelho da criança → só o atleta dele e sair (com o PIN da área dos pais)
import { useEffect } from 'react'
import { contaConfigurada, retomarEntrada, sairDaConta } from '../../conta/conta'
import { useContaStore } from '../../conta/contaStore'
import { ContaDoResponsavel, EscolherAtleta, Sincronia } from './Atletas'
import { BOTAO, useAcao } from './acao'
import { Cartao, MensagemErro } from './comum'
import { Entrar } from './Entrar'
import { SemFamilia } from './Familia'

export function Conta() {
  const { uid, aparelhoDaCrianca, familia, atletaAtivo } = useContaStore()

  // Quem foi para a página do Google (janela bloqueada) volta logado: continua daqui
  useEffect(() => {
    if (!uid) void retomarEntrada().catch(() => undefined)
  }, [uid])

  if (!contaConfigurada()) {
    return (
      <Cartao titulo="☁️ Conta">
        <p className="text-base">Em breve: entrar com Google ou e-mail para montar o plano de cada atleta e ele chegar no aparelho da criança.</p>
      </Cartao>
    )
  }
  if (!uid) return <Entrar />
  if (aparelhoDaCrianca) return <AparelhoDaCrianca />
  if (!familia) return <SemFamilia />
  if (!atletaAtivo) return <EscolherAtleta />
  return <ContaDoResponsavel />
}

function AparelhoDaCrianca() {
  const { atletas, atletaAtivo } = useContaStore()
  const { ocupado, erro, rodar } = useAcao()
  const apelido = atletas.find((a) => a.id === atletaAtivo)?.apelido
  return (
    <Cartao titulo={`📱 Aparelho de ${apelido ?? 'atleta'}`}>
      <Sincronia />
      <p className="text-sm">O plano montado pelo responsável chega aqui sozinho, e o progresso vai para a conta.</p>
      <MensagemErro erro={erro} />
      <button type="button" disabled={ocupado} onClick={() => rodar(sairDaConta)} className={`${BOTAO} bg-white`}>
        🚪 Desligar este aparelho da conta
      </button>
    </Cartao>
  )
}
