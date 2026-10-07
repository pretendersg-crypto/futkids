// Criar ou mudar um fundamento/gesto do goleiro (área dos pais): nome, categoria, resumo, como
// fazer, cuidado, desenho (um dos prontos ou imagem/GIF própria) e vídeo real (YouTube e/ou
// gravado). Só grava ao tocar em "Salvar gesto".
import { useState, type ChangeEvent } from 'react'
import { CATEGORIAS_GESTO, POSE_IDS, type Gesto } from '../../../saidaGol/gestos'
import { DesenhoGesto } from '../../../saidaGol/DesenhoGesto'
import { useGestos } from '../../../saidaGol/useGestos'
import { ehGestoPronto, useGestosStore } from '../../../../stores/gestosStore'
import { limparMidiaSolta } from '../../../../utils/limparMidia'
import { linkYoutube } from '../../../../utils/link'
import { salvarImagem } from '../../../../utils/midiaLocal'
import { CampoVideoReal } from '../CampoVideoReal'

interface Props {
  /** Gesto a mudar; null = gesto novo */
  id: string | null
  aoVoltar: () => void
}

const CAMPO = 'min-h-12 rounded-xl border-2 border-violet-200 px-3 text-base font-normal'
const MAX_PASSOS = 5

function gestoNovo(): Gesto {
  return {
    id: `gesto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    nome: '',
    categoria: 'postura',
    resumo: '',
    comoFazer: [],
    atencao: '',
    desenho: { tipo: 'pose', pose: 'base' },
  }
}

export function EditorGesto({ id, aoVoltar }: Props) {
  const gestos = useGestos()
  const loja = useGestosStore()
  const [g, setG] = useState<Gesto>(() => {
    const atual = (id && gestos.find((x) => x.id === id)) || gestoNovo()
    return { ...atual, comoFazer: [...atual.comoFazer, ...Array<string>(MAX_PASSOS).fill('')].slice(0, MAX_PASSOS) }
  })
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [confirmar, setConfirmar] = useState<'apagar' | 'restaurar' | null>(null)
  const mudar = (parte: Partial<Gesto>) => setG((x) => ({ ...x, ...parte }))
  const pronto = ehGestoPronto(g.id)
  const editado = pronto && !!loja.editados[g.id]

  function voltar() {
    // Imagens/vídeos trocados ou desistidos não ficam ocupando o aparelho
    limparMidiaSolta()
    aoVoltar()
  }

  async function enviarImagem(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setEnviando(true)
    setErro('')
    try {
      mudar({ desenho: { tipo: 'imagem', id: await salvarImagem(arquivo) } })
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não deu para guardar a imagem.')
    } finally {
      setEnviando(false)
    }
  }

  function salvar() {
    if (!g.nome.trim()) return setErro('Dê um nome ao gesto.')
    const comoFazer = g.comoFazer.map((t) => t.trim()).filter(Boolean)
    if (comoFazer.length === 0) return setErro('Escreva pelo menos um passo de "como fazer".')
    const video = g.video?.trim() ? linkYoutube(g.video) : undefined
    if (g.video?.trim() && !video) return setErro('O link do vídeo precisa ser do YouTube (youtube.com ou youtu.be).')
    loja.salvarGesto({ ...g, nome: g.nome.trim(), resumo: g.resumo.trim(), atencao: g.atencao.trim(), comoFazer, video: video ?? undefined })
    voltar()
  }

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={voltar} className="min-h-12 self-start rounded-2xl bg-white px-4 text-lg font-bold shadow">
        ⬅️ Voltar sem salvar
      </button>
      <h2 className="text-2xl font-extrabold">{id ? `✏️ ${g.nome || 'Gesto'}` : '➕ Novo gesto'}</h2>
      {pronto && <p className="rounded-2xl bg-violet-50 p-3 text-sm">Este gesto vem no app. {editado && 'Ele já foi mudado neste aparelho.'}</p>}

      <div className="self-center rounded-3xl bg-green-50 p-2">
        <DesenhoGesto desenho={g.desenho} nome={g.nome || 'Novo gesto'} tamanho={150} />
      </div>

      <label className="flex flex-col gap-1 text-base font-bold">
        Nome
        <input type="text" value={g.nome} maxLength={40} onChange={(e) => mudar({ nome: e.target.value })} className={CAMPO} />
      </label>

      <fieldset>
        <legend className="mb-1 text-base font-bold">Categoria</legend>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIAS_GESTO.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={g.categoria === c.id}
              onClick={() => mudar({ categoria: c.id })}
              className={`flex min-h-12 items-center gap-2 rounded-xl border-4 px-2 text-left text-sm leading-tight font-bold ${
                g.categoria === c.id ? 'border-violet-600 bg-violet-100' : 'border-violet-100 bg-white'
              }`}
            >
              <span aria-hidden className="text-xl">
                {c.emoji}
              </span>
              {c.nome}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-base font-bold">
        Frase curta
        <input type="text" value={g.resumo} maxLength={60} placeholder="Ex.: Cair de lado para pegar a bola baixa" onChange={(e) => mudar({ resumo: e.target.value })} className={CAMPO} />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-base font-bold">Como fazer (passo a passo, frases curtas)</legend>
        {g.comoFazer.map((t, i) => (
          <input
            key={i}
            type="text"
            value={t}
            maxLength={120}
            aria-label={`Passo ${i + 1}`}
            placeholder={`Passo ${i + 1}`}
            onChange={(e) => mudar({ comoFazer: g.comoFazer.map((x, k) => (k === i ? e.target.value : x)) })}
            className={CAMPO}
          />
        ))}
      </fieldset>

      <label className="flex flex-col gap-1 text-base font-bold">
        ⚠️ Cuidado / erro mais comum
        <input type="text" value={g.atencao} maxLength={160} onChange={(e) => mudar({ atencao: e.target.value })} className={CAMPO} />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-base font-bold">Desenho</legend>
        <div className="grid grid-cols-4 gap-1">
          {POSE_IDS.map((pose) => {
            const escolhido = g.desenho.tipo === 'pose' && g.desenho.pose === pose
            return (
              <button
                key={pose}
                type="button"
                aria-pressed={escolhido}
                aria-label={`Desenho ${pose}`}
                onClick={() => mudar({ desenho: { tipo: 'pose', pose } })}
                className={`grid place-items-center rounded-xl border-4 bg-green-50 ${escolhido ? 'border-violet-600' : 'border-transparent'}`}
              >
                <DesenhoGesto desenho={{ tipo: 'pose', pose }} nome={pose} tamanho={64} />
              </button>
            )
          })}
        </div>
        <label className="grid min-h-12 cursor-pointer place-items-center rounded-xl bg-violet-600 px-3 font-bold text-white">
          {enviando ? 'Guardando…' : g.desenho.tipo === 'imagem' ? '🔄 Trocar imagem própria' : '📁 Usar imagem ou GIF próprio'}
          <input type="file" accept="image/gif,image/webp,image/png,image/jpeg" onChange={enviarImagem} className="sr-only" />
        </label>
        <p className="text-xs">Imagem ou GIF do celular (até 3 MB), por exemplo uma foto do goleiro fazendo o gesto. Fica só neste aparelho.</p>
      </fieldset>

      <CampoVideoReal video={g.video} videoLocal={g.videoLocal} aoMudar={mudar} />

      {erro && (
        <p role="alert" className="font-bold text-red-700">
          ❌ {erro}
        </p>
      )}
      <button type="button" onClick={salvar} className="min-h-16 rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
        Salvar gesto ✅
      </button>

      {editado && (
        <button
          type="button"
          onClick={() => {
            if (confirmar !== 'restaurar') return setConfirmar('restaurar')
            loja.restaurarGesto(g.id)
            voltar()
          }}
          className="min-h-12 rounded-2xl border-4 border-violet-200 bg-white font-bold"
        >
          {confirmar === 'restaurar' ? 'Confirmar: voltar ao original' : '↩️ Voltar ao gesto original'}
        </button>
      )}
      {!pronto && id && (
        <button
          type="button"
          onClick={() => {
            if (confirmar !== 'apagar') return setConfirmar('apagar')
            loja.removerGesto(g.id)
            voltar()
          }}
          className="min-h-12 rounded-2xl border-4 border-red-200 bg-white font-bold text-red-800"
        >
          {confirmar === 'apagar' ? 'Confirmar: apagar este gesto' : '🗑️ Apagar este gesto'}
        </button>
      )}
    </div>
  )
}
