// A criança já fez o aquecimento hoje?
import { useProgressStore } from '../../stores/progressStore'
import { hojeISO } from '../../utils/data'

export function useAqueceuHoje(): boolean {
  return useProgressStore((s) => (s.atividadesPorDia[hojeISO()] ?? []).includes('aquecimento'))
}
