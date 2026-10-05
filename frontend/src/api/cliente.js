// El cliente REAL: sale a la red con fetch. Es el que la app le pasa
// a obtenerResumen; en los tests se reemplaza por vi.fn().
export const traerJson = async (url) => (await fetch(url)).json()
