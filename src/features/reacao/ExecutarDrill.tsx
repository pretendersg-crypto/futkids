// Execução de um drill de reação, em tela cheia (cobre a barra de baixo). Quem conta o tempo e
// sorteia os sinais é o motor (motor.ts); aqui só desenhamos a fase atual e passamos os toques.
// No modo "toque" a criança responde na tela e o app mede o tempo de reação.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useWakeLock } from '../../hooks/useWakeLock'
import type { Drill } from './drills'
import { formatarMs, PLACAR_ZERO, type Placar } from './finalizar'
import { criarMotor, type Fase, type Motor, type Retorno } from './motor'
import { botoesDeResposta, corPorId } from './sinais'
import { TelaSinal } from './TelaSinal'

interface Props {
  drill: Drill
  /** Chamado uma vez: completo = chegou ao fim; false = parou no meio */
  aoTerminar: (placar: Placar, completo: boolean, duracaoS: number) => void
}

export function ExecutarDrill({ drill, aoTerminar }: Props) {
  const toque = drill.modo === 'toque'
  const [fase, setFase] = useState<Fase>({ nome: 'contagem', n: 3 })
  const [placar, setPlacar] = useState<Placar>(PLACAR_ZERO)
  const [retorno, setRetorno] = useState<Retorno>(null)
  const [pausado, setPausado] = useState(false)
  const motor = useRef<Motor | null>(null)

  useWakeLock(!pausado)

  // Liga o motor ao abrir a tela e desliga ao sair
  useEffect(() => {
    const m = criarMotor(drill, { fase: setFase, placar: setPlacar, retorno: setRetorno, fim: aoTerminar })
    motor.current = m
    m.iniciar()
    // Saiu do app (ligação, trocou de tela): pausa sozinho
    const aoSair = () => document.visibilityState === 'hidden' && m.pausar() && setPausado(true)
    document.addEventListener('visibilitychange', aoSair)
    return () => {
      document.removeEventListener('visibilitychange', aoSair)
      m.desligar()
    }
  }, [drill, aoTerminar])

  // O cronômetro da reação começa quando o sinal já está na tela (depois do React desenhar)
  useLayoutEffect(() => {
    if (fase.nome === 'sinal') motor.current?.sinalNaTela()
  }, [fase])

  const pausar = () => motor.current?.pausar() && setPausado(true)
  const continuar = () => {
    setPausado(false)
    motor.current?.continuar()
  }

  const botoes = toque ? botoesDeResposta(drill) : []
  // Modo automático: a cor pinta a tela inteira (dá para ver de longe)
  const fundoCor = fase.nome === 'sinal' && !toque && fase.sinal.tipo === 'cor' ? corPorId(fase.sinal.cor).fundo : undefined

  return (
    <div
      className={`fixed inset-0 z-30 flex flex-col gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-slate-800 text-white`}
      style={fundoCor ? { background: fundoCor } : undefined}
    >
      {/* Topo: série, sinal e pausa */}
      <header className="flex items-center gap-2">
        <span className="flex-1 text-base leading-tight font-extrabold">
          {drill.emoji} Série {placar.serie}/{drill.series} · Sinal {Math.min(placar.rep, drill.repeticoes)}/{drill.repeticoes}
        </span>
        {toque && (
          <span className="rounded-full bg-white/15 px-3 py-1 font-bold">
            ✅ {placar.acertos} ❌ {placar.erros + placar.perdidos}
          </span>
        )}
        <button type="button" onClick={pausar} aria-label="Pausar" className="grid size-14 place-items-center rounded-full bg-white text-3xl text-slate-900">
          ⏸️
        </button>
      </header>

      {/* Área do sinal */}
      <div className="@container relative flex min-h-0 flex-1 items-center justify-center">
        {fase.nome === 'contagem' && (
          <span key={fase.n} className="pop text-[10rem] leading-none font-black">
            {fase.n > 0 ? fase.n : 'Já!'}
          </span>
        )}
        {fase.nome === 'espera' && (
          <div className="flex flex-col items-center gap-4 text-center">
            {toque && retorno && !('cedo' in retorno) && (
              <p className={`pop text-4xl font-black ${retorno.certo ? 'text-green-300' : 'text-red-300'}`}>
                {retorno.certo ? `✅ ${formatarMs(retorno.ms)}` : retorno.perdido ? '⏰ Passou!' : '❌ Errou'}
              </p>
            )}
            <span aria-hidden className="text-7xl">
              👀
            </span>
            <p className="text-2xl font-extrabold">{retorno && 'cedo' in retorno ? 'Calma! Espere o sinal 😉' : 'Prepare-se…'}</p>
          </div>
        )}
        {fase.nome === 'sinal' && (
          <div className="absolute inset-0">
            <TelaSinal sinal={fase.sinal} tamanho={toque ? 200 : 320} />
          </div>
        )}
        {fase.nome === 'descanso' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <span aria-hidden className="text-7xl">
              💧
            </span>
            <p className="text-3xl font-extrabold">Descanso</p>
            <p className="text-8xl leading-none font-black tabular-nums">{fase.resta}</p>
            <p className="text-xl">
              Próxima: série {placar.serie + 1} de {drill.series}
            </p>
            <button
              type="button"
              onClick={() => motor.current?.pularDescanso()}
              className="mt-2 min-h-14 rounded-2xl bg-white px-6 text-xl font-extrabold text-slate-900"
            >
              Pular descanso ⏭️
            </button>
          </div>
        )}
      </div>

      {/* Botões de resposta (modo toque) */}
      {toque && (
        // Deitado (tablet/celular na horizontal): todos os botões numa linha só, sobra altura para o sinal
        <div className={`grid gap-2 landscape:grid-flow-col landscape:auto-cols-fr landscape:grid-cols-none ${botoes.length > 4 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {botoes.map((b) => (
            <button
              key={b.id}
              type="button"
              // pointerdown responde no instante do toque (o click espera o dedo sair)
              onPointerDown={(e) => {
                e.preventDefault()
                motor.current?.responder(b.id)
              }}
              aria-label={b.cor ? b.cor.nome : b.rotulo}
              className="min-h-20 touch-manipulation landscape:min-h-16 rounded-2xl border-4 border-white/70 text-4xl font-black select-none active:scale-95"
              style={b.cor ? { background: b.cor.fundo, color: b.cor.texto } : { background: '#f8fafc', color: '#0f172a' }}
            >
              {b.cor ? <span className="text-lg uppercase">{b.cor.nome}</span> : b.rotulo}
            </button>
          ))}
        </div>
      )}

      {/* Pausa */}
      {pausado && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-slate-900/95 p-6 text-center">
          <p className="text-4xl font-black">⏸️ Pausado</p>
          <p className="text-lg">
            {placar.sinais} sinais até agora · série {placar.serie} de {drill.series}
          </p>
          <button type="button" onClick={continuar} className="min-h-16 w-full max-w-xs rounded-3xl bg-sol text-2xl font-extrabold text-slate-900 shadow-lg">
            Continuar ▶️
          </button>
          <button type="button" onClick={() => motor.current?.terminar()} className="min-h-14 w-full max-w-xs rounded-3xl border-4 border-white/60 text-xl font-extrabold">
            Terminar e salvar 🏁
          </button>
        </div>
      )}
    </div>
  )
}
