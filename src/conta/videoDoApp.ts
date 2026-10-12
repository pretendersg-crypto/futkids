// Referência a um vídeo do treinador guardado no FutKids (Cloud Storage), no campo "vídeo" de um treino
// do plano: "fkvideo:<caminho do arquivo>". Links comuns (YouTube, Hotmart) continuam como estão.
const PREFIXO = 'fkvideo:'

export const ehVideoDoApp = (video: string | undefined): video is string => Boolean(video?.startsWith(PREFIXO))
export const referenciaDoVideo = (caminho: string) => PREFIXO + caminho
export const caminhoDoVideo = (video: string) => video.slice(PREFIXO.length)
