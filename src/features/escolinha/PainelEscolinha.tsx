// Área do treinador (/treinador): entrar, criar a escolinha (ou entrar com o código de outro
// treinador), as turmas, os treinadores e o plano grátis (com os limites dele).
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { contaConfigurada, criarEscolinha, entrarNaEscolinha, sairDaEscolinha, sairDaConta } from '../../conta/conta'
import { codigoCompleto, lerCodigo } from '../../conta/codigos'
import { useContaStore } from '../../conta/contaStore'
import type { DadosEscolinha, Turma } from '../../conta/nuvemEscolinha'
import { Modal } from '../../components/ui/Modal'
import { BOTAO, useAcao } from '../conta/acao'
import { Cartao, CodigoGrande, MensagemErro } from '../conta/comum'
import { EntrarAdulto } from '../conta/Entrar'
import { PlanosEscolinha } from './PlanosEscolinha'
import { TurmaTela } from './TurmaTela'

const nuvem = () => import('../../conta/nuvemEscolinha')

export function PainelEscolinha() {
  const { uid, aparelhoDaCrianca, escolinha } = useContaStore()
  if (!contaConfigurada()) {
    return (
      <Cartao titulo="⚽ Área do treinador">
        <p>Em breve: escolinha, turmas, plano da turma e o treino de cada atleta.</p>
      </Cartao>
    )
  }
  if (aparelhoDaCrianca) {
    return (
      <Cartao titulo="⚽ Área do treinador">
        <p>Este é o aparelho de uma criança. Entre como treinador no seu celular.</p>
      </Cartao>
    )
  }
  if (!uid) return <EntrarAdulto titulo="⚽ Entrar como treinador" />
  if (!escolinha) return <SemEscolinha />
  return <Escolinha id={escolinha} uid={uid} />
}

function SemEscolinha() {
  const email = useContaStore((s) => s.email)
  const [nome, setNome] = useState('')
  const [aceito, setAceito] = useState(false)
  const [codigo, setCodigo] = useState('')
  const { ocupado, erro, rodar } = useAcao()
  return (
    <Cartao titulo="⚽ Sua escolinha">
      <p className="text-sm">Conta: {email}</p>
      <div className="flex flex-col gap-2 rounded-2xl bg-white p-3">
        <label className="flex flex-col gap-1 font-bold">
          Nome da escolinha (ou do time)
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={40} placeholder="Ex.: Escolinha Bom de Bola" className="min-h-12 rounded-xl border-2 border-sky-200 px-3 font-normal" />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-sky-600" />
          <span>
            Li e aceito os{' '}
            <Link to="/termos" className="font-bold underline">
              Termos de Uso
            </Link>{' '}
            (parte "Escolinhas e treinadores"): só vejo o treino dos atletas que a família autorizar e uso só para acompanhar o treino.
          </span>
        </label>
        <button type="button" disabled={ocupado || !nome.trim() || !aceito} onClick={() => rodar(() => criarEscolinha(nome.trim()))} className={`${BOTAO} bg-sol`}>
          ✨ Criar a escolinha (grátis)
        </button>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl bg-white p-3">
        <p className="font-bold">Outro treinador já criou? Digite o código que ele gerou</p>
        <input
          value={codigo}
          onChange={(e) => setCodigo(lerCodigo(e.target.value))}
          placeholder="ABCD-2345"
          autoCapitalize="characters"
          aria-label="Código do treinador"
          className="min-h-12 rounded-xl border-2 border-sky-200 px-3 text-center font-mono text-2xl font-black tracking-widest uppercase"
        />
        <button type="button" disabled={ocupado || !codigoCompleto(codigo)} onClick={() => rodar(() => entrarNaEscolinha(codigo))} className={`${BOTAO} bg-sky-600 text-white`}>
          Entrar na escolinha
        </button>
      </div>
      <MensagemErro erro={erro} />
      <button type="button" disabled={ocupado} onClick={() => rodar(sairDaConta)} className="self-start text-sm font-bold underline">
        Sair desta conta
      </button>
    </Cartao>
  )
}

