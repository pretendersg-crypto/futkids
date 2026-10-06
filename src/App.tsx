// Tela provisória do passo 1 (setup): confirma que Tailwind, Framer Motion e PWA estão funcionando.
// Será substituída pelas rotas e pela navegação inferior no passo 2.
import { motion } from 'framer-motion'

function App() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <motion.div
        className="text-8xl"
        animate={{ y: [0, -24, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut' }}
        aria-hidden
      >
        ⚽
      </motion.div>
      <h1 className="text-4xl font-extrabold text-campo">FutKids</h1>
      <p className="text-xl">Vamos treinar? 🧤🔥🏆</p>
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="min-h-16 w-full rounded-3xl bg-sol px-8 text-2xl font-bold shadow-lg"
      >
        Começar!
      </motion.button>
    </main>
  )
}

export default App
