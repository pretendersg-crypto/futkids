// Formulário de um exercício (área dos pais): nome, ícone, tipo e quantidade, velocidade do
// bonequinho, qual movimento ele faz (galeria com prévia) ou um GIF próprio, e os passos.
import { useState, type ChangeEvent } from 'react'
import type { Exercicio, TipoExercicio } from '../../../../data/catalogo'
import { CampoNumero } from '../../../../components/ui/CampoNumero'
import { ICONES_TREINO } from '../../../../data/calendarioGoleiros'
import { ANIMACOES } from '../../../treino/animacoes'
import { BonecoAnimado } from '../../../treino/BonecoAnimado'
import { Demonstracao } from '../../../treino/Demonstracao'
import { descreverMeta, duracaoDoExercicio } from '../../../treino/recompensa'
import { salvarImagem } from '../../../../utils/midiaLocal'

interface Props {
  inicial: Exercicio
  aoSalvar: (exercicio: Exercicio) => void
}

const TIPOS: { id: TipoExercicio; nome: string; unidade: string; max: number }[] = [
  { id: 'tempo', nome: '⏱️ Por tempo', unidade: 'segundos', max: 300 },
  { id: 'repeticoes', nome: '🔁 Repetições', unidade: 'vezes', max: 100 },
  { id: 'intervalos', nome: '🐇 Rápido e devagar', unidade: 'rodadas', max: 20 },
]

const CAMPO = 'min-h-12 rounded-xl border-2 border-violet-200 px-3 text-base'

