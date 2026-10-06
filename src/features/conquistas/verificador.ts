// Liga o progresso às conquistas: toda vez que o progresso muda (XP, contadores, dias),
// as regras são conferidas. Assim nenhum módulo precisa lembrar de chamar "verificar".
import { useAchievementsStore } from '../../stores/achievementsStore'
import { useProgressStore } from '../../stores/progressStore'

export function iniciarVerificacaoDeConquistas() {
  const verificar = () => useAchievementsStore.getState().verificar(useProgressStore.getState())
  verificar() // confere uma vez ao abrir o app (ex.: regra nova adicionada numa atualização)
  return useProgressStore.subscribe(verificar)
}
