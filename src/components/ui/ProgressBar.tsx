// Barra de progresso (XP, séries de exercício etc.), acessível para leitores de tela.
interface Props {
  valor: number
  maximo: number
  /** Texto lido pelo leitor de tela, ex.: "XP do nível" */
  rotulo: string
  /** Classe Tailwind da cor de preenchimento */
  cor?: string
}

export function ProgressBar({ valor, maximo, rotulo, cor = 'bg-sol' }: Props) {
  const porcentagem = maximo > 0 ? Math.min(100, Math.max(0, (valor / maximo) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={0}
      aria-valuemax={maximo}
      aria-valuenow={valor}
      className="h-5 w-full overflow-hidden rounded-full border-2 border-campo-escuro/30 bg-green-50"
    >
      <div className={`h-full rounded-full ${cor} transition-[width] duration-500`} style={{ width: `${porcentagem}%` }} />
    </div>
  )
}
