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

/** Resposta da última vez (modo toque), mostrada durante a espera */
export type Retorno = { certo: true; ms: number } | { certo: false; perdido: boolean } | { cedo: true } | null

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
    agendar(mostrarSinal, sortear(drill.esperaMinMs, drill.esperaMaxMs))
  }

  function mostrarSinal() {
    const sinal = sortearSinal(drill, anteriores)
    anteriores = [...anteriores.slice(-4), sinal]
    mudarPlacar({ rep: placar.rep + 1, sinais: placar.sinais + 1 })
    mudarFase({ nome: 'sinal', sinal })
    sons.largada()
    if (drill.voz) falar(textoDoSinal(sinal))
    agendar(() => {
      // O tempo acabou sem resposta
      if (drill.modo === 'toque') {
        mudarPlacar({ perdidos: placar.perdidos + 1 })
        avisar.retorno({ certo: false, perdido: true })
      }
      fimDoSinal()
    }, drill.exibicaoMs)
  }

  function fimDoSinal() {
    if (placar.rep < drill.repeticoes) return espera()
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
      if (id === respostaCerta(fase.sinal)) {
        sons.defesa()
        mudarPlacar({ acertos: placar.acertos + 1, tempos: [...placar.tempos, ms] })
        avisar.retorno({ certo: true, ms })
      } else {
        sons.gol()
        mudarPlacar({ erros: placar.erros + 1 })
        avisar.retorno({ certo: false, perdido: false })
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
      if (fase.nome === 'sinal') mudarPlacar({ rep: placar.rep - 1, sinais: placar.sinais - 1 })
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
