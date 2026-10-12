// Conta → responsável com família: os atletas (filhos), qual usa este aparelho, ligar o aparelho de
// cada um por código, convidar o outro responsável, privacidade, sair e apagar.
import { useState } from 'react'
import {
  adicionarAtleta,
  apagarAtleta,
  apagarConta,
  desligarAparelho,
  gerarCodigoAparelho,
  gerarCodigoResponsavel,
  listarAparelhos,
  renomearAtleta,
  sairDaConta,
  trocarAtleta,
  usarEsteAparelhoComoAtletaNovo,
} from '../../conta/conta'
import { useContaStore, type Atleta, type EstadoSincronia } from '../../conta/contaStore'
import { Modal } from '../../components/ui/Modal'
import { useUserStore } from '../../stores/userStore'
import { AvisoPrivacidade } from './AvisoPrivacidade'
import { CampoApelido } from './CampoApelido'
import { EscolinhaDoAtleta } from './EscolinhaDoAtleta'
import { BOTAO, useAcao } from './acao'
import { Cartao, CodigoGrande, MensagemErro } from './comum'

const ESTADOS: Record<EstadoSincronia, string> = {
  parada: '⏸️ Parada',
  sincronizando: '🔄 Sincronizando…',
  'em-dia': '✅ Em dia',
  'sem-internet': '📴 Sem internet (envia quando voltar)',
  erro: '⚠️ Problema',
}

