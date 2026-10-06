// Confere, com o app aberto, se é hora de lembrar do treino (a cada 30 s e sempre que o app
// volta para a tela). Também mantém atualizada a cópia que o aviso em segundo plano usa.
import { useEffect } from 'react'
import { useAgendaStore } from '../../stores/agendaStore'
import { useProgressStore } from '../../stores/progressStore'
import { hojeISO, minutosDoHorario } from '../../utils/data'
import { espelharParaSegundoPlano, lerDoBanco, marcarAvisoNoBanco, mostrarNotificacao } from './lembrete'

export function useLembreteDiario() {
  const ativo = useAgendaStore((s) => s.lembreteAtivo)
  const horario = useAgendaStore((s) => s.horario)
  const diasTreinados = useProgressStore((s) => s.diasTreinados)

  const ultimoDiaTreinado = diasTreinados.length ? diasTreinados[diasTreinados.length - 1] : null
  useEffect(() => {
    espelharParaSegundoPlano({ ativo, horario, ultimoDiaTreinado })
  }, [ativo, horario, ultimoDiaTreinado])

  useEffect(() => {
    if (!ativo) return
    const verificar = async () => {
      const agora = new Date()
      const hoje = hojeISO(agora)
      if (useAgendaStore.getState().ultimoAvisoDia === hoje) return
      if (agora.getHours() * 60 + agora.getMinutes() < minutosDoHorario(horario)) return
      if (useProgressStore.getState().diasTreinados.includes(hoje)) return
      // O aviso em segundo plano já apareceu hoje? Então não repete
      if ((await lerDoBanco<string>('ultimoAviso')) === hoje) return useAgendaStore.getState().registrarAviso(hoje, false)

      marcarAvisoNoBanco(hoje)
      // App em segundo plano: notificação do sistema. Na tela: aviso dentro do app.
      const notificou = document.visibilityState === 'hidden' && (await mostrarNotificacao())
      useAgendaStore.getState().registrarAviso(hoje, !notificou)
    }
    void verificar()
    const intervalo = setInterval(verificar, 30_000)
    document.addEventListener('visibilitychange', verificar)
    return () => {
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', verificar)
    }
  }, [ativo, horario])
}
