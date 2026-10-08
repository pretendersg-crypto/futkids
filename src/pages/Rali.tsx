// Menu do Rali de Gestos em dois blocos: 🎮 desafios na tela e 🏃 com o corpo (bola de verdade e
// celular no corpo, este só com um adulto liberando). ?tipo=corpo mostra o do corpo primeiro.
import { Link, useSearchParams } from 'react-router'
import { BlocoTipo } from '../components/ui/TipoAtividade'
import { DESAFIOS, type Desafio } from '../features/rali/desafios'
import { useProgressStore } from '../stores/progressStore'

const SECOES: { tipo: Desafio['tipo']; titulo: string; aviso?: string }[] = [
  { tipo: 'tela', titulo: 'Desafios na tela' },
  { tipo: 'bola', titulo: '⚽ Com bola de verdade' },
  { tipo: 'corpo', titulo: '📱 Celular no corpo', aviso: '🔒 Um adulto precisa liberar' },
]

export function Rali() {
  const recordes = useProgressStore((s) => s.recordes)
  const [params] = useSearchParams()

  const tela = (
    <BlocoTipo key="tela" tipo="tela" titulo="Rali na tela" explicacao="Embaixadinha, passe e chute com os dedos, olhando a tela.">
      {secoes(['tela'])}
    </BlocoTipo>
  )
  const corpo = (
    <BlocoTipo key="corpo" tipo="corpo" titulo="Rali com o corpo" explicacao="Com bola de verdade ou com o celular preso no corpo: o app conta os seus movimentos.">
      {secoes(['bola', 'corpo'])}
    </BlocoTipo>
  )

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-center text-3xl font-extrabold">⚽ Rali de Gestos</h1>
      {params.get('tipo') === 'corpo' ? [corpo, tela] : [tela, corpo]}
    </section>
  )

  function secoes(tipos: Desafio['tipo'][]) {
    return SECOES.filter((s) => tipos.includes(s.tipo)).map((secao) => (
        <div key={secao.tipo} className="flex flex-col gap-2">
          {tipos.length > 1 && <h2 className="text-xl font-extrabold">{secao.titulo}</h2>}
          {secao.aviso && <p className="-mt-1 text-sm font-bold">{secao.aviso}</p>}
          <ul className="flex flex-col gap-3">
            {DESAFIOS.filter((d) => d.tipo === secao.tipo).map((d) => {
              const recorde = recordes[`rali:${d.id}`]
              return (
                <li key={d.id}>
                  <Link
                    to={`/rali/${d.id}`}
                    className="flex min-h-22 items-center gap-4 rounded-3xl border-4 border-lime-500 bg-lime-100 p-3 shadow-md"
                  >
                    <span aria-hidden className="text-5xl">
                      {d.emoji}
                    </span>
                    <span className="flex flex-1 flex-col">
                      <span className="text-xl font-extrabold">{d.nome}</span>
                      <span className="text-base">{d.descricao}</span>
                      <span className="text-sm font-bold">{recorde !== undefined ? `🏅 Recorde: ${recorde} pontos` : '✨ Ainda não jogou'}</span>
                    </span>
                    <span aria-hidden className="text-3xl">
                      {d.tipo === 'corpo' ? '🔒' : '▶️'}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
    ))
  }
}
