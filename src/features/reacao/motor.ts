// Motor de um drill de reação, fora do React: contagem 3-2-1 → espera (tempo sorteado) → sinal
// → ... → descanso entre séries → fim. A tela (ExecutarDrill) só desenha o que o motor avisa.
// Usa setTimeout (não animação), então os tempos seguem certos mesmo se a tela travar quadros.
import { sons } from '../../utils/som'
import type { Drill } from './drills'
import { PLACAR_ZERO, type Placar } from './finalizar'
import { respostaCerta, sortearSinal, textoDoSinal, type Sinal } from './sinais'
import { calar, falar } from './voz'

export type Fase =
  | { nome: 'contagem'; n: number }
  | { nome: 'espera' }
  | { nome: 'sinal'; sinal: Sinal }
  | { nome: 'descanso'; resta: number }

/**
 * Resposta da última vez (modo toque), mostrada durante a espera. Sem `ms` = segurou certo num
 * sinal de não reagir; `finta` = reagiu quando era para segurar.
 */
export type Retorno = { certo: true; ms?: number } | { certo: false; perdido: boolean; finta?: boolean } | { cedo: true } | null

/** No modo toque, o tempo para responder encolhe com acertos seguidos (até esta parte do original) */
export const TEMPO_MINIMO_RELATIVO = 0.6
/** Acertos seguidos para apertar o tempo */
const SEQUENCIA_PARA_ACELERAR = 3
/** Espera curta entre os sinais de uma rajada (rebote) */
const ESPERA_RAJADA_MS: [number, number] = [600, 900]

export interface Avisos {
  fase: (f: Fase) => void
  placar: (p: Placar) => void
  retorno: (r: Retorno) => void
  /** Uma vez só: completo = chegou ao fim; false = parou no meio */
  fim: (placar: Placar, completo: boolean, duracaoS: number) => void
}

const sortear = (min: number, max: number) => min + Math.random() * Math.max(0, max - min)