export function EditorExercicio({ inicial, aoSalvar }: Props) {
  const [ex, setEx] = useState<Exercicio>({ ...inicial, passos: [...inicial.passos, '', '', ''].slice(0, 3) })
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const mudar = (parte: Partial<Exercicio>) => setEx((e) => ({ ...e, ...parte }))
  const tipo = TIPOS.find((t) => t.id === ex.tipo)!

  async function enviarGif(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setEnviando(true)
    setErro('')
    try {
      mudar({ gif: await salvarImagem(arquivo) })
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não deu para guardar a imagem.')
    } finally {
      setEnviando(false)
    }
  }

  function salvar() {
    if (!ex.nome.trim()) return setErro('Dê um nome ao exercício.')
    aoSalvar({
      ...ex,
      nome: ex.nome.trim(),
      passos: ex.passos.map((p) => p.trim()).filter(Boolean),
      intervalo: ex.tipo === 'intervalos' ? (ex.intervalo ?? { forteS: 15, fracoS: 15 }) : undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Prévia ao vivo */}
      <div className="flex flex-col items-center gap-1 rounded-2xl bg-violet-50 p-2">
        <Demonstracao exercicio={ex} tamanho={120} />
        <p className="text-center text-sm font-bold">
          {ex.emoji} {ex.nome || 'Sem nome'} · {descreverMeta(ex)} · uns {Math.round(duracaoDoExercicio(ex) / 1000)} s
        </p>
      </div>

      <label className="flex flex-col gap-1 text-base font-bold">
        Nome
        <input type="text" value={ex.nome} maxLength={40} onChange={(e) => mudar({ nome: e.target.value })} className={CAMPO} />
      </label>

      <fieldset>
        <legend className="mb-1 text-base font-bold">Ícone</legend>
        <div className="grid grid-cols-8 gap-1">
          {ICONES_TREINO.map((i) => (
            <button
              key={i}
              type="button"
              aria-pressed={ex.emoji === i}
              aria-label={`Ícone ${i}`}
              onClick={() => mudar({ emoji: i })}
              className={`grid aspect-square place-items-center rounded-xl border-4 text-xl ${ex.emoji === i ? 'border-violet-600 bg-violet-100' : 'border-transparent bg-violet-50'}`}
            >
              {i}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-base font-bold">Como conta</legend>
        <div className="grid grid-cols-3 gap-2">
          {TIPOS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={ex.tipo === t.id}
              onClick={() => mudar({ tipo: t.id, meta: Math.min(ex.meta, t.max) })}
              className={`min-h-14 rounded-xl border-4 px-1 text-sm leading-tight font-bold ${ex.tipo === t.id ? 'border-violet-600 bg-violet-100' : 'border-violet-100 bg-white'}`}
            >
              {t.nome}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <CampoNumero valor={ex.meta} min={1} max={tipo.max} passo={ex.tipo === 'tempo' ? 5 : 1} aoMudar={(meta) => mudar({ meta })} rotulo={tipo.unidade} />
          <span className="text-base font-bold">{tipo.unidade}</span>
        </div>
        {ex.tipo === 'intervalos' && (
          <div className="flex flex-col gap-2 rounded-xl bg-violet-50 p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold">🔥 Rápido (s)</span>
              <CampoNumero
                valor={ex.intervalo?.forteS ?? 15}
                min={5}
                max={60}
                aoMudar={(forteS) => mudar({ intervalo: { forteS, fracoS: ex.intervalo?.fracoS ?? 15 } })}
                rotulo="segundos rápidos"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold">🐢 Devagar (s)</span>
              <CampoNumero
                valor={ex.intervalo?.fracoS ?? 15}
                min={5}
                max={60}
                aoMudar={(fracoS) => mudar({ intervalo: { forteS: ex.intervalo?.forteS ?? 15, fracoS } })}
                rotulo="segundos devagar"
              />
            </div>
          </div>
        )}
      </fieldset>

      <label className="flex flex-col gap-1 text-base font-bold">
        Velocidade do bonequinho: 1 movimento a cada {(ex.ritmoMs / 1000).toLocaleString('pt-BR')} s
        <input
          type="range"
          min={400}
          max={8000}
          step={100}
          value={ex.ritmoMs}
          onChange={(e) => mudar({ ritmoMs: Number(e.target.value) })}
          className="accent-violet-600"
        />
        <span className="flex justify-between text-xs font-medium">
          <span>mais rápido</span>
          <span>mais devagar</span>
        </span>
        {ex.tipo === 'repeticoes' && <span className="text-xs font-medium">Nas repetições, é também o tempo de cada uma (o app conta no ritmo).</span>}
      </label>

      <fieldset>
        <legend className="mb-1 text-base font-bold">Movimento do bonequinho</legend>
        <div className="grid grid-cols-3 gap-2">
          {ANIMACOES.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={ex.animacao === a.id}
              onClick={() => mudar({ animacao: a.id, ritmoMs: ex.animacao === a.id ? ex.ritmoMs : a.ritmoSugerido })}
              className={`flex flex-col items-center rounded-xl border-4 p-1 text-xs leading-tight font-bold ${ex.animacao === a.id ? 'border-violet-600 bg-violet-100' : 'border-violet-100 bg-white'}`}
            >
              <BonecoAnimado animacao={a.id} ritmoMs={a.ritmoSugerido} tamanho={56} />
              {a.nome}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2 rounded-2xl border-4 border-dashed border-violet-200 p-2">
        <legend className="px-1 text-base font-bold">GIF próprio (opcional)</legend>
        <p className="text-sm">Use um GIF ou imagem do celular no lugar do bonequinho (até 3 MB). Fica só neste aparelho.</p>
        <label className="grid min-h-12 cursor-pointer place-items-center rounded-xl bg-violet-600 px-3 font-bold text-white">
          {enviando ? 'Guardando…' : ex.gif ? '🔄 Trocar GIF' : '📁 Escolher GIF'}
          <input type="file" accept="image/gif,image/webp,image/png,image/jpeg" onChange={enviarGif} className="sr-only" />
        </label>
        {ex.gif && (
          <button type="button" onClick={() => mudar({ gif: undefined })} className="min-h-11 rounded-xl border-2 border-violet-200 font-bold">
            Usar o bonequinho de novo
          </button>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-base font-bold">Passos (frases curtas para a criança)</legend>
        {ex.passos.map((p, i) => (
          <input
            key={i}
            type="text"
            value={p}
            maxLength={60}
            aria-label={`Passo ${i + 1}`}
            placeholder={`Passo ${i + 1}`}
            onChange={(e) => mudar({ passos: ex.passos.map((x, k) => (k === i ? e.target.value : x)) })}
            className={CAMPO}
          />
        ))}
      </fieldset>

      {erro && (
        <p role="alert" className="font-bold text-red-700">
          ❌ {erro}
        </p>
      )}
      <button type="button" onClick={salvar} className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow">
        Pronto ✅
      </button>
    </div>
  )
}
