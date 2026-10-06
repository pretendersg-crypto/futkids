// "Saltos de goleiro": o celular vai no corpo (bolso com zíper ou braçadeira) e o acelerômetro
// conta os pulos por 30 segundos, com um bip a cada pulo (a criança não olha a tela).
// Só começa depois de um adulto: portão dos pais + lista de segurança.
import { useEffect, useState } from 'react'
import { PortaoDosPais } from '../../components/ui/PortaoDosPais'
import { useTimer } from '../../hooks/useTimer'
import { pedirPermissaoMovimento, useContadorSaltos } from '../../hooks/useSensor'
import { useWakeLock } from '../../hooks/useWakeLock'
import { destravarSom, sons } from '../../utils/som'
import { FimRali } from './FimRali'
import { finalizarRali, type ResultadoRali } from './pontuacao'

const PREPARO_MS = 5000
const DURACAO_MS = 30000

const SEGURANCA = [
  'O celular está num bolso com zíper ou numa braçadeira',
  'O espaço em volta está livre (sem móveis, degraus ou quinas)',
  'A criança sabe: nunca pular segurando o celular na mão',
]

type Etapa = 'adulto' | 'seguranca' | 'preparo' | 'pulando' | 'sem-sensor'

export function SaltosGoleiro() {
  const [etapa, setEtapa] = useState<Etapa>('adulto')
  const [marcados, setMarcados] = useState<boolean[]>(SEGURANCA.map(() => false))
  const [saltos, setSaltos] = useState(0)
  const [resultado, setResultado] = useState<ResultadoRali | null>(null)
  const [rodada, setRodada] = useState(0)

  async function comecar() {
    destravarSom()
    const permitido = await pedirPermissaoMovimento()
    if (!permitido) return setEtapa('sem-sensor')
    setSaltos(0)
    setRodada((r) => r + 1)
    setEtapa('preparo')
  }

  if (resultado) {
    return (
      <FimRali
        resultado={resultado}
        detalhes={[`🦘 ${saltos} saltos em 30 segundos`]}
        aoJogarDeNovo={() => {
          setResultado(null)
          setEtapa('seguranca')
        }}
      />
    )
  }

  if (etapa === 'adulto') {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-2xl bg-yellow-100 p-3 text-lg font-bold">
          ⚠️ Neste desafio o celular fica no corpo da criança. Um adulto precisa liberar e acompanhar.
        </p>
        <PortaoDosPais aoLiberar={() => setEtapa('seguranca')} />
      </div>
    )
  }

  if (etapa === 'seguranca') {
    const tudoOk = marcados.every(Boolean)
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-extrabold">Antes de começar ✅</h2>
        {SEGURANCA.map((item, i) => (
          <label key={item} className="flex min-h-16 items-center gap-3 rounded-2xl bg-white p-3 text-lg shadow-sm">
            <input
              type="checkbox"
              checked={marcados[i]}
              onChange={(e) => setMarcados((m) => m.map((v, k) => (k === i ? e.target.checked : v)))}
              className="size-7 shrink-0 accent-campo"
            />
            {item}
          </label>
        ))}
        <button
          type="button"
          disabled={!tudoOk}
          onClick={comecar}
          className="min-h-16 rounded-3xl bg-sol text-2xl font-extrabold shadow-lg disabled:opacity-50"
        >
          Começar 🦘
        </button>
      </div>
    )
  }

  if (etapa === 'sem-sensor') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span aria-hidden className="text-7xl">
          📵
        </span>
        <p className="text-xl font-bold">Este celular não deixou usar o sensor de movimento.</p>
        <p className="text-lg">Que tal o desafio de embaixadinhas de verdade? Ele usa só toques.</p>
      </div>
    )
  }

  return (
    <Pulando
      key={rodada}
      etapa={etapa}
      saltos={saltos}
      aoComecarAPular={() => setEtapa('pulando')}
      aoSaltar={() => {
        sons.toque(0)
        setSaltos((s) => s + 1)
      }}
      aoSemSensor={() => setEtapa('sem-sensor')}
      aoTerminar={(total) => {
        sons.apito()
        setResultado(finalizarRali('saltos', total))
      }}
    />
  )
}

interface PropsPulando {
  etapa: 'preparo' | 'pulando'
  saltos: number
  aoComecarAPular: () => void
  aoSaltar: () => void
  aoSemSensor: () => void
  aoTerminar: (total: number) => void
}

/** Contagem para guardar o celular (5 s) e depois os 30 s de pulos */
function Pulando({ etapa, saltos, aoComecarAPular, aoSaltar, aoSemSensor, aoTerminar }: PropsPulando) {
  const pulando = etapa === 'pulando'
  useWakeLock(true) // no bolso a tela não pode apagar, senão o sensor para
  const estadoSensor = useContadorSaltos(true, () => pulando && aoSaltar())
  const preparo = useTimer(PREPARO_MS, !pulando, () => {
    sons.largada()
    aoComecarAPular()
  })
  const tempo = useTimer(DURACAO_MS, pulando, () => aoTerminar(saltos))

  useEffect(() => {
    if (estadoSensor === 'sem-sensor') aoSemSensor()
  }, [estadoSensor, aoSemSensor])

  const segundosPreparo = Math.ceil(preparo.restanteMs / 1000)
  useEffect(() => {
    if (!pulando && segundosPreparo > 0 && segundosPreparo <= 3) sons.contagem()
  }, [pulando, segundosPreparo])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center" aria-live="polite">
      {pulando ? (
        <>
          <p className="text-2xl font-bold">Pule! 🦘 Faltam {Math.ceil(tempo.restanteMs / 1000)} s</p>
          <span key={saltos} className="pop text-9xl font-black text-orange-600">
            {saltos}
          </span>
          <p className="text-lg">saltos</p>
        </>
      ) : (
        <>
          <p className="text-2xl font-bold">Guarde o celular no bolso 📱👖</p>
          <span key={segundosPreparo} className="pop text-9xl font-black text-orange-600">
            {segundosPreparo}
          </span>
          <p className="text-lg">Quando apitar, comece a pular!</p>
        </>
      )}
    </div>
  )
}
