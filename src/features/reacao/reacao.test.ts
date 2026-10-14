import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { combinaComPublico, DRILLS_PRONTOS, drillNoRitmo, novoDrill, type Drill } from './drills'
import { criarMotor, type Retorno } from './motor'
import { respostaCerta, sinaisDeReagir, sinaisDeSegurar, sortearSinal, type ConfigSinais } from './sinais'

const VAZIO: ConfigSinais = { cores: [], setas: [], setaVermelha: false, numeros: 0 }

describe('sinais novos', () => {
  it('finta e cor distratora são de NÃO reagir; o resto tem resposta', () => {
    expect(respostaCerta({ tipo: 'finta' })).toBeNull()
    expect(respostaCerta({ tipo: 'cor', cor: 'azul', naoVai: true })).toBeNull()
    expect(respostaCerta({ tipo: 'canto', canto: 'alto-esq' })).toBe('canto:alto-esq')
    expect(respostaCerta({ tipo: 'som' })).toBe('vai')
    expect(respostaCerta({ tipo: 'toupeira', casa: 4 })).toBe('casa:4')
    // Cor da tinta: vale a tinta, não a palavra
    expect(respostaCerta({ tipo: 'palavra', palavra: 'azul', tinta: 'vermelho' })).toBe('cor:vermelho')
  })

  it('na cor da tinta, a palavra nunca é da mesma cor da tinta', () => {
    const lista = sinaisDeReagir({ ...VAZIO, cores: ['vermelho', 'azul', 'verde'], palavras: true })
    expect(lista).toHaveLength(6)
    for (const s of lista) expect(s.tipo === 'palavra' && s.palavra !== s.tinta).toBe(true)
  })

  it('com distratores, sorteia de não reagir só às vezes (uns 30%)', () => {
    const c: ConfigSinais = { ...VAZIO, cores: ['verde'], distratores: ['vermelho', 'azul'] }
    expect(sinaisDeSegurar(c)).toHaveLength(2)
    expect(sortearSinal(c, [], () => 0.1)).toMatchObject({ tipo: 'cor', naoVai: true })
    expect(sortearSinal(c, [], () => 0.9)).toEqual({ tipo: 'cor', cor: 'verde' })
  })

  it('só finta sem sinal de reagir não trava o sorteio', () => {
    expect(sortearSinal({ ...VAZIO, fintas: true }, [])).toEqual({ tipo: 'finta' })
  })
})

describe('drills prontos', () => {
  it('ids únicos e todo drill tem algum sinal de reagir', () => {
    expect(new Set(DRILLS_PRONTOS.map((d) => d.id)).size).toBe(DRILLS_PRONTOS.length)
    for (const d of DRILLS_PRONTOS) expect(sinaisDeReagir(d).length, d.id).toBeGreaterThan(0)
  })

  it('tem drills para goleiro, para linha e para todos', () => {
    for (const p of ['goleiro', 'linha', 'todos'] as const) expect(DRILLS_PRONTOS.filter((d) => d.publico === p).length, p).toBeGreaterThanOrEqual(5)
  })

  it('rebote: as repetições fecham em duplas', () => {
    for (const d of DRILLS_PRONTOS.filter((x) => (x.rajada ?? 1) > 1)) expect(d.repeticoes % d.rajada!, d.id).toBe(0)
  })

  it('filtro: goleiro vê os de goleiro e os de todos, não os de linha', () => {
    const goleiro = DRILLS_PRONTOS.find((d) => d.publico === 'goleiro')!
    const linha = DRILLS_PRONTOS.find((d) => d.publico === 'linha')!
    const todos = DRILLS_PRONTOS.find((d) => d.publico === 'todos')!
    expect([goleiro, linha, todos].map((d) => combinaComPublico(d, 'goleiro'))).toEqual([true, false, true])
    expect([goleiro, linha, todos].map((d) => combinaComPublico(d, 'todos'))).toEqual([true, true, true])
  })

  it('ritmo: Baby mais lento, Lenda mais rápido; drill criado fica como o adulto fez', () => {
    const d = DRILLS_PRONTOS[0]
    expect(drillNoRitmo(d, 'baby').exibicaoMs).toBeGreaterThan(d.exibicaoMs)
    expect(drillNoRitmo(d, 'lenda').exibicaoMs).toBeLessThan(d.exibicaoMs)
    expect(drillNoRitmo(d, 'sabor-pro')).toEqual(d)
    const criado = novoDrill()
    expect(drillNoRitmo(criado, 'baby')).toBe(criado)
  })
})

describe('motor: não reagir, rajada e ritmo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('window', globalThis)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const drillToque = (parte: Partial<Drill>): Drill => ({
    ...novoDrill(),
    modo: 'toque',
    cores: ['verde'],
    distratores: ['vermelho'],
    series: 1,
    repeticoes: 10,
    esperaMinMs: 1000,
    esperaMaxMs: 1000,
    exibicaoMs: 1000,
    voz: false,
    ...parte,
  })

  function rodar(drill: Drill) {
    const retornos: Retorno[] = []
    let ultimaFase = ''
    const motor = criarMotor(drill, {
      fase: (f) => (ultimaFase = f.nome),
      placar: () => undefined,
      retorno: (r) => retornos.push(r),
      fim: () => undefined,
    })
    motor.iniciar()
    vi.advanceTimersByTime(2400 + 1000) // contagem 3-2-1-já + espera: o 1º sinal aparece
    return { motor, retornos, fase: () => ultimaFase }
  }

  it('segurar na cor distratora vale acerto; tocar nela é "caiu na finta"', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1) // < 30%: sinal de não reagir
    const { motor, retornos, fase } = rodar(drillToque({}))
    expect(fase()).toBe('sinal')
    vi.advanceTimersByTime(1000) // o tempo passa sem tocar
    expect(retornos.at(-1)).toEqual({ certo: true })
    vi.advanceTimersByTime(1000) // próximo sinal (também de segurar)
    motor.responder('cor:verde')
    expect(retornos.at(-1)).toEqual({ certo: false, perdido: false, finta: true })
  })

  it('rebote: o 2º sinal da dupla vem logo (menos de 1 s depois)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // espera curta da rajada = 750 ms
    const fases: string[] = []
    const motor = criarMotor(drillToque({ modo: 'auto', distratores: [], rajada: 2, esperaMinMs: 5000, esperaMaxMs: 5000 }), {
      fase: (f) => fases.push(f.nome),
      placar: () => undefined,
      retorno: () => undefined,
      fim: () => undefined,
    })
    motor.iniciar()
    vi.advanceTimersByTime(2400 + 5000 + 1000 + 100) // contagem + espera longa + 1º sinal + um pouco
    expect(fases.at(-1)).toBe('espera')
    vi.advanceTimersByTime(700) // a espera curta da rajada acaba (750 ms)
    expect(fases.at(-1)).toBe('sinal')
  })

  it('acertos seguidos encurtam o tempo para responder', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9) // sempre o verde (reagir)
    const { motor, retornos } = rodar(drillToque({ distratores: [] }))
    for (let i = 0; i < 4; i++) {
      motor.responder('cor:verde')
      vi.advanceTimersByTime(1000) // espera até o próximo sinal
    }
    expect(retornos.filter((r) => r && 'certo' in r && r.certo)).toHaveLength(4)
    // Agora o tempo é menor que 1 s: sem tocar, ele "passa" antes de 1 s
    vi.advanceTimersByTime(950)
    expect(retornos.at(-1)).toEqual({ certo: false, perdido: true })
  })
})
