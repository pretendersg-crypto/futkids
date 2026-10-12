import { beforeEach, describe, expect, it } from 'vitest'
import { chaveGuardada } from './chaves'
import { carregarPerfil, esquecerPerfil, guardarPerfil, temPerfilGuardado, trocarPerfil } from './perfis'

// localStorage de mentira (os testes rodam fora do navegador)
class Memoria {
  dados = new Map<string, string>()
  getItem = (k: string) => this.dados.get(k) ?? null
  setItem = (k: string, v: string) => void this.dados.set(k, v)
  removeItem = (k: string) => void this.dados.delete(k)
}

let mem: Memoria
beforeEach(() => {
  mem = new Memoria()
  Object.assign(globalThis, { localStorage: mem })
})

describe('trocar de filho no aparelho', () => {
  it('guarda os dados do filho que sai e põe os do que entra; os da família não mudam', () => {
    mem.setItem('futkids-progresso', 'xp-aguia')
    mem.setItem('futkids-programa', 'plano-aguia')
    mem.setItem('futkids-treinos', 'treinos-da-familia')
    mem.setItem(chaveGuardada('leao', 'futkids-progresso'), 'xp-leao')

    trocarPerfil('aguia', 'leao')

    expect(mem.getItem('futkids-progresso')).toBe('xp-leao')
    expect(mem.getItem('futkids-programa')).toBeNull() // o Leão ainda não tinha plano aqui: vem da nuvem
    expect(mem.getItem('futkids-treinos')).toBe('treinos-da-familia')
    expect(mem.getItem(chaveGuardada('aguia', 'futkids-progresso'))).toBe('xp-aguia')
    expect(mem.getItem(chaveGuardada('aguia', 'futkids-programa'))).toBe('plano-aguia')

    trocarPerfil('leao', 'aguia')
    expect(mem.getItem('futkids-progresso')).toBe('xp-aguia')
    expect(mem.getItem('futkids-programa')).toBe('plano-aguia')
  })

  it('esquecer apaga só a cópia guardada do perfil', () => {
    mem.setItem('futkids-progresso', 'xp')
    guardarPerfil('aguia')
    expect(temPerfilGuardado('aguia')).toBe(true)
    esquecerPerfil('aguia')
    expect(temPerfilGuardado('aguia')).toBe(false)
    expect(mem.getItem('futkids-progresso')).toBe('xp')
    carregarPerfil('aguia')
    expect(mem.getItem('futkids-progresso')).toBeNull()
  })
})
