// Apaga do aparelho as imagens e os vídeos gravados que nenhum exercício nem gesto usa mais
// (ex.: GIF trocado, vídeo regravado, exercício ou gesto apagado). Junta o que está em uso em
// todos os lugares antes de apagar, para não sumir com a mídia de outra tela.
import { useGestosStore } from '../stores/gestosStore'
import { useTreinosStore } from '../stores/treinosStore'
import { limparImagensSoltas } from './midiaLocal'

export function limparMidiaSolta() {
  const usados = new Set<string>()
  for (const lista of Object.values(useTreinosStore.getState().exercicios)) {
    for (const e of lista) {
      if (e.gif) usados.add(e.gif)
      if (e.videoLocal) usados.add(e.videoLocal)
    }
  }
  const { editados, criados } = useGestosStore.getState()
  for (const g of [...Object.values(editados), ...criados]) {
    if (g.desenho.tipo === 'imagem') usados.add(g.desenho.id)
    if (g.videoLocal) usados.add(g.videoLocal)
  }
  void limparImagensSoltas(usados)
}
