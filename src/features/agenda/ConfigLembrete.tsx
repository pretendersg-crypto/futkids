// Configuração do lembrete diário. Pede permissão de notificação ao sistema, então é coisa
// de adulto: fica atrás do portão dos pais.
import { useState } from 'react'
import { PortaoDosPais } from '../../components/ui/PortaoDosPais'
import { useAgendaStore } from '../../stores/agendaStore'
import { configurarSegundoPlano, pedirPermissaoNotificacao, permissaoNotificacao, type PermissaoNotificacao } from './lembrete'

const TEXTO_PERMISSAO: Record<PermissaoNotificacao, string> = {
  permitida: '✅ Notificações permitidas',
  bloqueada: '🚫 Notificações bloqueadas nas configurações do navegador. O aviso aparece só dentro do app.',
  perguntar: 'ℹ️ O celular vai perguntar se pode mostrar notificações.',
  'sem-suporte': 'ℹ️ Este navegador não mostra notificações. O aviso aparece só dentro do app.',
}

export function ConfigLembrete() {
  const ativo = useAgendaStore((s) => s.lembreteAtivo)
  const horarioSalvo = useAgendaStore((s) => s.horario)
  const [liberado, setLiberado] = useState(false)
  const [horario, setHorario] = useState(horarioSalvo)
  const [permissao, setPermissao] = useState(permissaoNotificacao)
  const [salvo, setSalvo] = useState(false)

  async function salvar(ligar: boolean) {
    if (ligar && permissao === 'perguntar') setPermissao(await pedirPermissaoNotificacao())
    useAgendaStore.getState().configurarLembrete(ligar, horario)
    void configurarSegundoPlano(ligar)
    setSalvo(true)
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-extrabold">⏰ Lembrete diário</h2>
      <p className="text-base">{ativo ? `Ligado, às ${horarioSalvo}.` : 'Desligado.'}</p>

      {!liberado ? (
        <details className="rounded-2xl border-4 border-dashed border-violet-200 bg-white p-3">
          <summary className="min-h-10 cursor-pointer text-lg font-bold">👨‍👩‍👧 Configurar (para adultos)</summary>
          <div className="pt-3">
            <PortaoDosPais aoLiberar={() => setLiberado(true)} />
          </div>
        </details>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border-4 border-violet-200 bg-white p-3">
          <label className="flex items-center justify-between gap-3 text-lg font-bold">
            Horário
            <input
              type="time"
              value={horario}
              onChange={(e) => {
                setHorario(e.target.value || '17:00')
                setSalvo(false)
              }}
              className="min-h-12 rounded-xl border-4 border-violet-200 px-3 text-xl"
            />
          </label>
          <p className="text-sm">{TEXTO_PERMISSAO[permissao]}</p>
          <p className="text-sm">
            Funciona sem internet e sem enviar dados: com o app aberto, o aviso chega na hora. Com o app fechado, aparece quando
            abrir de novo (no Android, com o app instalado, às vezes chega antes, mas sem horário certo). Se a criança já
            treinou no dia, não avisa.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => salvar(true)} className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow">
              {ativo ? 'Salvar ✅' : 'Ligar 🔔'}
            </button>
            <button
              type="button"
              disabled={!ativo}
              onClick={() => salvar(false)}
              className="min-h-14 rounded-2xl border-4 border-violet-200 bg-white text-lg font-extrabold disabled:opacity-50"
            >
              Desligar 🔕
            </button>
          </div>
          {salvo && (
            <p role="status" className="text-center font-bold">
              ✅ Pronto!
            </p>
          )}
        </div>
      )}
    </section>
  )
}
