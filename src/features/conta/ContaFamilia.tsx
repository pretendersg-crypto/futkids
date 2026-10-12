// Área dos pais → ☁️ Conta da família: login com Google do responsável, os filhos (só apelidos), qual
// filho usa este aparelho, a sincronia e apagar tudo. Fica dentro da área dos pais (já pede o PIN).
import { useState, type ReactNode } from 'react'
import { Modal } from '../../components/ui/Modal'
import {
  adicionarFilho,
  apagarContaDaFamilia,
  apagarFilho,
  contaConfigurada,
  entrar,
  renomearFilho,
  sairDaConta,
  trocarFilho,
  vincularAFilhoExistente,
  vincularComoFilhoNovo,
  type ResultadoEntrada,
} from '../../conta/conta'
import { useContaStore, type EstadoSincronia } from '../../conta/contaStore'
import { useUserStore } from '../../stores/userStore'
import { AvisoPrivacidade } from './AvisoPrivacidade'
import { CampoApelido } from './CampoApelido'

const ESTADOS: Record<EstadoSincronia, string> = {
  parada: '⏸️ Parada',
  sincronizando: '🔄 Sincronizando…',
  'em-dia': '✅ Em dia',
  'sem-internet': '📴 Sem internet (envia quando voltar)',
  erro: '⚠️ Problema',
}

const BOTAO = 'min-h-12 rounded-2xl px-4 text-base font-extrabold shadow disabled:opacity-50'

function Cartao({ children }: { children: ReactNode }) {
  return <section className="flex flex-col gap-3 rounded-3xl border-4 border-sky-300 bg-sky-50 p-3">{children}</section>
}

/** Mostra a mensagem de erro de uma ação assíncrona */
function useAcao() {
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  async function rodar(acao: () => Promise<unknown>) {
    setOcupado(true)
    setErro('')
    try {
      await acao()
    } catch (e) {
      setErro((e as Error).message || 'Não deu certo. Tente de novo.')
    } finally {
      setOcupado(false)
    }
  }
  return { ocupado, erro, rodar }
}

export function ContaFamilia() {
  const conta = useContaStore()
  const [entrada, setEntrada] = useState<ResultadoEntrada | null>(null)

  if (!contaConfigurada()) {
    return (
      <Cartao>
        <h2 className="text-xl font-extrabold">☁️ Conta da família</h2>
        <p className="text-base">Em breve: entrar com o Google para montar o plano de cada filho no seu celular e ele chegar no aparelho da criança.</p>
      </Cartao>
    )
  }

  if (!conta.uid) return <Entrar aoEntrar={setEntrada} />
  if (!conta.filhoAtivo) return <Vincular entrada={entrada} />
  return <Conectada />
}

// ---------- 1. Entrar ----------

function Entrar({ aoEntrar }: { aoEntrar: (r: ResultadoEntrada) => void }) {
  const [aceito, setAceito] = useState(false)
  const { ocupado, erro, rodar } = useAcao()
  return (
    <Cartao>
      <h2 className="text-xl font-extrabold">☁️ Conta da família</h2>
      <p className="text-base">
        Entre com o Google do <b>responsável</b> para montar o plano de cada filho no seu celular. O plano chega sozinho no aparelho da
        criança, e você acompanha o progresso dela de longe.
      </p>
      <AvisoPrivacidade />
      <label className="flex items-start gap-3 text-base font-bold">
        <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} className="mt-1 size-6 shrink-0 accent-sky-600" />
        Sou o responsável pela criança e concordo com o aviso acima.
      </label>
      <button
        type="button"
        disabled={!aceito || ocupado}
        onClick={() =>
          rodar(async () => {
            const r = await entrar()
            if (r) aoEntrar(r)
          })
        }
        className={`${BOTAO} bg-white text-slate-900`}
      >
        {ocupado ? 'Abrindo o Google…' : '🔐 Entrar com Google'}
      </button>
      {erro && <p role="alert" className="font-bold text-red-700">❌ {erro}</p>}
    </Cartao>
  )
}

// ---------- 2. Primeira vez neste aparelho: de qual filho ele é ----------

