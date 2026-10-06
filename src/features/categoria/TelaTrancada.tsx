// Tela de um treino ou vídeo que ainda não foi liberado: mostra a categoria que falta e quanto
// falta para chegar lá (sem bronca: é uma meta).
import { Link } from 'react-router'
import { Mascote } from '../../components/mascote/Mascote'
import { categoriaPorId, type CategoriaId } from '../../data/categorias'
import { useCategoria } from './categoria'

interface Props {
  categoria: CategoriaId
  titulo: string
  voltarPara: string
  textoVoltar: string
}

export function TelaTrancada({ categoria, titulo, voltarPara, textoVoltar }: Props) {
  const { atual, fixa, nivel } = useCategoria()
  const alvo = categoriaPorId(categoria)
  return (
    <div className="flex flex-col items-center gap-4 pt-6 text-center">
      <Mascote humor="torcendo" fala="Continue treinando que chega lá!" tamanho={80} />
      <span aria-hidden className="text-7xl">
        🔒
      </span>
      <h1 className="text-2xl font-extrabold">{titulo}</h1>
      <p className="text-lg">
        Este treino é da categoria{' '}
        <b>
          {alvo.emoji} {alvo.nome}
        </b>
        .
      </p>
      <p className="rounded-2xl bg-white p-3 text-lg shadow">
        Você é {atual.emoji} <b>{atual.nome}</b> (nível {nivel}).{' '}
        {fixa ? 'Peça para um adulto liberar na área dos pais.' : `Ele abre no nível ${alvo.nivelMinimo}!`}
      </p>
      <Link to={voltarPara} className="grid min-h-16 w-full place-items-center rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
        {textoVoltar}
      </Link>
    </div>
  )
}
