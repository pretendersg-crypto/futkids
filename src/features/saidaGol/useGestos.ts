// Gestos do goleiro como a criança vê: os do app (com as mudanças dos pais) e os criados.
import { useMemo } from 'react'
import { todosOsGestos, useGestosStore } from '../../stores/gestosStore'
import type { Gesto } from './gestos'

export function useGestos(): Gesto[] {
  const editados = useGestosStore((s) => s.editados)
  const criados = useGestosStore((s) => s.criados)
  return useMemo(() => todosOsGestos({ editados, criados }), [editados, criados])
}

/** Um gesto pelo id (undefined se não existe mais) */
export function useGesto(id: string | undefined): Gesto | undefined {
  return useGestos().find((g) => g.id === id)
}
