// Conta → responsável que entrou e ainda não tem família: criar a família ou entrar na do outro
// responsável (pai/mãe) com o código que ele gerou.
import { useState } from 'react'
import { codigoCompleto, lerCodigo } from '../../conta/codigos'
import { criarFamilia, entrarNaFamilia, sairDaConta } from '../../conta/conta'
import { useContaStore } from '../../conta/contaStore'
import { BOTAO, useAcao } from './acao'
import { Cartao, MensagemErro } from './comum'

export function SemFamilia() {
  const email = useContaStore((s) => s.email)
  const [codigo, setCodigo] = useState('')
  const { ocupado, erro, rodar } = useAcao()
  return (
    <Cartao titulo="👨‍👩‍👧 Sua família">
      <p className="text-sm">Conta: {email}</p>
      <button type="button" disabled={ocupado} onClick={() => rodar(criarFamilia)} className={`${BOTAO} bg-sol`}>
        ✨ Criar a minha família
      </button>
      <div className="flex flex-col gap-2 rounded-2xl bg-white p-3">
        <p className="font-bold">O outro responsável já criou? Digite o código que ele gerou</p>
        <input
          value={codigo}
          onChange={(e) => setCodigo(lerCodigo(e.target.value))}
          placeholder="ABCD-2345"
          autoCapitalize="characters"
          aria-label="Código do responsável"
          className="min-h-12 rounded-xl border-2 border-sky-200 px-3 text-center font-mono text-2xl font-black tracking-widest uppercase"
        />
        <button type="button" disabled={ocupado || !codigoCompleto(codigo)} onClick={() => rodar(() => entrarNaFamilia(codigo))} className={`${BOTAO} bg-sky-600 text-white`}>
          Entrar na família
        </button>
      </div>
      <MensagemErro erro={erro} />
      <button type="button" disabled={ocupado} onClick={() => rodar(sairDaConta)} className="self-start text-sm font-bold underline">
        Sair desta conta
      </button>
    </Cartao>
  )
}
