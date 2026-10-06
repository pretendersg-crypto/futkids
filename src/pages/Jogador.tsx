// Tela "Meu jogador": montagem do avatar e escolha do apelido.
// Na primeira vez que o app abre, é a tela de boas-vindas (sem barra inferior e sem botão voltar).
// As mudanças ficam num rascunho e só são salvas no "Pronto!".
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Mascote } from '../components/mascote/Mascote'
import { apelidoAleatorio } from '../data/apelidos'
import { Avatar } from '../features/avatar/Avatar'
import { EditorAvatar } from '../features/avatar/EditorAvatar'
import { EscolherApelido } from '../features/avatar/EscolherApelido'
import { useUserStore } from '../stores/userStore'

export function Jogador() {
  const apelidoSalvo = useUserStore((s) => s.apelido)
  const avatarSalvo = useUserStore((s) => s.avatar)
  const salvarJogador = useUserStore((s) => s.salvarJogador)
  const navigate = useNavigate()

  const primeiraVez = apelidoSalvo === ''
  const [avatar, setAvatar] = useState(avatarSalvo)
  // Na primeira vez já vem um apelido sorteado, para a criança poder só tocar em "Pronto!"
  const [apelido, setApelido] = useState(() => apelidoSalvo || apelidoAleatorio())

  function pronto() {
    salvarJogador(apelido, avatar)
    navigate('/', { replace: true })
  }

  return (
    <main className="entrada-tela mx-auto flex max-w-md flex-col gap-5 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-3">
        {!primeiraVez && (
          <Link
            to="/"
            aria-label="Voltar sem salvar"
            className="grid size-14 shrink-0 place-items-center rounded-full bg-white text-3xl shadow"
          >
            ⬅️
          </Link>
        )}
        <h1 className="text-3xl font-extrabold">{primeiraVez ? 'Bem-vindo! 👋' : 'Meu jogador'}</h1>
      </header>
      {primeiraVez && <Mascote humor="torcendo" fala="Oi! Eu sou o Bolinha! Vamos montar o seu jogador? ⚽" tamanho={80} />}

      <div className="flex flex-col items-center rounded-3xl border-4 border-green-200 bg-white py-3">
        <Avatar config={avatar} tamanho={150} />
        <p className="text-2xl font-extrabold">{apelido}</p>
      </div>

      <EditorAvatar valor={avatar} aoMudar={setAvatar} />

      <h2 className="text-2xl font-extrabold">Seu apelido</h2>
      <EscolherApelido valor={apelido} aoMudar={setApelido} />

      <button
        type="button"
        onClick={pronto}
        className="sticky bottom-[max(1rem,env(safe-area-inset-bottom))] min-h-16 rounded-3xl bg-sol text-2xl font-extrabold shadow-lg"
      >
        Pronto! ⚽
      </button>
    </main>
  )
}
