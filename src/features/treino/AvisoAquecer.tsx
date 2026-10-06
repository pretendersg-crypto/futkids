// "Aquecimento sempre antes de cada treino": se a criança ainda não aqueceu hoje, o Bolinha
// lembra antes dos outros treinos. É só um lembrete (dá para seguir mesmo assim).
import { Link } from 'react-router'
import { Mascote } from '../../components/mascote/Mascote'
import { useAqueceuHoje } from './useAqueceuHoje'

export function AvisoAquecer() {
  const aqueceu = useAqueceuHoje()
  if (aqueceu) return null
  return (
    <div className="flex flex-col gap-2 rounded-3xl border-4 border-orange-300 bg-orange-50 p-3">
      <Mascote humor="pensando" fala="Antes de treinar, aqueça o corpo! Assim você não se machuca. 🔥" tamanho={64} />
      <Link to="/treinos/aquecimento" className="grid min-h-14 place-items-center rounded-2xl bg-sol text-lg font-extrabold shadow">
        Aquecer primeiro 🔥
      </Link>
    </div>
  )
}