function Escolinha({ id, uid }: { id: string; uid: string }) {
  const [esc, setEsc] = useState<DadosEscolinha | null>(null)
  const [turmaAberta, setTurmaAberta] = useState<Turma | null>(null)
  // Volta do Mercado Pago (?pagamento=voltou): abre direto nos planos
  const [planosAbertos, setPlanosAbertos] = useState(() => new URLSearchParams(location.search).get('pagamento') === 'voltou')
  const [novaTurma, setNovaTurma] = useState('')
  const [codigo, setCodigo] = useState<string | null>(null)
  const [sair, setSair] = useState(false)
  const { ocupado, erro, rodar } = useAcao()

  const recarregar = useCallback(async () => setEsc(await (await nuvem()).lerEscolinha(id)), [id])
  useEffect(() => {
    let vivo = true
    nuvem()
      .then((n) => n.lerEscolinha(id))
      .then((d) => vivo && setEsc(d))
      .catch(() => undefined)
    return () => {
      vivo = false
    }
  }, [id])

  if (!esc) return <p>Carregando a escolinha…</p>
  if (planosAbertos) return <PlanosEscolinha uid={uid} escolinha={esc} aoVoltar={() => setPlanosAbertos(false)} aoAtualizar={() => void recarregar()} />
  if (turmaAberta) {
    return (
      <TurmaTela
        uid={uid}
        escolinha={esc}
        turma={turmaAberta}
        aoVoltar={() => setTurmaAberta(null)}
        aoMudar={() => void recarregar()}
      />
    )
  }

  const pago = esc.plano !== 'gratis'
  return (
    <div className="flex flex-col gap-4">
      <Cartao titulo={`⚽ ${esc.nome}`}>
        <button type="button" onClick={() => setPlanosAbertos(true)} className="self-start rounded-full bg-white px-3 py-1 text-left text-sm font-bold shadow">
          {pago ? '⭐ Plano pago' : '🆓 Plano grátis'}: até {esc.limites.treinadores} treinador(es), {esc.limites.turmas} turma(s) e {esc.limites.atletas} atletas ·{' '}
          <u>ver planos</u>
        </button>

        <h3 className="text-lg font-extrabold">Turmas</h3>
        <ul className="flex flex-col gap-2">
          {esc.turmas.map((t) => (
            <li key={t.id}>
              <button type="button" onClick={() => setTurmaAberta(t)} className={`${BOTAO} w-full bg-white text-left`}>
                ⚽ {t.nome} ▶️
              </button>
            </li>
          ))}
        </ul>
        {esc.turmas.length < esc.limites.turmas ? (
          <div className="flex gap-2">
            <input
              value={novaTurma}
              onChange={(e) => setNovaTurma(e.target.value)}
              maxLength={30}
              placeholder="Nova turma (ex.: Sub-9)"
              aria-label="Nome da nova turma"
              className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-sky-200 px-3"
            />
            <button
              type="button"
              disabled={ocupado || !novaTurma.trim()}
              onClick={() =>
                rodar(async () => {
                  const t = await (await nuvem()).criarTurma(esc.id, novaTurma.trim())
                  setNovaTurma('')
                  await recarregar()
                  setTurmaAberta(t)
                })
              }
              className={`${BOTAO} bg-sky-600 text-white`}
            >
              Criar
            </button>
          </div>
        ) : (
          <p className="text-sm">
            O seu plano tem {esc.limites.turmas} turma(s).{' '}
            <button type="button" onClick={() => setPlanosAbertos(true)} className="font-bold underline">
              Ver planos
            </button>
          </p>
        )}

        <h3 className="text-lg font-extrabold">Treinadores ({esc.treinadores.length})</h3>
        {esc.treinadores.length < esc.limites.treinadores ? (
          <button type="button" disabled={ocupado} onClick={() => rodar(async () => setCodigo(await (await nuvem()).gerarCodigoTreinador(uid, esc.id)))} className={`${BOTAO} bg-white`}>
            👥 Convidar outro treinador
          </button>
        ) : (
          <p className="text-sm">
            O seu plano tem {esc.limites.treinadores} treinador(es).{' '}
            <button type="button" onClick={() => setPlanosAbertos(true)} className="font-bold underline">
              Ver planos
            </button>
          </p>
        )}
        <MensagemErro erro={erro} />
      </Cartao>

      <Link to="/conta" className="text-center text-sm font-bold underline">
        👨‍👩‍👧 Também sou responsável: ir para a conta da família
      </Link>
      <button type="button" onClick={() => setSair(true)} className="text-sm font-bold text-red-700 underline">
        Sair da escolinha
      </button>

      <Modal aberto={codigo !== null} aoFechar={() => setCodigo(null)} titulo="Convite de treinador">
        {codigo && <CodigoGrande codigo={codigo} legenda="O outro treinador entra em ⚽ Área do treinador (com Google ou e-mail) e digita este código. Vale 7 dias, uma vez só." />}
      </Modal>
      <Modal aberto={sair} aoFechar={() => setSair(false)} titulo="Sair da escolinha">
        <div className="flex flex-col gap-3">
          <p>
            {esc.treinadores.length <= 1
              ? 'Você é o único treinador: sair APAGA a escolinha, as turmas e os planos. Os atletas continuam com as famílias.'
              : 'Você sai da escolinha; ela continua com os outros treinadores.'}
          </p>
          <button
            type="button"
            disabled={ocupado}
            onClick={() =>
              rodar(async () => {
                await sairDaEscolinha()
                setSair(false)
              })
            }
            className={`${BOTAO} bg-red-600 text-white`}
          >
            Sair
          </button>
        </div>
      </Modal>
    </div>
  )
}
