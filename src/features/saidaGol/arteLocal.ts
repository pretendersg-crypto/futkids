// Arte 3D dos gestos (goleiro de uniforme laranja), em dois lugares:
//  - src/assets/goleiro3d/<pose>.webp: arte do app, pública (vai para o site). Só personagem genérico,
//    feito por texto (nunca a partir de foto de criança) e sem marcas reais;
//  - src/local/goleiro3d/<pose>.(webp|png|jpg): arte da família, que fica SÓ no computador (a pasta
//    está no .gitignore: nunca vai para o GitHub nem para o site). Quando existe, vale mais que a do app.
// Nome do arquivo = id da pose (ex.: base.webp). Sem arte, fica o goleiro desenhado (que se mexe).
const DO_APP = import.meta.glob<string>('../../assets/goleiro3d/*.{webp,png,jpg,jpeg}', { eager: true, query: '?url', import: 'default' })
const DA_FAMILIA = import.meta.glob<string>('../../local/goleiro3d/*.{webp,png,jpg,jpeg}', { eager: true, query: '?url', import: 'default' })

const porPose = (arquivos: Record<string, string>) =>
  Object.fromEntries(Object.entries(arquivos).map(([caminho, url]) => [caminho.split('/').pop()!.replace(/\.[^.]+$/, ''), url]))

const POR_POSE: Record<string, string> = { ...porPose(DO_APP), ...porPose(DA_FAMILIA) }

/** Arte 3D da pose (a da família primeiro, depois a do app), se existe */
export function arteLocalDaPose(pose: string): string | undefined {
  return POR_POSE[pose]
}
