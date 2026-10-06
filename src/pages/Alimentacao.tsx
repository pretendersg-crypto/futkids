// Módulo "Alimentação do Craque" (/alimentacao/...): lições, jogos e a garrafinha de água,
// para crianças a partir de 6 anos. Tem também um recado para os pais.
import { Link, Route, Routes } from 'react-router'
import { Mascote } from '../components/mascote/Mascote'
import { LICOES } from '../data/alimentacao'
import { GarrafinhaAgua } from '../features/alimentacao/GarrafinhaAgua'
import { JogoTurmas } from '../features/alimentacao/JogoTurmas'
import { LicaoAberta, ListaLicoes } from '../features/alimentacao/Licoes'
import { MontePrato } from '../features/alimentacao/MontePrato'
import { QuizComida } from '../features/alimentacao/QuizComida'
import { useAlimentacaoStore } from '../stores/alimentacaoStore'
import { hojeISO } from '../utils/data'

export function Alimentacao() {
  return (
    <Routes>
      <Route index element={<Menu />} />
      <Route path="aprender" element={<ListaLicoes />} />
      <Route path="aprender/:licao" element={<LicaoAberta />} />
      <Route path="turmas" element={<JogoTurmas />} />
      <Route path="prato" element={<MontePrato />} />
      <Route path="quiz" element={<QuizComida />} />
      <Route path="agua" element={<GarrafinhaAgua />} />
      <Route path="*" element={<Menu />} />
    </Routes>
  )
}

function Menu() {
  const vistas = useAlimentacaoStore((s) => s.licoesVistas.length)
  const agua = useAlimentacaoStore((s) => (s.agua[hojeISO()] ?? []).length)

  const itens = [
    { rota: 'aprender', emoji: '📖', titulo: 'Aprender', detalhe: `${vistas} de ${LICOES.length} lições` },
    { rota: 'turmas', emoji: '🧺', titulo: 'Qual é a turma?', detalhe: 'Energia, construtor ou protetor?' },
    { rota: 'prato', emoji: '🍽️', titulo: 'Monte o prato', detalhe: 'Prato colorido de campeão' },
    { rota: 'quiz', emoji: '❓', titulo: 'Verdade ou mentira?', detalhe: 'Sobre comida, água e sono' },
    { rota: 'agua', emoji: '💧', titulo: 'Garrafinha do treino', detalhe: `${agua} de 3 hoje` },
  ]

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-center text-3xl font-extrabold">🍎 Alimentação do Craque</h1>
      <Mascote humor="feliz" fala="Comida é o combustível do craque! Vamos aprender a abastecer o corpo? ⛽" tamanho={76} />

      <ul className="flex flex-col gap-3">
        {itens.map((i) => (
          <li key={i.rota}>
            <Link to={i.rota} className="flex min-h-20 items-center gap-4 rounded-3xl border-4 border-rose-300 bg-rose-50 p-3 shadow-md">
              <span aria-hidden className="text-5xl">
                {i.emoji}
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-xl font-extrabold">{i.titulo}</span>
                <span className="text-base">{i.detalhe}</span>
              </span>
              <span aria-hidden className="text-3xl">
                ▶️
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Recado para os pais: sem portão (é só texto), mas escrito para adultos */}
      <details className="rounded-2xl border-4 border-dashed border-rose-200 bg-white p-3">
        <summary className="min-h-10 cursor-pointer text-lg font-bold">👨‍👩‍👧 Para os pais</summary>
        <div className="flex flex-col gap-2 pt-2 text-base">
          <p>
            Este módulo ensina ideias gerais de alimentação para quem pratica esporte: variedade de alimentos, água antes,
            durante e depois do treino, lanche leve antes de treinar e sono. É conteúdo educativo e não substitui a orientação
            do pediatra ou de um nutricionista.
          </p>
          <p>
            Para crianças, o foco não é dieta, peso ou calorias. Suplementos esportivos (como creatina, cafeína, whey e géis
            de carboidrato) não são indicados para crianças sem orientação médica.
          </p>
          <p>Nada do que a criança faz aqui sai do aparelho.</p>
        </div>
      </details>
    </section>
  )
}
