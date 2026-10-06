// Criar ou mudar um drill de reação (pais/treinador): nome, sinais (cores, setas, números),
// modo, séries, tempos e o que fazer. Só grava ao tocar em "Salvar drill".
import { useState } from 'react'
import { CampoNumero } from '../../components/ui/CampoNumero'
import type { Drill, ModoDrill } from './drills'
import { resumoSinais } from './drills'
import { CORES, DIRECOES, sinaisPossiveis, type CorId, type DirecaoId } from './sinais'

const ICONES = ['⚡', '🚦', '🧤', '🦶', '🔢', '✋', '👟', '🎯', '🔀', '⏱️', '🧠', '🏃', '🤸', '⚽', '🥅', '🔥']

const MODOS: { id: ModoDrill; nome: string; explica: string }[] = [
  { id: 'auto', nome: '📱 Celular no chão', explica: 'Os sinais passam sozinhos; a criança reage com o corpo.' },
  { id: 'toque', nome: '👆 Toque na tela', explica: 'A criança toca a resposta; o app mede reação e acertos.' },
]

const CAMPO = 'min-h-12 rounded-xl border-2 border-teal-200 px-3 text-base'
const LINHA = 'flex items-center justify-between gap-2 font-bold'

interface Props {
  inicial: Drill
  aoSalvar: (drill: Drill) => void
  aoCancelar: () => void
  /** Só para drills criados: apagar */
  aoApagar?: () => void
}

const alternar = <T,>(lista: T[], item: T) => (lista.includes(item) ? lista.filter((x) => x !== item) : [...lista, item])

