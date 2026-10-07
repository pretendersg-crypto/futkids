// Perfil do Pai/Mãe Treinador (área dos pais): abas Estudo (lições com quiz), Medalhas, Pontos
// (como ganhar e os últimos ganhos) e Avatar. Sem perfil ainda, começa pelo avatar.
import { useState } from 'react'
import { useTreinadorStore } from '../../stores/treinadorStore'
import { AvatarTreinador } from './AvatarTreinador'
import { EditorAvatarTreinador } from './EditorAvatarTreinador'
import { LicaoTreinador } from './LicaoTreinador'
import { LICOES, licaoPorId } from './licoes'
import { NIVEIS_TREINADOR, nivelTreinador } from './niveis'
import { avatarDoNivel, ITENS } from './opcoesTreinador'
import { COMO_GANHAR, medalhasGanhas, MEDALHAS, PONTOS } from './pontos'

type Aba = 'estudo' | 'medalhas' | 'pontos' | 'avatar'
const ABAS: [Aba, string][] = [
  ['estudo', '📚 Estudo'],
  ['medalhas', '🏅 Medalhas'],
  ['pontos', '⭐ Pontos'],
  ['avatar', '🎨 Avatar'],
]

export function PerfilTreinador({ aoVoltar }: { aoVoltar: () => void }) {
  const perfil = useTreinadorStore((s) => s.perfil)
  const xp = useTreinadorStore((s) => s.xp)
  const chaves = useTreinadorStore((s) => s.chaves)
  const licoes = useTreinadorStore((s) => s.licoes)
  const historico = useTreinadorStore((s) => s.historico)
  const [aba, setAba] = useState<Aba>(perfil ? 'estudo' : 'avatar')
  const [licaoAberta, setLicaoAberta] = useState<string | null>(null)

  const licao = licaoPorId(licaoAberta ?? undefined)
  if (licao) return <LicaoTreinador licao={licao} aoVoltar={() => setLicaoAberta(null)} />

  const genero = perfil?.avatar.genero ?? 'pai'
  const { atual, proximo } = nivelTreinador(xp)
  const ganhas = new Set(medalhasGanhas(chaves).map((m) => m.id))

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={aoVoltar} className="min-h-12 self-start rounded-2xl bg-white px-4 text-lg font-bold shadow">
        ⬅️ Voltar à área dos pais
      </button>

      {perfil && (
        <div className="flex items-center gap-3">
          <AvatarTreinador config={avatarDoNivel(perfil.avatar, atual.nivel)} tamanho={96} />
          <div className="flex flex-col">
            <h2 className="text-2xl font-extrabold">{perfil.apelido}</h2>
            <p className="font-bold text-violet-800">
              {atual.emoji} {atual.titulo[genero]} · {xp} XP
            </p>
            {proximo && (
              <p className="text-sm">
                Próximo: {proximo.emoji} {proximo.titulo[genero]} com {proximo.xp} XP
                {ITENS.find((i) => i.nivel === proximo.nivel) ? ` (libera ${ITENS.find((i) => i.nivel === proximo.nivel)!.emoji})` : ''}
              </p>
            )}
          </div>
        </div>
      )}
      {!perfil && <h2 className="text-2xl font-extrabold">👨‍🏫 Crie seu avatar de treinador</h2>}

      {perfil && (
        <div role="tablist" aria-label="Perfil do treinador" className="grid grid-cols-4 gap-1 rounded-3xl bg-white p-1 shadow">
          {ABAS.map(([id, nome]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={aba === id}
              onClick={() => setAba(id)}
              className={`min-h-12 rounded-3xl text-xs font-extrabold ${aba === id ? 'bg-violet-600 text-white' : ''}`}
            >
              {nome}
            </button>
          ))}
        </div>
      )}

      {aba === 'avatar' && <EditorAvatarTreinador aoSalvar={() => (perfil ? setAba('estudo') : setAba('estudo'))} />}

      {aba === 'estudo' && (
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            Lições curtas para o adulto ensinar melhor. Cada lição concluída vale {PONTOS.licao} XP, e acertar todo o quiz vale mais {PONTOS.quizPerfeito}.
          </p>
          <ul className="flex flex-col gap-2">
            {LICOES.map((l) => {
              const feita = licoes[l.id] !== undefined
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setLicaoAberta(l.id)}
                    className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border-4 p-2 text-left ${feita ? 'border-green-300 bg-green-50' : 'border-violet-200 bg-white'}`}
                  >
                    <span aria-hidden className="text-3xl">
                      {l.emoji}
                    </span>
                    <span className="flex flex-1 flex-col leading-tight">
                      <span className="font-extrabold">{l.titulo}</span>
                      <span className="text-xs font-bold">
                        ⏱️ {l.minutos} min · {feita ? `✅ feita (${licoes[l.id]}/${l.quiz.length} no quiz)` : `+${PONTOS.licao} XP`}
                      </span>
                    </span>
                    <span aria-hidden>▶️</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {aba === 'medalhas' && (
        <ul className="grid grid-cols-2 gap-2">
          {MEDALHAS.map((m) => {
            const tem = ganhas.has(m.id)
            return (
              <li key={m.id} className={`flex flex-col items-center gap-1 rounded-2xl border-4 p-2 text-center ${tem ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 bg-white opacity-70'}`}>
                <span aria-hidden className={`text-4xl ${tem ? '' : 'grayscale'}`}>
                  {tem ? m.emoji : '🔒'}
                </span>
                <span className="font-extrabold">{m.nome}</span>
                <span className="text-xs">{m.descricao}</span>
              </li>
            )
          })}
        </ul>
      )}

      {aba === 'pontos' && (
        <div className="flex flex-col gap-3">
          {COMO_GANHAR.map((g) => (
            <div key={g.grupo} className="rounded-2xl border-4 border-violet-200 bg-white p-3">
              <p className="font-extrabold">
                {g.emoji} {g.grupo}
              </p>
              <ul className="flex flex-col gap-1 pt-1 text-sm">
                {g.itens.map((i) => (
                  <li key={i.tipo} className="flex justify-between gap-2">
                    <span>{i.texto}</span>
                    <span className="shrink-0 font-extrabold text-violet-800">+{PONTOS[i.tipo]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="rounded-2xl border-4 border-violet-200 bg-white p-3">
            <p className="font-extrabold">🪜 Níveis</p>
            <ul className="flex flex-col gap-1 pt-1 text-sm">
              {NIVEIS_TREINADOR.map((n) => (
                <li key={n.nivel} className={`flex justify-between gap-2 ${n.nivel === atual.nivel ? 'font-extrabold text-violet-800' : ''}`}>
                  <span>
                    {n.emoji} {n.nivel}. {n.titulo[genero]} {ITENS.find((i) => i.nivel === n.nivel)?.emoji ?? ''}
                  </span>
                  <span className="shrink-0">{n.xp} XP</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-4 border-violet-200 bg-white p-3">
            <p className="font-extrabold">🕑 Últimos pontos</p>
            {historico.length === 0 && <p className="text-sm">Ainda nenhum. Comece estudando uma lição ou criando um treino!</p>}
            <ul className="flex flex-col gap-1 pt-1 text-sm">
              {historico.slice(0, 15).map((h, i) => (
                <li key={`${h.quando}-${i}`} className="flex justify-between gap-2">
                  <span>{h.texto}</span>
                  <span className="shrink-0 font-extrabold text-green-700">+{h.xp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
