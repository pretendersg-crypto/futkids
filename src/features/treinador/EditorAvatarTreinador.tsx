// Montar o avatar do Pai/Mãe Treinador: Pai ou Mãe, apelido, pele, cabelo, barba, óculos,
// brincos, agasalho e os itens liberados pelo nível de treinador (com cadeado até chegar lá).
import { useState, type ReactNode } from 'react'
import { useTreinadorStore } from '../../stores/treinadorStore'
import { AvatarTreinador } from './AvatarTreinador'
import { nivelTreinador } from './niveis'
import {
  AGASALHOS,
  AVATAR_PADRAO,
  avatarDoNivel,
  BARBAS,
  CABELOS_ADULTO,
  CORES_CABELO_TREINADOR,
  ITENS,
  PELES_TREINADOR,
  type AvatarTreinadorConfig,
  type Genero,
  type IdItem,
} from './opcoesTreinador'

const BOTAO = 'min-h-12 rounded-xl border-4 px-2 text-sm font-bold'
const ativo = (sim: boolean) => (sim ? 'border-violet-600 bg-violet-100' : 'border-violet-100 bg-white')

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 text-base font-extrabold">{titulo}</legend>
      {children}
    </fieldset>
  )
}

export function EditorAvatarTreinador({ aoSalvar }: { aoSalvar: () => void }) {
  const perfil = useTreinadorStore((s) => s.perfil)
  const xp = useTreinadorStore((s) => s.xp)
  const salvarPerfil = useTreinadorStore((s) => s.salvarPerfil)
  const nivel = nivelTreinador(xp).atual.nivel
  const [apelido, setApelido] = useState(perfil?.apelido ?? 'Treinador')
  const [a, setA] = useState<AvatarTreinadorConfig>(() => avatarDoNivel(perfil?.avatar ?? AVATAR_PADRAO.pai, nivel))
  const mudar = (parte: Partial<AvatarTreinadorConfig>) => setA((x) => ({ ...x, ...parte }))

  function escolherGenero(g: Genero) {
    // Ao trocar Pai/Mãe, sugere o visual padrão (mantendo pele, agasalho e itens) e o apelido
    setA((x) => ({ ...AVATAR_PADRAO[g], pele: x.pele, agasalho: x.agasalho, usar: x.usar }))
    if (apelido === 'Treinador' || apelido === 'Treinadora') setApelido(g === 'mae' ? 'Treinadora' : 'Treinador')
  }

  const alternarItem = (id: IdItem) => mudar({ usar: a.usar.includes(id) ? a.usar.filter((i) => i !== id) : [...a.usar, id] })

  return (
    <div className="flex flex-col gap-4">
      <div className="self-center">
        <AvatarTreinador config={a} tamanho={170} />
      </div>

      <Grupo titulo="Quem é o treinador?">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['pai', '👨 Pai Treinador'],
              ['mae', '👩 Mãe Treinadora'],
            ] as const
          ).map(([g, nome]) => (
            <button key={g} type="button" aria-pressed={a.genero === g} onClick={() => escolherGenero(g)} className={`${BOTAO} min-h-14 text-base ${ativo(a.genero === g)}`}>
              {nome}
            </button>
          ))}
        </div>
      </Grupo>

      <label className="flex flex-col gap-1 text-base font-extrabold">
        Como a criança vai te chamar no app
        <input
          type="text"
          value={apelido}
          maxLength={20}
          onChange={(e) => setApelido(e.target.value)}
          className="min-h-12 rounded-xl border-2 border-violet-200 px-3 text-base font-normal"
        />
        <span className="text-xs font-medium">Ex.: Treinador, Mãe Treinadora, Professor. Não precisa usar seu nome.</span>
      </label>

      <Grupo titulo="Pele">
        <div className="flex flex-wrap gap-2">
          {PELES_TREINADOR.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-label={p.nome}
              aria-pressed={a.pele === p.id}
              onClick={() => mudar({ pele: p.id })}
              className={`size-12 rounded-full border-4 ${a.pele === p.id ? 'border-violet-600' : 'border-white'}`}
              style={{ background: p.cor }}
            />
          ))}
        </div>
      </Grupo>

      <Grupo titulo="Cabelo">
        <div className="grid grid-cols-4 gap-1">
          {CABELOS_ADULTO.map((c) => (
            <button key={c.id} type="button" aria-pressed={a.cabelo === c.id} onClick={() => mudar({ cabelo: c.id })} className={`${BOTAO} ${ativo(a.cabelo === c.id)}`}>
              {c.nome}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {CORES_CABELO_TREINADOR.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={`Cabelo ${c.nome}`}
              aria-pressed={a.corCabelo === c.id}
              onClick={() => mudar({ corCabelo: c.id })}
              className={`size-10 rounded-full border-4 ${a.corCabelo === c.id ? 'border-violet-600' : 'border-white'}`}
              style={{ background: c.cor }}
            />
          ))}
        </div>
      </Grupo>

      <Grupo titulo="Rosto">
        <div className="grid grid-cols-4 gap-1">
          {BARBAS.map((b) => (
            <button key={b.id} type="button" aria-pressed={a.barba === b.id} onClick={() => mudar({ barba: b.id })} className={`${BOTAO} ${ativo(a.barba === b.id)}`}>
              {b.nome}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1">
          <button type="button" aria-pressed={a.oculos} onClick={() => mudar({ oculos: !a.oculos })} className={`${BOTAO} ${ativo(a.oculos)}`}>
            👓 Óculos
          </button>
          <button type="button" aria-pressed={a.brincos} onClick={() => mudar({ brincos: !a.brincos })} className={`${BOTAO} ${ativo(a.brincos)}`}>
            ✨ Brincos
          </button>
        </div>
      </Grupo>

      <Grupo titulo="Agasalho">
        <div className="flex flex-wrap gap-2">
          {AGASALHOS.map((g) => {
            const liberado = nivel >= g.nivel
            return (
              <button
                key={g.id}
                type="button"
                disabled={!liberado}
                aria-label={liberado ? g.nome : `${g.nome}: libera no nível ${g.nivel}`}
                aria-pressed={a.agasalho === g.id}
                onClick={() => mudar({ agasalho: g.id })}
                className={`grid size-12 place-items-center rounded-full border-4 text-lg disabled:opacity-60 ${a.agasalho === g.id ? 'border-violet-600' : 'border-white'}`}
                style={{ background: g.cor }}
              >
                {liberado ? '' : '🔒'}
              </button>
            )
          })}
        </div>
      </Grupo>

      <Grupo titulo="Itens do treinador (um novo a cada nível)">
        <div className="grid grid-cols-3 gap-2">
          {ITENS.map((i) => {
            const liberado = nivel >= i.nivel
            const usando = a.usar.includes(i.id)
            return (
              <button
                key={i.id}
                type="button"
                disabled={!liberado}
                aria-pressed={usando}
                onClick={() => alternarItem(i.id)}
                className={`flex min-h-16 flex-col items-center justify-center rounded-xl border-4 text-xs leading-tight font-bold disabled:opacity-50 ${ativo(usando)}`}
              >
                <span className="text-2xl">{liberado ? i.emoji : '🔒'}</span>
                {i.nome}
                {!liberado && <span>nível {i.nivel}</span>}
              </button>
            )
          })}
        </div>
      </Grupo>

      <button
        type="button"
        onClick={() => {
          salvarPerfil({ apelido: apelido.trim() || (a.genero === 'mae' ? 'Treinadora' : 'Treinador'), avatar: a })
          aoSalvar()
        }}
        className="min-h-16 rounded-3xl bg-sol text-xl font-extrabold shadow-lg"
      >
        Salvar meu avatar ✅
      </button>
    </div>
  )
}