function Vincular({ entrada }: { entrada: ResultadoEntrada | null }) {
  const filhos = useContaStore((s) => s.filhos)
  const email = useContaStore((s) => s.email)
  const apelidoAqui = useUserStore((s) => s.apelido)
  const [apelido, setApelido] = useState(apelidoAqui)
  const [confirmar, setConfirmar] = useState<{ id: string; apelido: string } | null>(null)
  const { ocupado, erro, rodar } = useAcao()
  const familiaNaNuvem = entrada?.familiaNaNuvem ?? filhos.length > 0

  return (
    <Cartao>
      <h2 className="text-xl font-extrabold">☁️ Quem treina neste aparelho?</h2>
      <p className="text-sm">Conta: {email}</p>

      {filhos.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-bold">É um filho que já está na conta:</p>
          {filhos.map((f) => (
            <button key={f.id} type="button" disabled={ocupado} onClick={() => setConfirmar(f)} className={`${BOTAO} bg-white text-left`}>
              {f.apelido} ▶️
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-2xl bg-white p-3">
        <p className="font-bold">{filhos.length > 0 ? 'Ou é outro filho:' : 'Criar o primeiro filho da conta'} com os dados que já estão neste aparelho</p>
        <CampoApelido valor={apelido} aoMudar={setApelido} />
        {familiaNaNuvem && <p className="text-sm">Os treinos e gestos da família que já estão na conta passam a valer aqui também.</p>}
        <button type="button" disabled={ocupado || !apelido.trim()} onClick={() => rodar(() => vincularComoFilhoNovo(apelido.trim(), familiaNaNuvem))} className={`${BOTAO} bg-sol`}>
          {ocupado ? 'Ligando…' : '✅ Criar e usar neste aparelho'}
        </button>
      </div>
      {erro && <p role="alert" className="font-bold text-red-700">❌ {erro}</p>}

      <Modal aberto={confirmar !== null} aoFechar={() => setConfirmar(null)} titulo="Usar este aparelho para…">
        {confirmar && (
          <div className="flex flex-col gap-3">
            <p className="text-lg font-bold">{confirmar.apelido}</p>
            <p className="text-base">
              O progresso e o plano dele vêm da conta. O que este aparelho tinha antes fica guardado nele (não é apagado).
            </p>
            <button type="button" disabled={ocupado} onClick={() => rodar(() => vincularAFilhoExistente(confirmar.id))} className={`${BOTAO} bg-sol`}>
              {ocupado ? 'Baixando…' : 'Usar neste aparelho'}
            </button>
          </div>
        )}
      </Modal>
    </Cartao>
  )
}

// ---------- 3. Conectada ----------

function Conectada() {
  const { email, filhos, filhoAtivo, estado, erro: erroSincronia, sincronizadoEm } = useContaStore()
  const [novo, setNovo] = useState('')
  const [renomeando, setRenomeando] = useState<{ id: string; apelido: string } | null>(null)
  const [apagando, setApagando] = useState<{ id: string; apelido: string } | null>(null)
  const [apagarTudo, setApagarTudo] = useState(false)
  const [confirmacao, setConfirmacao] = useState('')
  const { ocupado, erro, rodar } = useAcao()

  return (
    <Cartao>
      <h2 className="text-xl font-extrabold">☁️ Conta da família</h2>
      <p className="text-sm">
        {email} · {ESTADOS[estado]}
        {estado === 'em-dia' && sincronizadoEm && ` às ${new Date(sincronizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
      </p>
      {estado === 'erro' && erroSincronia && <p className="text-sm font-bold text-red-700">{erroSincronia}</p>}

      <ul className="flex flex-col gap-2">
        {filhos.map((f) => {
          const aqui = f.id === filhoAtivo
          return (
            <li key={f.id} className={`flex flex-col gap-2 rounded-2xl border-4 p-2 ${aqui ? 'border-green-400 bg-green-50' : 'border-transparent bg-white'}`}>
              <p className="text-lg font-extrabold">
                {f.apelido} {aqui && <span className="rounded-full bg-green-600 px-2 text-xs text-white">NESTE APARELHO</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {!aqui && (
                  <button type="button" disabled={ocupado} onClick={() => rodar(() => trocarFilho(f.id))} className={`${BOTAO} bg-sol`}>
                    📋 Montar o plano / usar aqui
                  </button>
                )}
                <button type="button" onClick={() => setRenomeando(f)} className={`${BOTAO} bg-white`}>
                  ✏️ Apelido
                </button>
                {!aqui && (
                  <button type="button" onClick={() => setApagando(f)} className={`${BOTAO} bg-white text-red-700`}>
                    🗑️
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-2 rounded-2xl bg-white p-3">
        <p className="font-bold">➕ Adicionar filho</p>
        <CampoApelido valor={novo} aoMudar={setNovo} />
        <button
          type="button"
          disabled={ocupado || !novo.trim()}
          onClick={() =>
            rodar(async () => {
              await adicionarFilho(novo.trim())
              setNovo('')
            })
          }
          className={`${BOTAO} bg-sky-600 text-white`}
        >
          Adicionar
        </button>
        <p className="text-xs">Para montar o plano dele, toque em "Montar o plano" depois de adicionar.</p>
      </div>

      {erro && <p role="alert" className="font-bold text-red-700">❌ {erro}</p>}

      <details className="rounded-2xl bg-white p-3">
        <summary className="cursor-pointer font-bold">Privacidade, sair e apagar</summary>
        <div className="mt-2 flex flex-col gap-2">
          <AvisoPrivacidade aberto />
          <button type="button" disabled={ocupado} onClick={() => rodar(sairDaConta)} className={`${BOTAO} bg-white`}>
            🚪 Sair da conta neste aparelho
          </button>
          <button type="button" onClick={() => setApagarTudo(true)} className={`${BOTAO} bg-red-600 text-white`}>
            Apagar a conta e todos os dados da nuvem
          </button>
        </div>
      </details>

      <Modal aberto={renomeando !== null} aoFechar={() => setRenomeando(null)} titulo="Apelido do filho">
        {renomeando && (
          <div className="flex flex-col gap-3">
            <CampoApelido valor={renomeando.apelido} aoMudar={(apelido) => setRenomeando({ ...renomeando, apelido })} />
            <button
              type="button"
              disabled={ocupado || !renomeando.apelido.trim()}
              onClick={() =>
                rodar(async () => {
                  await renomearFilho(renomeando.id, renomeando.apelido.trim())
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

      <Modal aberto={apagando !== null} aoFechar={() => setApagando(null)} titulo="Apagar filho da conta">
        {apagando && (
          <div className="flex flex-col gap-3">
            <p className="text-base">
              Apaga <b>{apagando.apelido}</b> da conta e da nuvem: plano, progresso e conquistas dele. Não dá para desfazer.
            </p>
            <button
              type="button"
              disabled={ocupado}
              onClick={() =>
                rodar(async () => {
                  await apagarFilho(apagando.id)
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

      <Modal aberto={apagarTudo} aoFechar={() => setApagarTudo(false)} titulo="Apagar a conta da família">
        <div className="flex flex-col gap-3">
          <p className="text-base">
            Apaga da nuvem <b>tudo</b>: os filhos, os planos, o progresso e o login. Neste aparelho ficam só os dados do filho que está nele. Não dá
            para desfazer.
          </p>
          <label className="flex flex-col gap-1 text-sm font-bold">
            Escreva APAGAR para confirmar
            <input value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} className="min-h-12 rounded-xl border-2 border-red-200 px-3 text-base" />
          </label>
          <button
            type="button"
            disabled={ocupado || confirmacao.trim().toUpperCase() !== 'APAGAR'}
            onClick={() =>
              rodar(async () => {
                await apagarContaDaFamilia()
                setApagarTudo(false)
              })
            }
            className={`${BOTAO} bg-red-600 text-white`}
          >
            {ocupado ? 'Apagando…' : 'Apagar tudo'}
          </button>
        </div>
      </Modal>
    </Cartao>
  )
}
