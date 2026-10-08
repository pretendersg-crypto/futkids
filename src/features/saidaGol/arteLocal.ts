// Arte 3D dos gestos (goleiro de uniforme laranja): imagem e/ou vídeo curto em loop, em dois lugares:
//  - src/assets/goleiro3d/<pose>.(webp|png|jpg|mp4|webm): arte do app, pública (vai para o site). Só
//    personagem genérico, feito por texto (nunca a partir de foto de criança) e sem marcas reais;
//  - src/local/goleiro3d/<pose>.(...): arte da família, que fica SÓ no computador (a pasta está no
//    .gitignore: nunca vai para o GitHub nem para o site). Quando existe, vale mais que a do app.
// Nome do arquivo = id da pose (ex.: base.webp, base.mp4). Com vídeo, ele roda em loop e a imagem vira
// a capa (aparece enquanto o vídeo carrega). Sem arte, fica o goleiro desenhado (que se mexe).
const DO_APP = import.meta.glob<string>('../../assets/goleiro3d/*.{webp,png,jpg,jpeg,mp4,webm}', { eager: true, query: '?url', import: 'default' })
const DA_FAMILIA = import.meta.glob<string>('../../local/goleiro3d/*.{webp,png,jpg,jpeg,mp4,webm}', { eager: true, query: '?url', import: 'default' })

export interface Arte {
  imagem?: string
  video?: string
}

const EH_VIDEO = /\.(mp4|webm)$/i

/** Junta os arquivos por pose (a família por último, para valer mais que o app) */
export function montarArtes(...fontes: Record<string, string>[]): Record<string, Arte> {
  const artes: Record<string, Arte> = {}
  for (const fonte of fontes) {
    // Por fonte: a arte da família troca a do app inteira (não mistura vídeo de um com imagem do outro)
    const daFonte: Record<string, Arte> = {}
    for (const [caminho, url] of Object.entries(fonte)) {
      const arquivo = caminho.split('/').pop()!
      const pose = arquivo.replace(/\.[^.]+$/, '')
      daFonte[pose] = { ...daFonte[pose], [EH_VIDEO.test(arquivo) ? 'video' : 'imagem']: url }
    }
    Object.assign(artes, daFonte)
  }
  return artes
}

const POR_POSE = montarArtes(DO_APP, DA_FAMILIA)

/** Arte 3D da pose (a da família primeiro, depois a do app), se existe */
export function arteDaPose(pose: string): Arte | undefined {
  return POR_POSE[pose]
}
