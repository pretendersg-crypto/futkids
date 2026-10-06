// Apelidos prontos: a criança escolhe um sem precisar digitar nada pessoal.
// Para adicionar, inclua na lista (emoji no final, separado por espaço).
export const APELIDOS: string[] = [
  'Paredão 🧱',
  'Foguete 🚀',
  'Muralha 🛡️',
  'Raio ⚡',
  'Craque ⭐',
  'Furacão 🌪️',
  'Polvo 🐙',
  'Canhão 💥',
  'Coruja 🦉',
  'Trovão ⛈️',
  'Cometa ☄️',
  'Leão 🦁',
  'Águia 🦅',
  'Pantera 🐆',
  'Faísca ✨',
  'Mola 🦘',
]

export function apelidoAleatorio(): string {
  return APELIDOS[Math.floor(Math.random() * APELIDOS.length)]
}
