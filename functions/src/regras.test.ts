import { describe, expect, it } from 'vitest'
import { createHmac } from 'node:crypto'
import {
  aplicarEvento,
  cabeNoEspaco,
  videoDoArquivo,
  direitoGratis,
  FOLGA_MS,
  lerCabecalhoAssinatura,
  lerReferencia,
  limitesDe,
  manifestoDaAssinatura,
  montarReferencia,
  precoDe,
  venceu,
  type Referencia,
} from './regras'

const DIA = 86_400_000
const REF: Referencia = { alvo: 'escolinha', id: 'esc123abc', plano: 'basico', periodo: 'mensal', forma: 'avulso' }

describe('catálogo e referência', () => {
  it('preço só para plano pago disponível', () => {
    expect(precoDe('escolinha', 'basico', 'mensal')).toBeGreaterThan(0)
    expect(precoDe('escolinha', 'pro', 'anual')).toBeGreaterThan(precoDe('escolinha', 'pro', 'mensal')!)
    expect(precoDe('escolinha', 'gratis', 'mensal')).toBeNull()
    expect(precoDe('familia', 'premium', 'mensal')).toBeNull() // ainda não disponível
    expect(precoDe('escolinha', 'inventado', 'mensal')).toBeNull()
  })

  it('anual sai mais barato que 12 mensais', () => {
    for (const plano of ['basico', 'pro']) expect(precoDe('escolinha', plano, 'anual')!).toBeLessThan(precoDe('escolinha', plano, 'mensal')! * 12)
  })

  it('referência vai e volta e recusa lixo', () => {
    expect(lerReferencia(montarReferencia(REF))).toEqual(REF)
    expect(lerReferencia('escolinha|esc123abc|basico|mensal')).toBeNull()
    expect(lerReferencia('escola|esc123abc|basico|mensal|avulso')).toBeNull()
    expect(lerReferencia('escolinha|../x|basico|mensal|avulso')).toBeNull()
    expect(lerReferencia('escolinha|esc123abc|ouro|mensal|avulso')).toBeNull()
    expect(lerReferencia(null)).toBeNull()
  })
})

describe('direito depois de cada pagamento', () => {
  const agora = Date.UTC(2026, 9, 12)

  it('avulso aprovado: plano e limites do catálogo por 31 dias (mensal) ou 365 (anual)', () => {
    const d = aplicarEvento(direitoGratis('escolinha'), { tipo: 'avulso-aprovado', ref: REF, valor: precoDe('escolinha', 'basico', 'mensal')!, em: agora })!
    expect(d).toMatchObject({ plano: 'basico', limites: limitesDe('escolinha', 'basico'), validoAte: agora + 31 * DIA, renovacaoAutomatica: false })
    const anual = aplicarEvento(direitoGratis('escolinha'), { tipo: 'avulso-aprovado', ref: { ...REF, periodo: 'anual' }, valor: precoDe('escolinha', 'basico', 'anual')!, em: agora })!
    expect(anual.validoAte).toBe(agora + 365 * DIA)
  })

  it('renovar antes de vencer soma ao fim do período (não perde dias)', () => {
    const atual = { ...direitoGratis('escolinha'), plano: 'basico', validoAte: agora + 10 * DIA }
    const d = aplicarEvento(atual, { tipo: 'avulso-aprovado', ref: REF, valor: precoDe('escolinha', 'basico', 'mensal')!, em: agora })!
    expect(d.validoAte).toBe(agora + 41 * DIA)
  })

  it('valor menor que o preço é recusado', () => {
    expect(aplicarEvento(direitoGratis('escolinha'), { tipo: 'avulso-aprovado', ref: REF, valor: 1, em: agora })).toBeNull()
  })

  it('assinatura: vale até a próxima cobrança + folga; parada não renova mas não corta na hora', () => {
    const ref = { ...REF, forma: 'assinatura' as const }
    const ativa = aplicarEvento(direitoGratis('escolinha'), { tipo: 'assinatura-ativa', ref, assinatura: 'mp1', proximaCobranca: agora + 30 * DIA })!
    expect(ativa).toMatchObject({ plano: 'basico', validoAte: agora + 30 * DIA + FOLGA_MS, renovacaoAutomatica: true, assinatura: 'mp1' })
    const parada = aplicarEvento(ativa, { tipo: 'assinatura-parada', ref, assinatura: 'mp1' })!
    expect(parada).toMatchObject({ plano: 'basico', validoAte: ativa.validoAte, renovacaoAutomatica: false })
    // aviso de outra assinatura (antiga) não mexe
    expect(aplicarEvento(ativa, { tipo: 'assinatura-parada', ref, assinatura: 'outra' })).toEqual(ativa)
  })

  it('vence depois da data e volta ao grátis', () => {
    expect(venceu({ ...direitoGratis('escolinha'), plano: 'basico', validoAte: agora - 1 }, agora)).toBe(true)
    expect(venceu(direitoGratis('escolinha'), agora)).toBe(false)
  })
})

describe('vídeos do treinador', () => {
  it('acha a escolinha e o documento a partir do arquivo', () => {
    expect(videoDoArquivo('escolinhas/esc1/turmas/tur2/videos/vid3/jogo.mp4')).toEqual({ escolinha: 'esc1', documento: 'escolinhas/esc1/turmas/tur2/videos/vid3' })
    expect(videoDoArquivo('escolinhas/esc1/turmas/tur2/individuais/atl9/videos/vid3/x.mov')).toEqual({
      escolinha: 'esc1',
      documento: 'escolinhas/esc1/turmas/tur2/individuais/atl9/videos/vid3',
    })
    expect(videoDoArquivo('outra/coisa.mp4')).toBeNull()
    expect(videoDoArquivo('escolinhas/esc1/turmas/tur2/videos/vid3/sub/x.mp4')).toBeNull()
  })

  it('espaço do plano', () => {
    expect(cabeNoEspaco(900 * 1024 * 1024, 100 * 1024 * 1024, 1024)).toBe(true)
    expect(cabeNoEspaco(1000 * 1024 * 1024, 100 * 1024 * 1024, 1024)).toBe(false)
  })
})

describe('aviso do Mercado Pago', () => {
  it('confere a assinatura x-signature com a chave secreta', () => {
    const segredo = 'segredo-de-teste'
    const cab = lerCabecalhoAssinatura('ts=1704908010,v1=' + createHmac('sha256', segredo).update(manifestoDaAssinatura('ABC123', 'req-1', '1704908010')).digest('hex'))!
    expect(cab.ts).toBe('1704908010')
    const esperado = createHmac('sha256', segredo).update(manifestoDaAssinatura('ABC123', 'req-1', cab.ts)).digest('hex')
    expect(cab.v1).toBe(esperado)
    expect(manifestoDaAssinatura('ABC123', 'req-1', '1')).toBe('id:abc123;request-id:req-1;ts:1;')
    expect(lerCabecalhoAssinatura('lixo')).toBeNull()
  })
})
