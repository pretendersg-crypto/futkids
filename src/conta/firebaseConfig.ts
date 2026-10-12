// Configuração do projeto Firebase da conta da família (login com Google e os dados na nuvem).
// Estes valores NÃO são segredo: todo app web do Firebase mostra isso no navegador. Quem protege os
// dados são as regras do Firestore (firestore.rules), que só deixam cada família ler e gravar o que é
// dela. Passo a passo para criar o projeto e preencher aqui: FIREBASE.md.
// null = conta da família ainda não configurada (o app funciona como antes, só no aparelho).
import type { FirebaseOptions } from 'firebase/app'

export const FIREBASE_CONFIG: FirebaseOptions | null = null

/**
 * Chave do site do reCAPTCHA v3 para o App Check (prova que o acesso ao banco vem do app, não de um
 * robô). null = App Check desligado. Passo a passo em FIREBASE.md, seção 5.
 */
export const APP_CHECK_CHAVE_SITE: string | null = null