export function criarMotor(drill: Drill, avisar: Avisos) {
  let fase: Fase = { nome: 'contagem', n: 3 }
  let placar: Placar = PLACAR_ZERO
  let timer: number | undefined
  let inicioSinal = 0
  let anteriores: Sinal[] = []
  let pausado = false
  let terminou = false
  // Ritmo que se ajusta (modo toque): tempo para responder e acertos seguidos
  let tempoResposta = drill.exibicaoMs
  let seguidos = 0
  // Posição dentro da rajada (rebote: 2 sinais quase seguidos)
  let naRajada = 0
  const relogio = { inicio: Date.now(), pausadoEm: 0, pausas: 0 }

  const mudarFase = (f: Fase) => {
    fase = f
    avisar.fase(f)
  }
  const mudarPlacar = (p: Partial<Placar>) => {
    placar = { ...placar, ...p }
    avisar.placar(placar)
  }
  const agendar = (fazer: () => void, ms: number) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(fazer, ms)
  }

  function contagem(n: number) {
    mudarFase({ nome: 'contagem', n })
    if (n > 0) {
      sons.contagem()
      agendar(() => contagem(n - 1), 800)
    } else {
      espera()
    }
  }

  function espera() {
    mudarFase({ nome: 'espera' })
    const rajada = drill.rajada ?? 1
    // No meio da rajada o próximo vem quase em seguida (o rebote)
    const curta = rajada > 1 && naRajada % rajada !== 0
    agendar(mostrarSinal, curta ? sortear(...ESPERA_RAJADA_MS) : sortear(drill.esperaMinMs, drill.esperaMaxMs))
  }

  /** Ajusta o tempo para responder (só no modo toque) */
  function ritmo(acertou: boolean) {
    if (drill.modo !== 'toque') return
    if (acertou) {
      seguidos++
      if (seguidos >= SEQUENCIA_PARA_ACELERAR) tempoResposta = Math.max(drill.exibicaoMs * TEMPO_MINIMO_RELATIVO, tempoResposta * 0.9)
    } else {
      seguidos = 0
      tempoResposta = Math.min(drill.exibicaoMs, tempoResposta * 1.15)
    }
  }

  function mostrarSinal() {
    const sinal = sortearSinal(drill, anteriores)
    anteriores = [...anteriores.slice(-4), sinal]
    naRajada++
    mudarPlacar({ rep: placar.rep + 1, sinais: placar.sinais + 1 })
    mudarFase({ nome: 'sinal', sinal })
    if (sinal.tipo === 'som') sons.apitoJuiz()
    else sons.largada()
    const texto = textoDoSinal(sinal)
    if (drill.voz && texto) falar(texto)
    agendar(
      () => {
        // O tempo acabou sem resposta
        if (drill.modo === 'toque') {
          if (respostaCerta(sinal) === null) {
            // Era para segurar, e segurou
            sons.defesa()
            mudarPlacar({ acertos: placar.acertos + 1 })
            avisar.retorno({ certo: true })
            ritmo(true)
          } else {
            mudarPlacar({ perdidos: placar.perdidos + 1 })
            avisar.retorno({ certo: false, perdido: true })
            ritmo(false)
          }
        }
        fimDoSinal()
      },
      drill.modo === 'toque' ? tempoResposta : drill.exibicaoMs,
    )
  }

  function fimDoSinal() {
    if (placar.rep < drill.repeticoes) return espera()
    // Série nova começa com a rajada do começo
    naRajada = 0
    if (placar.serie >= drill.series) return terminar(true)
    if (drill.descansoS <= 0) {
      mudarPlacar({ serie: placar.serie + 1, rep: 0 })
      return espera()
    }
    descanso(drill.descansoS)
  }

  function descanso(resta: number) {
    mudarFase({ nome: 'descanso', resta })
    if (resta <= 0) {
      mudarPlacar({ serie: placar.serie + 1, rep: 0 })
      avisar.retorno(null)
      return contagem(3)
    }
    if (resta <= 3) sons.repeticao()
    agendar(() => descanso(resta - 1), 1000)
  }

  function terminar(completo: boolean) {
    if (terminou) return
    terminou = true
    window.clearTimeout(timer)
    calar()
    const fim = relogio.pausadoEm || Date.now()
    if (completo) sons.concluido()
    avisar.fim(placar, completo, (fim - relogio.inicio - relogio.pausas) / 1000)
  }

  return {
    iniciar: () => contagem(3),

    /** O sinal acabou de aparecer na tela: começa a contar a reação daqui */
    sinalNaTela: () => {
      inicioSinal = performance.now()
    },

    /** Toque num botão de resposta (modo toque) */
    responder: (id: string) => {
      if (pausado || terminou) return
      if (fase.nome !== 'sinal') {
        // Tocou antes do sinal: só avisa (sem castigo)
        if (fase.nome === 'espera') avisar.retorno({ cedo: true })
        return
      }
      const ms = Math.round(performance.now() - inicioSinal)
      const certa = respostaCerta(fase.sinal)
      if (id === certa) {
        sons.defesa()
        mudarPlacar({ acertos: placar.acertos + 1, tempos: [...placar.tempos, ms] })
        avisar.retorno({ certo: true, ms })
        ritmo(true)
      } else {
        sons.gol()
        mudarPlacar({ erros: placar.erros + 1 })
        avisar.retorno({ certo: false, perdido: false, finta: certa === null })
        ritmo(false)
      }
      window.clearTimeout(timer)
      fimDoSinal()
    },

    pularDescanso: () => {
      if (fase.nome === 'descanso' && !pausado) descanso(0)
    },

    /** Devolve false se não havia o que pausar */
    pausar: (): boolean => {
      if (pausado || terminou) return false
      pausado = true
      window.clearTimeout(timer)
      calar()
      relogio.pausadoEm = Date.now()
      // Sinal interrompido não conta (vai aparecer outro)
      if (fase.nome === 'sinal') {
        mudarPlacar({ rep: placar.rep - 1, sinais: placar.sinais - 1 })
        naRajada--
      }
      return true
    },

    continuar: () => {
      if (!pausado) return
      pausado = false
      relogio.pausas += Date.now() - relogio.pausadoEm
      relogio.pausadoEm = 0
      if (fase.nome === 'descanso') descanso(fase.resta)
      else contagem(3)
    },

    terminar: () => terminar(false),

    /** A tela saiu (desmontou): para tudo sem salvar */
    desligar: () => {
      terminou = true
      window.clearTimeout(timer)
      calar()
    },
  }
}

export type Motor = ReturnType<typeof criarMotor>
