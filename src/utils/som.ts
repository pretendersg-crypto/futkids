// Sons curtos gerados na hora (Web Audio), sem baixar arquivos de áudio.
// Os navegadores só liberam som depois de um toque: chame destravarSom() dentro de um onClick.

let contexto: AudioContext | null = null

export function destravarSom() {
  try {
    contexto ??= new AudioContext()
    if (contexto.state === 'suspended') void contexto.resume()
  } catch {
    contexto = null // navegador sem Web Audio: o app segue sem som
  }
}

function bip(frequencia: number, duracaoMs: number, volume = 0.2) {
  if (!contexto) return
  const agora = contexto.currentTime
  const oscilador = contexto.createOscillator()
  const ganho = contexto.createGain()
  oscilador.frequency.value = frequencia
  ganho.gain.setValueAtTime(volume, agora)
  ganho.gain.exponentialRampToValueAtTime(0.001, agora + duracaoMs / 1000)
  oscilador.connect(ganho).connect(contexto.destination)
  oscilador.start(agora)
  oscilador.stop(agora + duracaoMs / 1000)
}

export const sons = {
  /** 3, 2, 1... */
  contagem: () => bip(520, 150),
  /** "Vai!" */
  largada: () => bip(880, 300),
  /** Cada repetição, para a criança seguir o ritmo sem olhar a tela */
  repeticao: () => bip(440, 80, 0.12),
  /** Exercício concluído */
  concluido: () => {
    bip(660, 120)
    setTimeout(() => bip(990, 220), 130)
  },
  /** Goleiro defendeu: duas notas subindo */
  defesa: () => {
    bip(784, 100)
    setTimeout(() => bip(1175, 180), 90)
  },
  /** Tomou gol: duas notas descendo, baixinho (sem bronca) */
  gol: () => {
    bip(392, 140, 0.12)
    setTimeout(() => bip(330, 220, 0.12), 130)
  },
  /** Apito antes do chute */
  apito: () => bip(1400, 180, 0.15),
  /** Toque na bola: a nota sobe com o combo, dá vontade de não errar */
  toque: (combo = 0) => bip(500 + Math.min(combo, 20) * 25, 70, 0.15),
  /** Figurinha nova: arpejo "tcharam!" (dó, mi, sol, dó) */
  vitoria: () => {
    ;[523, 659, 784, 1047].forEach((nota, i) => setTimeout(() => bip(nota, i === 3 ? 400 : 140), i * 120))
  },
}
