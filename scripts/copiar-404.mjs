// GitHub Pages não conhece as rotas do app: abrir /futkids/agenda direto daria "404".
// Uma cópia do index.html como 404.html faz o próprio app abrir e mostrar a tela certa.
import { copyFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
console.log('dist/404.html criado (rotas do app funcionam no GitHub Pages)')
