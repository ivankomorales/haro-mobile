// src/utils/useRequireState.js
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Verifica una condición sobre location.state. Si no se cumple, redirige.
 * @param {(st:any)=>boolean} check  Función que retorna true si el state es válido
 * @param {string} redirectTo        Ruta a donde mandar si falla
 * @param {()=>any} [buildState]     (Opcional) state a pasar al redirect (ej. originPath)
 */
export function useRequireState(check, redirectTo, buildState) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const ok = check(location.state)
    if (!ok) {
      navigate(redirectTo, {
        replace: true,
        state: buildState ? buildState() : undefined,
      })
    }
    // Nota: si tu linter se queja por "exhaustive-deps",
    // puedes envolver `check` y `buildState` en useCallback en el componente que llama,
    // o simplemente deshabilitar la regla para esta línea.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, navigate, redirectTo])
}
