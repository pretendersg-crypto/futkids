// Tela inicial: botões grandes para cada módulo.
// Avatar, nível, XP e o sino da agenda entram na etapa 3.
import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { MODULOS } from '../data/modulos'

export function Home() {
  return (
    <section className="flex flex-col gap-4">
      <header className="pt-4 text-center">
        <h1 className="text-4xl font-extrabold text-campo">FutKids ⚽</h1>
        <p className="mt-1 text-xl">Vamos treinar hoje?</p>
      </header>

      <ul className="grid grid-cols-2 gap-4">
        {MODULOS.map((modulo, i) => (
          // O último botão ocupa a linha inteira quando a quantidade é ímpar
          <li key={modulo.caminho} className={i === MODULOS.length - 1 && MODULOS.length % 2 ? 'col-span-2' : ''}>
            <motion.div whileTap={{ scale: 0.94 }}>
              <Link
                to={modulo.caminho}
                className={`flex min-h-36 flex-col items-center justify-center gap-1 rounded-3xl border-4 p-3 text-center shadow-md ${modulo.cor}`}
              >
                <span aria-hidden className="text-5xl">
                  {modulo.emoji}
                </span>
                <span className="text-lg leading-tight font-extrabold">{modulo.titulo}</span>
                <span className="text-sm leading-tight">{modulo.convite}</span>
              </Link>
            </motion.div>
          </li>
        ))}
      </ul>
    </section>
  )
}
