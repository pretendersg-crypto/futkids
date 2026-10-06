// Formulário para adicionar (ou editar) um vídeo de treino: tipo, ícone, nome e link do YouTube.
// O tipo diz qual série animada do app corresponde ao vídeo e o que marca o dia como feito.
import { useState, type FormEvent } from 'react'
import { ICONES_TREINO, TIPOS_TREINO, tipoPorId, type TreinoExtra } from '../../../data/calendarioGoleiros'
import { linkYoutube } from '../../../utils/link'

interface Props {
  /** Editando um vídeo já adicionado (sem = vídeo novo) */
  inicial?: TreinoExtra
  aoSalvar: (dados: Omit<TreinoExtra, 'id'>) => void
}

export function FormVideo({ inicial, aoSalvar }: Props) {
  const [tipo, setTipo] = useState(inicial?.tipo ?? TIPOS_TREINO[0].id)
  const [emoji, setEmoji] = useState(inicial?.emoji ?? TIPOS_TREINO[0].emoji)
  const [nome, setNome] = useState(inicial?.nome ?? '')
  const [link, setLink] = useState(inicial?.videoUrl ?? '')
  const [erro, setErro] = useState('')

  function escolherTipo(id: string) {
    // Ícone acompanha o tipo, a não ser que os pais já tenham escolhido outro
    if (emoji === tipoPorId(tipo).emoji) setEmoji(tipoPorId(id).emoji)
    setTipo(id)
  }

  function salvar(e: FormEvent) {
    e.preventDefault()
    const url = linkYoutube(link)
    if (!url) return setErro('Cole um link do YouTube (youtube.com ou youtu.be).')
    aoSalvar({ tipo, emoji, nome: nome.trim() || tipoPorId(tipo).nome, videoUrl: url })
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-3">
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-base font-bold">Tipo de treino</legend>
        <div className="grid grid-cols-2 gap-2">
          {TIPOS_TREINO.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tipo === t.id}
              onClick={() => escolherTipo(t.id)}
              className={`flex min-h-12 items-center gap-2 rounded-xl border-4 px-2 text-left text-sm leading-tight font-bold ${
                tipo === t.id ? 'border-violet-600 bg-violet-100' : 'border-violet-100 bg-white'
              }`}
            >
              <span aria-hidden className="text-xl">
                {t.emoji}
              </span>
              {t.nome}
            </button>
          ))}
        </div>
        {!tipoPorId(tipo).rota && <p className="text-xs">Este tipo não tem versão animada no app: só o vídeo.</p>}
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-base font-bold">Ícone</legend>
        <div className="grid grid-cols-8 gap-1">
          {ICONES_TREINO.map((i) => (
            <button
              key={i}
              type="button"
              aria-pressed={emoji === i}
              aria-label={`Ícone ${i}`}
              onClick={() => setEmoji(i)}
              className={`grid aspect-square place-items-center rounded-xl border-4 text-xl ${emoji === i ? 'border-violet-600 bg-violet-100' : 'border-transparent bg-violet-50'}`}
            >
              {i}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-base font-bold">
        Nome (opcional)
        <input
          type="text"
          value={nome}
          maxLength={40}
          placeholder={tipoPorId(tipo).nome}
          onChange={(e) => setNome(e.target.value)}
          className="min-h-12 rounded-xl border-2 border-violet-200 px-3 text-base"
        />
      </label>

      <label className="flex flex-col gap-1 text-base font-bold">
        Link do YouTube
        <input
          type="url"
          inputMode="url"
          value={link}
          placeholder="https://youtu.be/..."
          onChange={(e) => {
            setLink(e.target.value)
            setErro('')
          }}
          className="min-h-12 rounded-xl border-2 border-violet-200 px-3 text-base"
        />
      </label>
      {erro && (
        <p role="alert" className="font-bold text-red-700">
          ❌ {erro}
        </p>
      )}

      <button type="submit" className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow">
        {inicial ? 'Salvar alterações ✅' : 'Adicionar vídeo ✅'}
      </button>
    </form>
  )
}
