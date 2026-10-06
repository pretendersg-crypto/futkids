// "📲 Instalar o app": aparece só quando o FutKids está aberto pelo navegador (com a barra de
// endereço). Instalar é coisa de adulto: passa pelo portão dos pais. Onde o navegador deixa
// (Chrome/Samsung no Android, Edge, Chrome no computador), instala com um toque; no iPhone/iPad
// e nos outros casos, mostra o passo a passo.
// - "faixa": cartão da Home, que dá para fechar ("Agora não")
// - "botao": botão do Perfil, sempre disponível enquanto não estiver instalado
import { useState, useSyncExternalStore } from 'react'
import { useConfigStore } from '../../stores/configStore'
import { abertoComoApp, assinarInstalar, ehAparelhoApple, instalarAgora, podeInstalarDireto } from '../../utils/instalar'
import { Modal } from './Modal'
import { PortaoDosPais } from './PortaoDosPais'

type Etapa = 'fechado' | 'portao' | 'passos' | 'instalado' | 'recusado'

export function InstalarApp({ jeito }: { jeito: 'faixa' | 'botao' }) {
  const direto = useSyncExternalStore(assinarInstalar, podeInstalarDireto, () => false)
  const fechada = useConfigStore((s) => s.faixaInstalarFechada)
  const fecharFaixa = useConfigStore((s) => s.fecharFaixaInstalar)
  const [etapa, setEtapa] = useState<Etapa>('fechado')

  if (abertoComoApp() && etapa !== 'instalado') return null
  if (jeito === 'faixa' && fechada) return null

  function liberado() {
    // Ainda dentro do toque no "Confirmar" do portão: o navegador aceita abrir a janela dele
    if (!podeInstalarDireto()) return setEtapa('passos')
    void instalarAgora().then((aceitou) => setEtapa(aceitou ? 'instalado' : 'recusado'))
  }

  const abrir = () => setEtapa('portao')

  return (
    <>
      {jeito === 'faixa' ? (
        <div className="flex flex-col gap-2 rounded-3xl border-4 border-sky-300 bg-sky-50 p-3">
          <p className="flex items-center gap-3 text-base font-bold">
            <span aria-hidden className="text-4xl">
              📲
            </span>
            <span>Instale o FutKids: abre como app, em tela cheia, e funciona sem internet.</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={fecharFaixa} className="min-h-12 rounded-2xl border-4 border-sky-200 bg-white font-bold">
              Agora não
            </button>
            <button type="button" onClick={abrir} className="min-h-12 rounded-2xl bg-sky-600 font-extrabold text-white">
              Instalar 📲
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={abrir} className="flex min-h-16 items-center gap-3 rounded-2xl border-4 border-sky-200 bg-white px-4 text-lg font-bold">
          <span aria-hidden className="text-3xl">
            📲
          </span>
          <span className="flex-1 text-left">Instalar o app neste aparelho</span>
        </button>
      )}

      <Modal aberto={etapa !== 'fechado'} aoFechar={() => setEtapa('fechado')} titulo="📲 Instalar o FutKids">
        {etapa === 'portao' && (
          <>
            <p className="text-base">{direto ? 'Depois da conta, o navegador pergunta se quer instalar.' : 'Depois da conta, mostramos como instalar.'}</p>
            <PortaoDosPais aoLiberar={liberado} />
          </>
        )}
        {etapa === 'passos' && <Passos />}
        {etapa === 'instalado' && (
          <p className="text-lg font-bold">✅ Pronto! Agora abra o FutKids pelo ícone na tela inicial. (Esta janela do navegador pode ser fechada.)</p>
        )}
        {etapa === 'recusado' && <p className="text-lg">Tudo bem! Quando quiser, é só tocar em "Instalar" de novo no Perfil.</p>}
      </Modal>
    </>
  )
}

/** Passo a passo de cada aparelho */
function Passos() {
  if (ehAparelhoApple()) {
    return (
      <ol className="flex list-decimal flex-col gap-2 pl-6 text-lg">
        <li>
          Abra este endereço no <b>Safari</b> (no iPhone/iPad só o Safari instala).
        </li>
        <li>
          Toque em <b>Compartilhar</b> (o quadrado com a seta para cima ⬆️).
        </li>
        <li>
          Escolha <b>"Adicionar à Tela de Início"</b> e depois <b>Adicionar</b>.
        </li>
        <li>Abra o FutKids pelo ícone novo na tela inicial.</li>
      </ol>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <ol className="flex list-decimal flex-col gap-2 pl-6 text-lg">
        <li>
          Abra este endereço no <b>Chrome</b> ou no <b>Samsung Internet</b>.
        </li>
        <li>
          Toque no menu <b>⋮</b> (no Samsung Internet, <b>☰</b>).
        </li>
        <li>
          Escolha <b>"Instalar app"</b> ou <b>"Adicionar à tela inicial"</b>.
        </li>
        <li>Abra o FutKids pelo ícone novo na tela inicial.</li>
      </ol>
      <p className="rounded-2xl bg-yellow-100 p-2 text-sm">
        Não aparece "Instalar"? O link pode ter aberto dentro do WhatsApp ou de outro app. Copie o endereço e cole direto no Chrome.
      </p>
    </div>
  )
}
