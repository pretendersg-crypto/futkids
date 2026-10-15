// Arte dos gestos (imagem, GIF e/ou vídeo curto em loop), que entra no lugar do bonequinho desenhado.
// Duas chaves, a do GESTO vale mais que a da POSE:
//  - por gesto: <id do gesto>.(gif|webp|png|jpg|mp4|webm), ex.: passe-primeira.gif. Cada gesto pode
//    ter a sua, mesmo os que usam o mesmo desenho (ex.: "passe com a parte de dentro" e "passe de
//    primeira");
//  - por pose: <id da pose>.(...), ex.: base.webp. Vale para todos os gestos com aquele desenho.
// E dois lugares:
//  - src/assets/gestos/ e src/assets/goleiro3d/: arte do app, PÚBLICA (vai para o site). Só
//    personagem genérico ou desenho, nunca foto ou vídeo de criança de verdade, e sem marcas reais;
//  - src/local/gestos/ e src/local/goleiro3d/: arte da família, que fica SÓ no computador (a pasta está
//    no .gitignore: nunca vai para o GitHub nem para o site). Quando existe, vale mais que a do app.
// Com vídeo, ele roda em loop e a imagem vira a capa. Sem arte, fica o desenho (que se mexe).
// Como trocar a arte publicada: ARTE_DOS_GESTOS.md, na raiz do projeto.
const POSE_APP = import.meta.glob<string>('../../assets/goleiro3d/*.{webp,png,jpg,jpeg,gif,mp4,webm}', { eager: true, query: '?url', import: 'default' })
const POSE_FAMILIA = import.meta.glob<string>('../../local/goleiro3d/*.{webp,png,jpg,jpeg,gif,mp4,webm}', { eager: true, query: '?url', import: 'default' })
const GESTO_APP = import.meta.glob<string>('../../assets/gestos/*.{webp,png,jpg,jpeg,gif,mp4,webm}', { eager: true, query: '?url', import: 'default' })
const GESTO_FAMILIA = import.meta.glob<string>('../../local/gestos/*.{webp,png,jpg,jpeg,gif,mp4,webm}', { eager: true, query: '?url', import: 'default' })

export interface Arte {
  imagem?: string
  video?: string
}

const EH_VIDEO = /\.(mp4|webm)$/i

/** Nome do arquivo sem a pasta e sem a extensão (= id do gesto ou da pose) */
export const nomeDaArte = (caminho: string) => caminho.split('/').pop()!.replace(/\.[^.]+$/, '')

/** Junta os arquivos por nome (a família por último, para valer mais que o app) */
export function montarArtes(...fontes: Record<string, string>[]): Record<string, Arte> {
  const artes: Record<string, Arte> = {}
  for (const fonte of fontes) {
    // Por fonte: a arte da família troca a do app inteira (não mistura vídeo de um com imagem do outro)
    const daFonte: Record<string, Arte> = {}
    for (const [caminho, url] of Object.entries(fonte)) {
      const nome = nomeDaArte(caminho)
      daFonte[nome] = { ...daFonte[nome], [EH_VIDEO.test(caminho) ? 'video' : 'imagem']: url }
    }
    Object.assign(artes, daFonte)
  }
  return artes
}

const POR_POSE = montarArtes(POSE_APP, POSE_FAMILIA)
const POR_GESTO = montarArtes(GESTO_APP, GESTO_FAMILIA)

/** Arquivos de arte por gesto publicados no app (para conferir os nomes nos testes) */
export const NOMES_ARTE_GESTO_APP = Object.keys(GESTO_APP).map(nomeDaArte)

/** Arte da pose (a da família primeiro, depois a do app), se existe */
export function arteDaPose(pose: string): Arte | undefined {
  return POR_POSE[pose]
}

/** Arte de um gesto: a dele, ou a da pose do desenho dele */
export function arteDoGesto(gesto: string | undefined, pose: string | undefined): Arte | undefined {
  return (gesto && POR_GESTO[gesto]) || (pose ? POR_POSE[pose] : undefined)
}
