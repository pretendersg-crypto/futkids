// Arte local dos gestos: imagens do aluno (avatares feitos a partir da foto dele) que ficam SÓ no
// computador da família, na pasta src/local/goleiro3d/ (está no .gitignore: nunca vai para o GitHub
// nem para o site publicado). Nome do arquivo = id da pose (ex.: base.webp, alta.png).
// Rodando o app localmente (npm run dev), o desenho do gesto mostra essa imagem; no site publicado a
// pasta não existe e fica o goleiro desenhado de sempre.
const ARQUIVOS = import.meta.glob<string>('../../local/goleiro3d/*.{webp,png,jpg,jpeg}', { eager: true, query: '?url', import: 'default' })

const POR_POSE: Record<string, string> = Object.fromEntries(
  Object.entries(ARQUIVOS).map(([caminho, url]) => [caminho.split('/').pop()!.replace(/\.[^.]+$/, ''), url]),
)

/** Imagem local da pose, se a família colocou uma */
export function arteLocalDaPose(pose: string): string | undefined {
  return POR_POSE[pose]
}
