// Voz do celular (síntese de fala do próprio aparelho, funciona sem internet na maioria dos
// celulares). Fala o sinal para quem está longe da tela. Respeita o botão de som do Perfil.
import { useConfigStore } from '../../stores/configStore'

export const temVoz = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function falar(texto: string) {
  if (!temVoz() || !useConfigStore.getState().somAtivo) return
  const sintese = window.speechSynthesis
  sintese.cancel() // não acumula falas atrasadas
  const fala = new SpeechSynthesisUtterance(texto)
  fala.lang = 'pt-BR'
  fala.voice = sintese.getVoices().find((v) => v.lang.replace('_', '-').startsWith('pt-BR')) ?? null
  fala.rate = 1.2
  sintese.speak(fala)
}

export function calar() {
  if (temVoz()) window.speechSynthesis.cancel()
}