export function EditorDrill({ inicial, aoSalvar, aoCancelar, aoApagar }: Props) {
  const [d, setD] = useState<Drill>({ ...inicial, instrucoes: [...inicial.instrucoes, '', '', '', ''].slice(0, 4) })
  const [erro, setErro] = useState('')
  const [confirmarApagar, setConfirmarApagar] = useState(false)
  const mudar = (parte: Partial<Drill>) => setD((x) => ({ ...x, ...parte }))
  const seg = (ms: number) => ms / 1000

  function salvar() {
    if (!d.nome.trim()) return setErro('Dê um nome ao drill.')
    const possiveis = sinaisPossiveis(d).length
    if (possiveis === 0) return setErro('Escolha pelo menos uma cor, seta ou número.')
    if (d.modo === 'toque' && possiveis < 2) return setErro('No modo toque, escolha pelo menos 2 sinais (senão não há o que decidir).')
    aoSalvar({
      ...d,
      nome: d.nome.trim(),
      descricao: d.descricao.trim() || resumoSinais(d),
      instrucoes: d.instrucoes.map((p) => p.trim()).filter(Boolean),
      esperaMaxMs: Math.max(d.esperaMinMs, d.esperaMaxMs),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-base font-bold">
        Nome do drill
        <input type="text" value={d.nome} maxLength={30} onChange={(e) => mudar({ nome: e.target.value })} className={CAMPO} />
      </label>
      <label className="flex flex-col gap-1 text-base font-bold">
        Frase curta (opcional)
        <input type="text" value={d.descricao} maxLength={50} onChange={(e) => mudar({ descricao: e.target.value })} className={CAMPO} />
      </label>

      <fieldset>
        <legend className="mb-1 text-base font-bold">Ícone</legend>
        <div className="grid grid-cols-8 gap-1">
          {ICONES.map((i) => (
            <button
              key={i}
              type="button"
              aria-pressed={d.emoji === i}
              aria-label={`Ícone ${i}`}
              onClick={() => mudar({ emoji: i })}
              className={`grid aspect-square place-items-center rounded-xl border-4 text-xl ${d.emoji === i ? 'border-teal-600 bg-teal-100' : 'border-transparent bg-teal-50'}`}
            >
              {i}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-base font-bold">Como a criança responde</legend>
        {MODOS.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={d.modo === m.id}
            onClick={() => mudar({ modo: m.id })}
            className={`flex flex-col items-start rounded-xl border-4 p-2 text-left ${d.modo === m.id ? 'border-teal-600 bg-teal-100' : 'border-teal-100 bg-white'}`}
          >
            <span className="font-extrabold">{m.nome}</span>
            <span className="text-sm">{m.explica}</span>
          </button>
        ))}
      </fieldset>

      {/* Sinais */}
      <fieldset className="flex flex-col gap-3 rounded-2xl border-4 border-teal-200 p-3">
        <legend className="px-1 text-base font-bold">Sinais que podem aparecer</legend>

        <div>
          <p className="mb-1 font-bold">🎨 Cores</p>
          <div className="grid grid-cols-3 gap-2">
            {CORES.map((c) => {
              const ativo = d.cores.includes(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => mudar({ cores: alternar<CorId>(d.cores, c.id) })}
                  className={`min-h-12 rounded-xl border-4 text-sm font-extrabold ${ativo ? 'border-slate-900' : 'border-transparent opacity-40'}`}
                  style={{ background: c.fundo, color: c.texto }}
                >
                  {ativo ? '✓ ' : ''}
                  {c.nome}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-1 font-bold">➡️ Setas</p>
          <div className="grid grid-cols-3 gap-2">
            {DIRECOES.map((dir) => {
              const ativo = d.setas.includes(dir.id)
              return (
                <button
                  key={dir.id}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => mudar({ setas: alternar<DirecaoId>(d.setas, dir.id) })}
                  className={`flex min-h-12 flex-col items-center justify-center rounded-xl border-4 text-xs leading-tight font-bold ${ativo ? 'border-teal-600 bg-teal-100' : 'border-teal-100 bg-white'}`}
                >
                  <span className="text-xl">{dir.simbolo}</span>
                  {dir.nome}
                </button>
              )
            })}
          </div>
          {d.setas.length > 0 && (
            <label className="mt-2 flex items-start gap-2 rounded-xl bg-teal-50 p-2 text-sm">
              <input type="checkbox" checked={d.setaVermelha} onChange={(e) => mudar({ setaVermelha: e.target.checked })} className="mt-1 size-5 accent-teal-600" />
              <span>
                <b>Seta verde e vermelha</b>: verde = vai para onde aponta, vermelha = vai para o lado contrário (treina a decisão).
              </span>
            </label>
          )}
        </div>

        <div className={LINHA}>
          <span>🔢 Números (de 1 até)</span>
          <CampoNumero valor={d.numeros} min={0} max={6} aoMudar={(numeros) => mudar({ numeros })} rotulo="números" />
        </div>
        <p className="-mt-2 text-xs">0 = sem números.</p>
      </fieldset>

      {/* Volume e tempos */}
      <fieldset className="flex flex-col gap-3 rounded-2xl border-4 border-teal-200 p-3">
        <legend className="px-1 text-base font-bold">Séries e tempos</legend>
        <div className={LINHA}>
          <span>Séries</span>
          <CampoNumero valor={d.series} min={1} max={10} aoMudar={(series) => mudar({ series })} rotulo="séries" />
        </div>
        <div className={LINHA}>
          <span>Sinais por série</span>
          <CampoNumero valor={d.repeticoes} min={1} max={40} aoMudar={(repeticoes) => mudar({ repeticoes })} rotulo="sinais por série" />
        </div>
        {d.series > 1 && (
          <div className={LINHA}>
            <span>Descanso (s)</span>
            <CampoNumero valor={d.descansoS} min={0} max={180} passo={5} aoMudar={(descansoS) => mudar({ descansoS })} rotulo="segundos de descanso" />
          </div>
        )}
        <div className={LINHA}>
          <span>Sinal na tela (s)</span>
          <CampoNumero valor={seg(d.exibicaoMs)} min={0.5} max={10} passo={0.5} aoMudar={(s) => mudar({ exibicaoMs: s * 1000 })} rotulo="segundos com o sinal na tela" />
        </div>
        <p className="-mt-2 text-xs">{d.modo === 'toque' ? 'É o tempo que a criança tem para responder.' : 'Depois some e vem a espera.'}</p>
        <div className={LINHA}>
          <span>Espera mínima (s)</span>
          <CampoNumero valor={seg(d.esperaMinMs)} min={0.5} max={20} passo={0.5} aoMudar={(s) => mudar({ esperaMinMs: s * 1000, esperaMaxMs: Math.max(d.esperaMaxMs, s * 1000) })} rotulo="segundos de espera mínima" />
        </div>
        <div className={LINHA}>
          <span>Espera máxima (s)</span>
          <CampoNumero valor={seg(d.esperaMaxMs)} min={seg(d.esperaMinMs)} max={30} passo={0.5} aoMudar={(s) => mudar({ esperaMaxMs: s * 1000 })} rotulo="segundos de espera máxima" />
        </div>
        <p className="-mt-2 text-xs">O app sorteia um tempo entre a mínima e a máxima: assim a criança não adivinha quando vem o sinal. Dê tempo de voltar à posição.</p>
        <label className="flex items-start gap-2 text-base font-bold">
          <input type="checkbox" checked={d.voz} onChange={(e) => mudar({ voz: e.target.checked })} className="mt-1 size-5 accent-teal-600" />
          <span>
            🗣️ Falar o sinal em voz alta
            <span className="block text-xs font-medium">Bom quando o celular está longe. Usa a voz do próprio celular.</span>
          </span>
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-base font-bold">Como montar e o que fazer (frases curtas)</legend>
        {d.instrucoes.map((p, i) => (
          <input
            key={i}
            type="text"
            value={p}
            maxLength={120}
            aria-label={`Instrução ${i + 1}`}
            placeholder={i === 0 ? 'Ex.: Coloque 3 cones coloridos a 2 passos' : `Instrução ${i + 1}`}
            onChange={(e) => mudar({ instrucoes: d.instrucoes.map((x, k) => (k === i ? e.target.value : x)) })}
            className={CAMPO}
          />
        ))}
      </fieldset>

      {erro && (
        <p role="alert" className="font-bold text-red-700">
          ❌ {erro}
        </p>
      )}
      <button type="button" onClick={salvar} className="min-h-16 rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
        Salvar drill ✅
      </button>
      <button type="button" onClick={aoCancelar} className="min-h-12 rounded-2xl border-4 border-teal-200 bg-white font-bold">
        Voltar sem salvar
      </button>
      {aoApagar && (
        <button
          type="button"
          onClick={() => (confirmarApagar ? aoApagar() : setConfirmarApagar(true))}
          className="min-h-12 rounded-2xl border-4 border-red-200 bg-white font-bold text-red-800"
        >
          {confirmarApagar ? 'Confirmar: apagar este drill' : '🗑️ Apagar este drill'}
        </button>
      )}
    </div>
  )
}
