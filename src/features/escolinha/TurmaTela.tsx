// Uma turma (treinador): os atletas (autorizados pela família ou esperando o aceite), cadastrar e
// convidar, o código da turma para as famílias, o treino de cada atleta e o plano da turma.
import { useCallback, useEffect, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import type { DadosEscolinha, Membro, ResumoAtleta, Turma } from '../../conta/nuvemEscolinha'
import { hojeISO, somarDias } from '../../utils/data'
import { nivelPorXP } from '../../utils/nivel'
import { CampoApelido } from '../conta/CampoApelido'
import { BOTAO, useAcao } from '../conta/acao'
import { CodigoGrande, MensagemErro } from '../conta/comum'
import { mostrarCodigo } from '../../conta/codigos'
import { PlanoTurma } from './PlanoTurma'

const nuvem = () => import('../../conta/nuvemEscolinha')

interface Props {
  uid: string
  escolinha: DadosEscolinha
  turma: Turma
  aoVoltar: () => void
  aoMudar: () => void
}

export function TurmaTela({ uid, escolinha, turma, aoVoltar, aoMudar }: Props) {
  const [membros, setMembros] = useState<Membro[] | null>(null)
  const [codigoTurma, setCodigoTurma] = useState<string | null>(null)
  const [novo, setNovo] = useState('')
  const [mostrar, setMostrar] = useState<{ codigo: string; legenda: string } | null>(null)
  const [resumo, setResumo] = useState<{ membro: Membro; dados: ResumoAtleta } | null>(null)
  const [renomear, setRenomear] = useState<string | null>(null)
  // Plano individual de um atleta (além do plano da turma)
  const [individual, setIndividual] = useState<Membro | null>(null)
  const [apagar, setApagar] = useState(false)
  const { ocupado, erro, rodar } = useAcao()

  const recarregar = useCallback(async () => {
    const n = await nuvem()
    const [lista, codigo] = await Promise.all([n.listarMembros(escolinha.id, turma.id), n.codigoDaTurma(escolinha.id, turma.id)])
    setMembros(lista)
    setCodigoTurma(codigo)
  }, [escolinha.id, turma.id])

  useEffect(() => {
    let vivo = true
    nuvem()
      .then((n) => Promise.all([n.listarMembros(escolinha.id, turma.id), n.codigoDaTurma(escolinha.id, turma.id)]))
      .then(([lista, codigo]) => {
        if (!vivo) return
        setMembros(lista)
        setCodigoTurma(codigo)
      })
      .catch(() => vivo && setMembros([]))
    return () => {
      vivo = false
    }
  }, [escolinha.id, turma.id])

  const carregarPlano = useCallback(async () => (await nuvem()).lerPlanoTurma(escolinha.id, turma.id), [escolinha.id, turma.id])
  const salvarPlano = useCallback(async (dias: Parameters<Awaited<ReturnType<typeof nuvem>>['salvarPlanoTurma']>[2]) => {
    await (await nuvem()).salvarPlanoTurma(escolinha.id, turma.id, dias)
  }, [escolinha.id, turma.id])

  // Total da escolinha contado pelo servidor; sem ele, os desta turma
  const carregarIndividual = useCallback(async () => (individual?.atleta ? (await nuvem()).lerPlanoIndividual(escolinha.id, turma.id, individual.atleta) : {}), [escolinha.id, turma.id, individual])
  const salvarIndividual = useCallback(
    async (dias: Parameters<Awaited<ReturnType<typeof nuvem>>['salvarPlanoIndividual']>[3]) => {
      if (individual?.atleta) await (await nuvem()).salvarPlanoIndividual(escolinha.id, turma.id, individual.atleta, dias)
    },
    [escolinha.id, turma.id, individual],
  )

  if (individual) {
    return (
      <section className="flex flex-col gap-4">
        <header className="flex items-center gap-3">
          <button type="button" onClick={() => setIndividual(null)} aria-label="Voltar à turma" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
            ⬅️
          </button>
          <h2 className="flex-1 text-2xl font-extrabold">👤 Plano de {individual.apelido}</h2>
        </header>
        <p className="text-sm">
          Plano só de {individual.apelido}, além do plano da turma. Aparece na agenda dele como "⚽ Para você". Para copiar para outros atletas, use o
          painel no computador.
        </p>
        <PlanoTurma carregar={carregarIndividual} salvar={salvarIndividual} />
      </section>
    )
  }

  const cheio = Math.max(escolinha.atletas ?? 0, membros?.length ?? 0) >= escolinha.limites.atletas

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button type="button" onClick={aoVoltar} aria-label="Voltar à escolinha" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </button>
        <h2 className="flex-1 text-2xl font-extrabold">⚽ {turma.nome}</h2>
        <button type="button" onClick={() => setRenomear(turma.nome)} aria-label="Mudar o nome da turma" className="text-2xl">
          ✏️
        </button>
      </header>

      <div className="flex flex-col gap-2 rounded-3xl border-4 border-sky-300 bg-sky-50 p-3">
        <h3 className="text-xl font-extrabold">👦 Atletas {membros && `(${membros.length})`}</h3>
        {!membros && <p>Carregando…</p>}
        {membros?.length === 0 && <p className="text-sm">Nenhum atleta ainda. Cadastre abaixo ou passe o código da turma para as famílias.</p>}
        <ul className="flex flex-col gap-2">
          {membros?.map((m) => (
            <li key={m.id} className="flex flex-col gap-1 rounded-2xl bg-white p-2">
              <p className="font-extrabold">
                {m.apelido} {m.autorizado ? <span className="text-sm">✅ autorizado pela família</span> : <span className="text-sm">🕐 esperando a família</span>}
              </p>
              {m.codigo && <p className="text-sm">Convite: <b className="font-mono">{mostrarCodigo(m.codigo)}</b> (a família digita na conta dela)</p>}
              <div className="flex flex-wrap gap-2">
                {m.autorizado && m.atleta && (
                  <button type="button" disabled={ocupado} onClick={() => rodar(async () => setResumo({ membro: m, dados: await (await nuvem()).lerResumoAtleta(m.atleta!) }))} className={`${BOTAO} bg-sol`}>
                    📈 Ver o treino
                  </button>
                )}
                {m.autorizado && m.atleta && (
                  <button type="button" onClick={() => setIndividual(m)} className={`${BOTAO} bg-white`}>
                    👤 Plano individual
                  </button>
                )}
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() =>
                    rodar(async () => {
                      await (await nuvem()).removerMembro(escolinha.id, turma.id, m)
                      await recarregar()
                    })
                  }
                  className={`${BOTAO} bg-white text-red-700`}
                >
                  Tirar da turma
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 rounded-2xl bg-white p-3">
          <p className="font-bold">➕ Cadastrar atleta e convidar a família</p>
          <CampoApelido valor={novo} aoMudar={setNovo} />
          {cheio && <p className="text-sm font-bold">O plano da escolinha vai até {escolinha.limites.atletas} atletas (veja os planos na tela da escolinha).</p>}
          <button
            type="button"
            disabled={ocupado || !novo.trim() || cheio}
            onClick={() =>
              rodar(async () => {
                const codigo = await (await nuvem()).convidarAtleta(uid, escolinha, turma.id, novo.trim())
                setMostrar({
                  codigo,
                  legenda: `Passe para a família de ${novo.trim()}. Ela entra na conta dela (Conta → atleta → ⚽ Entrar numa turma) e digita o código. Vale 30 dias. Você só vê o treino depois que a família aceitar.`,
                })
                setNovo('')
                await recarregar()
              })
            }
            className={`${BOTAO} bg-sky-600 text-white`}
          >
            Cadastrar e gerar convite
          </button>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-white p-3">
          <p className="font-bold">🔑 Código da turma</p>
          <p className="text-sm">Para várias famílias de uma vez (ex.: no grupo da turma). Cada família põe o filho na turma com ele.</p>
          {codigoTurma && <p className="text-center font-mono text-3xl font-black tracking-widest">{mostrarCodigo(codigoTurma)}</p>}
          <button
            type="button"
            disabled={ocupado}
            onClick={() =>
              rodar(async () => {
                setCodigoTurma(await (await nuvem()).gerarCodigoTurma(uid, escolinha, turma.id))
              })
            }
            className={`${BOTAO} bg-white`}
          >
            {codigoTurma ? '🔄 Trocar o código (o antigo para de valer)' : 'Gerar código da turma'}
          </button>
        </div>
        <MensagemErro erro={erro} />
      </div>

      <details className="rounded-3xl border-4 border-orange-300 bg-orange-50 p-3">
        <summary className="cursor-pointer text-xl font-extrabold">📅 Plano da turma (próximos 14 dias)</summary>
        <p className="my-2 text-sm">Aparece na agenda de cada atleta, marcado "⚽ {turma.nome}", junto com o plano de casa.</p>
        <PlanoTurma carregar={carregarPlano} salvar={salvarPlano} />
      </details>

      <button type="button" onClick={() => setApagar(true)} className={`${BOTAO} bg-white text-red-700`}>
        🗑️ Apagar a turma
      </button>

      <Modal aberto={mostrar !== null} aoFechar={() => setMostrar(null)} titulo="Convite da família">
        {mostrar && <CodigoGrande codigo={mostrar.codigo} legenda={mostrar.legenda} />}
      </Modal>

      <Modal aberto={resumo !== null} aoFechar={() => setResumo(null)} titulo={`Treino de ${resumo?.membro.apelido ?? ''}`}>
        {resumo && <Resumo dados={resumo.dados} />}
      </Modal>

      <Modal aberto={renomear !== null} aoFechar={() => setRenomear(null)} titulo="Nome da turma">
        {renomear !== null && (
          <div className="flex flex-col gap-2">
            <input value={renomear} onChange={(e) => setRenomear(e.target.value)} maxLength={30} className="min-h-12 rounded-xl border-2 border-sky-200 px-3" />
            <button
              type="button"
              disabled={ocupado || !renomear.trim()}
              onClick={() =>
                rodar(async () => {
                  await (await nuvem()).renomearTurma(escolinha.id, turma.id, renomear.trim())
                  setRenomear(null)
                  aoMudar()
                })
              }
              className={`${BOTAO} bg-sol`}
            >
              Salvar
            </button>
          </div>
        )}
      </Modal>

      <Modal aberto={apagar} aoFechar={() => setApagar(false)} titulo="Apagar a turma">
        <div className="flex flex-col gap-3">
          <p>Apaga a turma, o plano dela e a lista de atletas. Os atletas continuam com as famílias (só saem da turma).</p>
          <button
            type="button"
            disabled={ocupado}
            onClick={() =>
              rodar(async () => {
                await (await nuvem()).apagarTurma(escolinha.id, turma.id)
                setApagar(false)
                aoMudar()
                aoVoltar()
              })
            }
            className={`${BOTAO} bg-red-600 text-white`}
          >
            Apagar {turma.nome}
          </button>
        </div>
      </Modal>
    </section>
  )
}

function Resumo({ dados }: { dados: ResumoAtleta }) {
  const hoje = hojeISO()
  const semana = Array.from({ length: 7 }, (_, i) => somarDias(hoje, -i))
  const mes = Array.from({ length: 30 }, (_, i) => somarDias(hoje, -i))
  const nivel = nivelPorXP(dados.xp).nivel
  const ultimas = Object.entries(dados.atividadesPorDia)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 5)
  return (
    <div className="flex flex-col gap-2 text-base">
      <p>
        ⭐ Nível <b>{nivel}</b> · {dados.xp} XP · 🏅 {dados.conquistas} conquistas
      </p>
      <p>
        📅 Treinou em <b>{semana.filter((d) => dados.diasTreinados.includes(d)).length}</b> dos últimos 7 dias e em{' '}
        <b>{mes.filter((d) => dados.diasTreinados.includes(d)).length}</b> dos últimos 30.
      </p>
      {ultimas.length > 0 && (
        <div>
          <p className="font-bold">Últimos treinos</p>
          <ul className="text-sm">
            {ultimas.map(([dia, atividades]) => (
              <li key={dia}>
                {dia.split('-').reverse().join('/')}: {atividades.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
