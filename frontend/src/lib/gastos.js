// Lógica pura del front: recibe valores y devuelve valores, sin DOM ni red.
// Por eso se testea sin navegador y sin backend levantado.

export const LARGO_MAXIMO = 100

// Las MISMAS reglas que el backend (GastoValidator): el front avisa antes
// de mandar; el back es el que manda de verdad.
export function validarGasto({ descripcion, monto, categoria }) {
  if (!descripcion || !descripcion.trim()) {
    return { valido: false, error: 'La descripción es obligatoria.' }
  }
  if (descripcion.trim().length > LARGO_MAXIMO) {
    return { valido: false, error: `La descripción no puede superar los ${LARGO_MAXIMO} caracteres.` }
  }
  if (!(Number(monto) > 0)) {
    return { valido: false, error: 'El monto tiene que ser mayor a cero.' }
  }
  if (!categoria || !categoria.trim()) {
    return { valido: false, error: 'La categoría es obligatoria.' }
  }
  return { valido: true, error: null }
}

// Filtro de la pestaña Gastos: por categoría (vacía = todas) y por texto en la descripción.
export function filtrarGastos(gastos, categoria, busqueda) {
  return gastos.filter((g) => {
    const coincideCat = !categoria || g.categoria === categoria
    const coincideTexto = g.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCat && coincideTexto
  })
}

// Pide el resumen a la API. El cliente ("traer") ENTRA POR PARÁMETRO:
// la app le pasa el real; el test, un impostor (vi.fn()).
export async function obtenerResumen(mes, traer) {
  const url = mes ? `/api/gastos/resumen?mes=${mes}` : '/api/gastos/resumen'
  return traer(url)
}
