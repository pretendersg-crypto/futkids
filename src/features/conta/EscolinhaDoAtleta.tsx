// Conta da família → cada atleta: em qual escolinha/turma ele está, pôr numa turma (com o código do
// convite do treinador ou da turma, autorizando a escolinha a ver o treino) e tirar de lá.
import { useEffect, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { codigoCompleto, lerCodigo } from '../../conta/codigos'
import { entrarNaTurma, escolinhaDoAtleta, tirarDaEscolinha } from '../../conta/conta'
import type { Atleta } from '../../conta/contaStore'
import type { InfoEscolinhaDoAtleta } from '../../conta/nuvemEscolinha'
import { BOTAO, useAcao } from './acao'
import { MensagemErro } from './comum'

export function EscolinhaDoAtleta({ atleta }: { atleta: Atleta }) {
  const [info, setInfo] = useState<InfoEscolinhaDoAtleta | null>(null)
  const [entrando, setEntrando] = useState(false)
  const [tirando, setTirando] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [autorizo, setAutorizo] = useState(false)
  const { ocupado, erro, rodar } = useAcao()

  useEffect(() => {
    let vivo = true
    escolinhaDoAtleta(atleta.id)
      .then((i) => vivo && setInfo(i))
      .catch(() => undefined)
    return () => {
      vivo = false
    }
  }, [atleta.id])

  return (
    <div className="flex flex-col gap-1">
      {info?.escolinha ? (
        <p className="text-sm">
          ⚽ <b>{info.escolinhaNome}</b> · {info.turmas.map((t) => t.nome).join(', ')}{' '}
          <button type="button" onClick={() => setTirando(true)} className="font-bold text-red-700 underline">
            tirar
          </button>
        </p>
      ) : (
        <button type="button" onClick={() => setEntrando(true)} className={`${BOTAO} self-start bg-white`}>
          ⚽ Entrar numa turma (escolinha)
        </button>
      )}

      <Modal aberto={entrando} aoFechar={() => setEntrando(false)} titulo={`${atleta.apelido} na escolinha`}>
        <div className="flex flex-col gap-3">
          <p className="text-base">Digite o código que o treinador passou (o convite do atleta ou o código da turma).</p>
          <input
            value={codigo}
            onChange={(e) => setCodigo(lerCodigo(e.target.value))}
            placeholder="ABCD-2345"
            autoCapitalize="characters"
            aria-label="Código do treinador"
            className="min-h-14 rounded-2xl border-4 border-sky-200 px-4 text-center font-mono text-3xl font-black tracking-widest uppercase"
          />
          <label className="flex items-start gap-3 rounded-2xl bg-white p-3 text-base">
            <input type="checkbox" checked={autorizo} onChange={(e) => setAutorizo(e.target.checked)} className="mt-1 size-6 shrink-0 accent-sky-600" />
            <span>
              Autorizo os treinadores da escolinha a <b>ver</b> os treinos de {atleta.apelido}: nível, pontos, dias e treinos feitos e conquistas.
              Eles não mudam nada e não veem nada da família. Posso tirar quando quiser.
            </span>
          </label>
          <MensagemErro erro={erro} />
          <button
            type="button"
            disabled={ocupado || !autorizo || !codigoCompleto(codigo)}
            onClick={() =>
              rodar(async () => {
                setInfo(await entrarNaTurma(atleta, codigo))
                setEntrando(false)
                setCodigo('')
                setAutorizo(false)
              })
            }
            className={`${BOTAO} bg-sol`}
          >
            {ocupado ? 'Entrando…' : '✅ Entrar na turma'}
          </button>
        </div>
      </Modal>

      <Modal aberto={tirando} aoFechar={() => setTirando(false)} titulo="Tirar da escolinha">
        <div className="flex flex-col gap-3">
          <p>
            {atleta.apelido} sai das turmas de <b>{info?.escolinhaNome}</b> e os treinadores deixam de ver o treino dele na hora. O plano da turma some
            da agenda.
          </p>
          <MensagemErro erro={erro} />
          <button
            type="button"
            disabled={ocupado}
            onClick={() =>
              rodar(async () => {
                await tirarDaEscolinha(atleta.id)
                setInfo({ escolinha: null, escolinhaNome: null, turmas: [] })
                setTirando(false)
              })
            }
            className={`${BOTAO} bg-red-600 text-white`}
          >
            Tirar da escolinha
          </button>
        </div>
      </Modal>
    </div>
  )
}