export function Sincronia() {
  const { estado, erro, sincronizadoEm } = useContaStore()
  return (
    <p className="text-sm">
      {ESTADOS[estado]}
      {estado === 'em-dia' && sincronizadoEm && ` às ${new Date(sincronizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
      {estado === 'erro' && erro && <span className="block font-bold text-red-700">{erro}</span>}
    </p>
  )
}

/** Responsável que entrou, tem família, mas este aparelho ainda não é de nenhum atleta */
export function EscolherAtleta() {
  const { email, atletas } = useContaStore()
  const apelidoAqui = useUserStore((s) => s.apelido)
  const [apelido, setApelido] = useState(apelidoAqui)
  const { ocupado, erro, rodar } = useAcao()
  return (
    <Cartao titulo="☁️ Quem usa este aparelho?">
      <p className="text-sm">Conta: {email}</p>
      {atletas.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-bold">Escolha o atleta (para treinar aqui ou montar o plano dele):</p>
          {atletas.map((a) => (
            <button key={a.id} type="button" disabled={ocupado} onClick={() => rodar(() => trocarAtleta(a.id))} className={`${BOTAO} bg-white text-left`}>
              {a.apelido} ▶️
            </button>
          ))}
          <p className="text-xs">O que este aparelho tinha antes fica guardado nele.</p>
        </div>
      )}
      <div className="flex flex-col gap-2 rounded-2xl bg-white p-3">
        <p className="font-bold">{atletas.length > 0 ? 'Ou crie' : 'Crie'} um atleta com os dados que já estão neste aparelho</p>
        <CampoApelido valor={apelido} aoMudar={setApelido} />
        <button type="button" disabled={ocupado || !apelido.trim()} onClick={() => rodar(() => usarEsteAparelhoComoAtletaNovo(apelido.trim()))} className={`${BOTAO} bg-sol`}>
          ✅ Criar e usar neste aparelho
        </button>
      </div>
      <MensagemErro erro={erro} />
    </Cartao>
  )
}

/** Responsável com família e um atleta neste aparelho */
export function ContaDoResponsavel() {
  const { email, atletas, atletaAtivo } = useContaStore()
  const [novo, setNovo] = useState('')
  const [codigo, setCodigo] = useState<{ codigo: string; legenda: string } | null>(null)
  const [renomeando, setRenomeando] = useState<Atleta | null>(null)
  const [apagando, setApagando] = useState<Atleta | null>(null)
  const [aparelhos, setAparelhos] = useState<{ atleta: Atleta; lista: { id: string; em: number }[] } | null>(null)
  const [apagarTudo, setApagarTudo] = useState(false)
  const [confirmacao, setConfirmacao] = useState('')
  const { ocupado, erro, rodar } = useAcao()

  return (
    <Cartao titulo="☁️ Conta da família">
      <p className="text-sm">{email}</p>
      <Sincronia />

      <ul className="flex flex-col gap-2">
        {atletas.map((a) => {
          const aqui = a.id === atletaAtivo
          return (
            <li key={a.id} className={`flex flex-col gap-2 rounded-2xl border-4 p-2 ${aqui ? 'border-green-400 bg-green-50' : 'border-transparent bg-white'}`}>
              <p className="text-lg font-extrabold">
                {a.apelido} {aqui && <span className="rounded-full bg-green-600 px-2 text-xs text-white">NESTE APARELHO</span>}
              </p>
              <EscolinhaDoAtleta atleta={a} />
              <div className="flex flex-wrap gap-2">
                {!aqui && (
                  <button type="button" disabled={ocupado} onClick={() => rodar(() => trocarAtleta(a.id))} className={`${BOTAO} bg-sol`}>
                    📋 Montar o plano / usar aqui
                  </button>
                )}
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() =>
                    rodar(async () =>
                      setCodigo({
                        codigo: await gerarCodigoAparelho(a.id),
                        legenda: `No aparelho de ${a.apelido}: Conta → "Este é o aparelho da criança" → digite o código. Vale por 24 horas, uma vez só.`,
                      }),
                    )
                  }
                  className={`${BOTAO} bg-white`}
                >
                  📱 Ligar o aparelho dele
                </button>
                <button type="button" disabled={ocupado} onClick={() => rodar(async () => setAparelhos({ atleta: a, lista: await listarAparelhos(a.id) }))} className={`${BOTAO} bg-white`}>
                  🔗 Aparelhos
                </button>
                <button type="button" onClick={() => setRenomeando(a)} className={`${BOTAO} bg-white`} aria-label={`Mudar o apelido de ${a.apelido}`}>
                  ✏️
                </button>
                {!aqui && (
                  <button type="button" onClick={() => setApagando(a)} className={`${BOTAO} bg-white text-red-700`} aria-label={`Apagar ${a.apelido}`}>
                    🗑️
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-2 rounded-2xl bg-white p-3">
        <p className="font-bold">➕ Adicionar atleta (filho)</p>
        <CampoApelido valor={novo} aoMudar={setNovo} />
        <button
          type="button"
          disabled={ocupado || !novo.trim()}
          onClick={() =>
            rodar(async () => {
              await adicionarAtleta(novo.trim())
              setNovo('')
            })
          }
          className={`${BOTAO} bg-sky-600 text-white`}
        >
          Adicionar
        </button>
      </div>

      <button
        type="button"
        disabled={ocupado}
        onClick={() =>
          rodar(async () =>
            setCodigo({
              codigo: await gerarCodigoResponsavel(),
              legenda: 'O outro responsável entra na conta dele (Google ou e-mail) e, em "Sua família", digita este código. Vale por 7 dias, uma vez só.',
            }),
          )
        }
        className={`${BOTAO} bg-white`}
      >
        👥 Convidar o outro responsável (pai/mãe)
      </button>

      <MensagemErro erro={erro} />

      <details className="rounded-2xl bg-white p-3">
        <summary className="cursor-pointer font-bold">Privacidade, sair e apagar</summary>
        <div className="mt-2 flex flex-col gap-2">
          <AvisoPrivacidade aberto />
          <button type="button" disabled={ocupado} onClick={() => rodar(sairDaConta)} className={`${BOTAO} bg-white`}>
            🚪 Sair da conta neste aparelho
          </button>
          <button type="button" onClick={() => setApagarTudo(true)} className={`${BOTAO} bg-red-600 text-white`}>
            Apagar a minha conta
          </button>
        </div>
      </details>

      <Modal aberto={codigo !== null} aoFechar={() => setCodigo(null)} titulo="Código">
        {codigo && <CodigoGrande codigo={codigo.codigo} legenda={codigo.legenda} />}
      </Modal>

      <Modal aberto={aparelhos !== null} aoFechar={() => setAparelhos(null)} titulo="Aparelhos ligados">
        {aparelhos && (
          <div className="flex flex-col gap-2">
            {aparelhos.lista.length === 0 && <p>Nenhum aparelho de criança ligado a {aparelhos.atleta.apelido}.</p>}
            {aparelhos.lista.map((ap) => (
              <div key={ap.id} className="flex items-center justify-between gap-2 rounded-xl bg-white p-2">
                <span className="text-sm">Ligado em {new Date(ap.em).toLocaleDateString('pt-BR')}</span>
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() =>
                    rodar(async () => {
                      await desligarAparelho(aparelhos.atleta.id, ap.id)
                      setAparelhos({ ...aparelhos, lista: aparelhos.lista.filter((x) => x.id !== ap.id) })
                    })
                  }
                  className={`${BOTAO} bg-white text-red-700`}
                >
                  Desligar
                </button>
              </div>
            ))}
            <p className="text-xs">Desligar tira o acesso daquele aparelho aos dados do atleta (ex.: tablet perdido).</p>
          </div>
        )}
      </Modal>

      <Modal aberto={renomeando !== null} aoFechar={() => setRenomeando(null)} titulo="Apelido do atleta">
        {renomeando && (
          <div className="flex flex-col gap-3">
            <CampoApelido valor={renomeando.apelido} aoMudar={(apelido) => setRenomeando({ ...renomeando, apelido })} />
            <button
              type="button"
              disabled={ocupado || !renomeando.apelido.trim()}
              onClick={() =>
                rodar(async () => {
                  await renomearAtleta(renomeando.id, renomeando.apelido.trim())
                  setRenomeando(null)
                })
              }
              className={`${BOTAO} bg-sol`}
            >
              Salvar
            </button>
          </div>
        )}
      </Modal>

      <Modal aberto={apagando !== null} aoFechar={() => setApagando(null)} titulo="Apagar atleta">
        {apagando && (
          <div className="flex flex-col gap-3">
            <p className="text-base">
              Apaga <b>{apagando.apelido}</b> da conta e da nuvem: plano, progresso e conquistas. Não dá para desfazer.
            </p>
            <button
              type="button"
              disabled={ocupado}
              onClick={() =>
                rodar(async () => {
                  await apagarAtleta(apagando.id)
                  setApagando(null)
                })
              }
              className={`${BOTAO} bg-red-600 text-white`}
            >
              Apagar {apagando.apelido}
            </button>
          </div>
        )}
      </Modal>

      <Modal aberto={apagarTudo} aoFechar={() => setApagarTudo(false)} titulo="Apagar a minha conta">
        <div className="flex flex-col gap-3">
          <p className="text-base">
            Se você é o <b>único responsável</b>, apaga da nuvem tudo da família: atletas, planos, progresso. Se há outro responsável, você só sai
            da família e os dados continuam com ele. Neste aparelho ficam só os dados do atleta que está nele. Não dá para desfazer.
          </p>
          <label className="flex flex-col gap-1 text-sm font-bold">
            Escreva APAGAR para confirmar
            <input value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} className="min-h-12 rounded-xl border-2 border-red-200 px-3 text-base" />
          </label>
          <MensagemErro erro={erro} />
          <button
            type="button"
            disabled={ocupado || confirmacao.trim().toUpperCase() !== 'APAGAR'}
            onClick={() =>
              rodar(async () => {
                await apagarConta()
                setApagarTudo(false)
              })
            }
            className={`${BOTAO} bg-red-600 text-white`}
          >
            {ocupado ? 'Apagando…' : 'Apagar'}
          </button>
        </div>
      </Modal>
    </Cartao>
  )
}
