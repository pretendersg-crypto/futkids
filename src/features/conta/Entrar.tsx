// Conta → ainda não entrou: dois caminhos.
//  - Responsável (pai, mãe) ou treinador: aceita o aviso e entra com Google ou com link no e-mail;
//  - Aparelho da criança: digita o código do atleta (gerado pelo responsável), sem e-mail nenhum.
import { useState } from 'react'
import { codigoCompleto, lerCodigo } from '../../conta/codigos'
import { entrarComGoogle, enviarLinkPorEmail, ligarAparelhoDaCrianca } from '../../conta/conta'
import { useProgressStore } from '../../stores/progressStore'
import { useUserStore } from '../../stores/userStore'
import { nivelPorXP } from '../../utils/nivel'
import { AvisoPrivacidade } from './AvisoPrivacidade'
import { BOTAO, useAcao } from './acao'
import { Cartao, MensagemErro } from './comum'

export function Entrar() {
  const [caminho, setCaminho] = useState<'adulto' | 'crianca' | null>(null)
  if (caminho === 'adulto') return <EntrarAdulto aoVoltar={() => setCaminho(null)} />
  if (caminho === 'crianca') return <EntrarCrianca aoVoltar={() => setCaminho(null)} />
  return (
    <Cartao titulo="☁️ Conta">
      <p className="text-base">
        Com a conta, o plano montado pelos pais (ou pelo treinador) chega no aparelho da criança, e o progresso dela volta para quem montou.
      </p>
      <button type="button" onClick={() => setCaminho('adulto')} className={`${BOTAO} bg-white text-left`}>
        👨‍👩‍👧 Sou o responsável (pai ou mãe)
      </button>
      <button type="button" onClick={() => setCaminho('crianca')} className={`${BOTAO} bg-white text-left`}>
        📱 Este é o aparelho da criança (tenho um código)
      </button>
    </Cartao>
  )
}

function EntrarAdulto({ aoVoltar }: { aoVoltar: () => void }) {
  const [aceito, setAceito] = useState(false)
  const [email, setEmail] = useState('')
  const [linkEnviado, setLinkEnviado] = useState(false)
  const { ocupado, erro, rodar } = useAcao()

  return (
    <Cartao titulo="👨‍👩‍👧 Entrar como responsável">
      <AvisoPrivacidade />
      <label className="flex items-start gap-3 text-base font-bold">
        <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} className="mt-1 size-6 shrink-0 accent-sky-600" />
        Sou o responsável pela criança e concordo com o aviso acima.
      </label>

      <button type="button" disabled={!aceito || ocupado} onClick={() => rodar(entrarComGoogle)} className={`${BOTAO} bg-white`}>
        🔐 Entrar com Google
      </button>

      <div className="flex flex-col gap-2 rounded-2xl bg-white p-3">
        <label className="flex flex-col gap-1 text-sm font-bold">
          Ou receba um link de entrada no e-mail (sem senha)
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="min-h-12 rounded-xl border-2 border-sky-200 px-3 text-base font-normal"
          />
        </label>
        <button
          type="button"
          disabled={!aceito || ocupado || !email.includes('@')}
          onClick={() =>
            rodar(async () => {
              await enviarLinkPorEmail(email.trim())
              setLinkEnviado(true)
            })
          }
          className={`${BOTAO} bg-sky-600 text-white`}
        >
          ✉️ Receber o link
        </button>
        {linkEnviado && (
          <p className="rounded-xl bg-green-50 p-2 text-sm font-bold">
            ✅ Link enviado para {email}. Abra o e-mail <u>neste aparelho</u> e toque no link. Não chegou? Olhe a caixa de spam.
          </p>
        )}
      </div>
      <MensagemErro erro={erro} />
      <button type="button" onClick={aoVoltar} className="self-start text-sm font-bold underline">
        ← Voltar
      </button>
    </Cartao>
  )
}

function EntrarCrianca({ aoVoltar }: { aoVoltar: () => void }) {
  const [codigo, setCodigo] = useState('')
  const apelido = useUserStore((s) => s.apelido)
  const nivel = nivelPorXP(useProgressStore((s) => s.xp)).nivel
  const [usarDadosDaqui, setUsarDadosDaqui] = useState(false)
  const { ocupado, erro, rodar } = useAcao()

  return (
    <Cartao titulo="📱 Ligar o aparelho da criança">
      <p className="text-base">
        No celular do responsável: Conta → atleta → <b>📱 Ligar o aparelho dele</b>. Digite aqui o código que aparecer.
      </p>
      <input
        value={codigo}
        onChange={(e) => setCodigo(lerCodigo(e.target.value))}
        placeholder="ABCD-2345"
        autoCapitalize="characters"
        autoComplete="off"
        aria-label="Código do atleta"
        className="min-h-14 rounded-2xl border-4 border-sky-200 px-4 text-center font-mono text-3xl font-black tracking-widest uppercase"
      />
      {apelido && (
        <fieldset className="flex flex-col gap-2 rounded-2xl bg-white p-3 text-base">
          <legend className="px-1 font-bold">Este aparelho já tem o jogador {apelido} (nível {nivel})</legend>
          <label className="flex items-start gap-2">
            <input type="radio" name="dados" checked={!usarDadosDaqui} onChange={() => setUsarDadosDaqui(false)} className="mt-1 size-5" />
            Usar o que já está na conta (o deste aparelho fica guardado nele)
          </label>
          <label className="flex items-start gap-2">
            <input type="radio" name="dados" checked={usarDadosDaqui} onChange={() => setUsarDadosDaqui(true)} className="mt-1 size-5" />
            Levar o jogador e o progresso deste aparelho para a conta
          </label>
        </fieldset>
      )}
      <button
        type="button"
        disabled={ocupado || !codigoCompleto(codigo)}
        onClick={() => rodar(() => ligarAparelhoDaCrianca(codigo, usarDadosDaqui))}
        className={`${BOTAO} bg-sol`}
      >
        {ocupado ? 'Ligando…' : '✅ Ligar este aparelho'}
      </button>
      <MensagemErro erro={erro} />
      <button type="button" onClick={aoVoltar} className="self-start text-sm font-bold underline">
        ← Voltar
      </button>
    </Cartao>
  )
}
