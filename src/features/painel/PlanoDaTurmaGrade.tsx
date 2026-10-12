// Painel → plano do treinador: escolhe a turma e PARA QUEM é o plano:
//  - "Toda a turma": o plano da turma, que chega na agenda de todos os atletas dela;
//  - um atleta: o plano individual dele (além do da turma), que dá para copiar para outros atletas.
// Monta na grade e salva na nuvem. Só treinos do app (os criados em casa não existem para a turma).
import { useCallback, useEffect, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { treinoPorId, type ItemDia } from '../../data/calendarioGoleiros'
import type { DadosEscolinha, DiasDaTurma, Membro } from '../../conta/nuvemEscolinha'
import { TREINOS_FUNDAMENTOS_INICIAIS } from '../../stores/treinosFundamentosStore'
import { BOTAO, useAcao } from '../conta/acao'
import { MensagemErro } from '../conta/comum'
import { GESTOS_PRONTOS } from '../saidaGol/gestos'
import { GradePlano } from './GradePlano'
import { gruposDoPlano } from './grupos'
import { VideosDoTreinador } from '../escolinha/VideosDoTreinador'
import type { VideoDoTreinador as Video } from '../../conta/nuvemVideos'
import { useContaStore } from '../../conta/contaStore'

const nuvem = () => import('../../conta/nuvemEscolinha')

// A turma só usa o que vem no app (o que cada família criou não existe nos aparelhos dos atletas)
const GRUPOS = gruposDoPlano({ gestos: GESTOS_PRONTOS, fundamentos: TREINOS_FUNDAMENTOS_INICIAIS })

const nomeDe = (id: string) => {
  const t = treinoPorId(id, [], [], TREINOS_FUNDAMENTOS_INICIAIS)
  return { emoji: t?.emoji ?? '❔', nome: t?.nome ?? id }
}

/** "turma" = plano da turma toda; senão, o id do atleta (plano individual) */
type Para = 'turma' | string

export function PlanoDaTurmaGrade({ escolinha }: { escolinha: string }) {
  const [esc, setEsc] = useState<DadosEscolinha | null>(null)
  const [turma, setTurma] = useState<string | null>(null)
  const [atletas, setAtletas] = useState<Membro[]>([])
  const [para, setPara] = useState<Para>('turma')
  const [dias, setDias] = useState<DiasDaTurma | null>(null)
  const [mudou, setMudou] = useState(false)
  const [copiando, setCopiando] = useState(false)
  const [destinos, setDestinos] = useState<string[]>([])
  const [aviso, setAviso] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const uid = useContaStore((s) => s.uid)
  const { ocupado, erro, rodar } = useAcao()

  useEffect(() => {
    let vivo = true
    nuvem()
      .then((n) => n.lerEscolinha(escolinha))
      .then((d) => {
        if (!vivo) return
        setEsc(d)
        setTurma((t) => t ?? d.turmas[0]?.id ?? null)
      })
      .catch(() => undefined)
    return () => {
      vivo = false
    }
  }, [escolinha])

  // Atletas autorizados da turma (só eles podem ter plano individual)
  useEffect(() => {
    if (!turma) return
    let vivo = true
    nuvem()
      .then((n) => n.listarMembros(escolinha, turma))
      .then((lista) => vivo && setAtletas(lista.filter((m) => m.autorizado && m.atleta)))
      .catch(() => vivo && setAtletas([]))
    return () => {
      vivo = false
    }
  }, [escolinha, turma])

  useEffect(() => {
    if (!turma) return
    let vivo = true
    nuvem()
      .then((n) => (para === 'turma' ? n.lerPlanoTurma(escolinha, turma) : n.lerPlanoIndividual(escolinha, turma, para)))
      .then((d) => {
        if (!vivo) return
        setDias(d)
        setMudou(false)
      })
      .catch(() => vivo && setDias({}))
    return () => {
      vivo = false
    }
  }, [escolinha, turma, para])

  // Sair com mudanças sem salvar: o navegador pergunta antes
  useEffect(() => {
    if (!mudou) return
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [mudou])

  const itensDo = useCallback((data: string): ItemDia[] => dias?.[data] ?? [], [dias])

  if (!esc) return <p>Carregando a escolinha…</p>
  if (esc.turmas.length === 0) return <p>Crie uma turma na Área do treinador primeiro.</p>

  const podeTrocar = () => !mudou || confirm('Há mudanças sem salvar. Trocar mesmo assim?')
  const apelidoDe = (id: string) => atletas.find((m) => m.atleta === id)?.apelido ?? 'atleta'

  async function salvar() {
    const n = await nuvem()
    if (para === 'turma') await n.salvarPlanoTurma(escolinha, turma!, dias!)
    else await n.salvarPlanoIndividual(escolinha, turma!, para, dias!)
    setMudou(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-lg font-extrabold">
          ⚽ Turma
          <select
            value={turma ?? ''}
            onChange={(e) => {
              if (!podeTrocar()) return
              setDias(null)
              setPara('turma')
              setTurma(e.target.value)
            }}
            className="rounded-xl border-2 border-sky-300 bg-white px-3 py-1.5"
          >
            {esc.turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-lg font-extrabold">
          Para
          <select
            value={para}
            onChange={(e) => {
              if (!podeTrocar()) return
              setDias(null)
              setAviso('')
              setPara(e.target.value)
            }}
            className="rounded-xl border-2 border-sky-300 bg-white px-3 py-1.5"
          >
            <option value="turma">👥 Toda a turma (todos os atletas)</option>
            {atletas.map((m) => (
              <option key={m.atleta!} value={m.atleta!}>
                👤 {m.apelido} (plano individual)
              </option>
            ))}
          </select>
        </label>
        <button type="button" disabled={!mudou || ocupado || !turma || !dias} onClick={() => rodar(salvar)} className={`${BOTAO} ml-auto ${mudou ? 'bg-sol' : 'bg-white'}`}>
          {ocupado ? 'Salvando…' : mudou ? '💾 Salvar' : '✅ Salvo'}
        </button>
      </div>

      <p className="rounded-2xl bg-white p-3 text-sm">
        {para === 'turma' ? (
          <>
            O <b>plano da turma</b> chega na agenda de <b>todos os atletas</b> dela ({atletas.length} autorizado{atletas.length === 1 ? '' : 's'}), marcado "⚽{' '}
            {esc.turmas.find((t) => t.id === turma)?.nome}".
          </>
        ) : (
          <>
            O <b>plano individual</b> de <b>{apelidoDe(para)}</b> chega só na agenda dele, marcado "⚽ Para você", junto com o plano da turma.{' '}
            <button
              type="button"
              disabled={ocupado}
              onClick={() =>
                rodar(async () => {
                  const daTurma = await (await nuvem()).lerPlanoTurma(escolinha, turma!)
                  setDias({ ...daTurma })
                  setMudou(true)
                })
              }
              className="font-bold text-sky-700 underline"
            >
              Começar com o plano da turma
            </button>{' '}
            ·{' '}
            <button type="button" onClick={() => setCopiando(true)} disabled={atletas.length < 2} className="font-bold text-sky-700 underline disabled:opacity-40">
              Copiar este plano para outros atletas
            </button>
          </>
        )}
      </p>
      {aviso && <p className="rounded-2xl bg-green-50 p-3 font-bold">✅ {aviso}</p>}
      <MensagemErro erro={erro} />

      {uid && turma && (
        <details className="rounded-3xl border-2 border-red-200 bg-white p-3">
          <summary className="cursor-pointer text-lg font-extrabold">🎬 Vídeos de {para === 'turma' ? 'toda a turma' : apelidoDe(para)} (enviar e ver)</summary>
          <div className="mt-2 max-w-xl">
            <VideosDoTreinador
              uid={uid}
              escolinha={esc}
              turma={esc.turmas.find((t) => t.id === turma)!}
              atletas={atletas}
              para={para === 'turma' ? null : para}
              aoListar={setVideos}
            />
          </div>
        </details>
      )}

      {!dias ? (
        <p>Carregando o plano…</p>
      ) : (
        <GradePlano
          videos={videos}
          grupos={GRUPOS}
          itensDo={itensDo}
          definir={(data, itens) => {
            setDias((d) => ({ ...(d ?? {}), [data]: itens }))
            setMudou(true)
          }}
          nomeDe={nomeDe}
          vazio={para === 'turma' ? 'Sem treino da turma' : 'Sem treino individual'}
        />
      )}

      <Modal aberto={copiando} aoFechar={() => setCopiando(false)} titulo={`Copiar o plano de ${apelidoDe(para)}`}>
        <div className="flex flex-col gap-2">
          <p className="text-sm">O plano individual de cada atleta marcado será <b>trocado</b> por este. {mudou && 'As mudanças ainda não salvas também vão.'}</p>
          {atletas
            .filter((m) => m.atleta !== para)
            .map((m) => (
              <label key={m.atleta!} className="flex items-center gap-2 rounded-xl bg-white p-2 font-bold">
                <input
                  type="checkbox"
                  checked={destinos.includes(m.atleta!)}
                  onChange={(e) => setDestinos((d) => (e.target.checked ? [...d, m.atleta!] : d.filter((x) => x !== m.atleta)))}
                  className="size-5"
                />
                {m.apelido}
              </label>
            ))}
          <button
            type="button"
            disabled={ocupado || destinos.length === 0}
            onClick={() =>
              rodar(async () => {
                // Salva este antes (para copiar o que está na tela)
                if (mudou) await salvar()
                await (await nuvem()).copiarPlanoIndividual(escolinha, turma!, para, destinos)
                setAviso(`Plano copiado para ${destinos.map(apelidoDe).join(', ')}.`)
                setDestinos([])
                setCopiando(false)
              })
            }
            className={`${BOTAO} bg-sol`}
          >
            Copiar para {destinos.length} atleta{destinos.length === 1 ? '' : 's'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
