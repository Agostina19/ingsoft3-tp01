import { describe, expect, it, vi } from 'vitest'
import { validarGasto, filtrarGastos, obtenerResumen, LARGO_MAXIMO } from './gastos'

// Un gasto que cumple todas las reglas; cada test le cambia UNA cosa.
const valido = { descripcion: 'Almuerzo', monto: '1500', categoria: 'Comida' }

describe('validarGasto', () => {
  it('acepta un gasto completo', () => {
    expect(validarGasto(valido)).toEqual({ valido: true, error: null })
  })

  // Parametrizado: el equivalente del [Theory] + [InlineData] del backend
  it.each([
    ['vacía', ''],
    ['sólo espacios', '   '],
    ['un tabulador', '\t'],
    ['nula', null],
  ])('rechaza una descripción %s', (_caso, descripcion) => {
    const resultado = validarGasto({ ...valido, descripcion })

    expect(resultado.valido).toBe(false)
    expect(resultado.error).toBe('La descripción es obligatoria.')
  })

  // Caso de error: además de rechazar, el mensaje explica el límite
  it('rechaza una descripción que supera el largo máximo y explica el límite', () => {
    const resultado = validarGasto({ ...valido, descripcion: 'a'.repeat(LARGO_MAXIMO + 1) })

    expect(resultado.valido).toBe(false)
    expect(resultado.error).toContain(String(LARGO_MAXIMO))
  })

  it('acepta una descripción justo en el largo máximo', () => {
    const resultado = validarGasto({ ...valido, descripcion: 'a'.repeat(LARGO_MAXIMO) })

    expect(resultado.valido).toBe(true)
  })

  it.each([
    ['cero', '0'],
    ['negativo', '-5'],
    ['vacío', ''],
    ['que no es un número', 'abc'],
  ])('rechaza un monto %s', (_caso, monto) => {
    const resultado = validarGasto({ ...valido, monto })

    expect(resultado.valido).toBe(false)
    expect(resultado.error).toBe('El monto tiene que ser mayor a cero.')
  })

  it('rechaza un gasto sin categoría', () => {
    const resultado = validarGasto({ ...valido, categoria: '  ' })

    expect(resultado.valido).toBe(false)
    expect(resultado.error).toBe('La categoría es obligatoria.')
  })
})

describe('filtrarGastos', () => {
  const gastos = [
    { id: 1, descripcion: 'Almuerzo', categoria: 'Comida' },
    { id: 2, descripcion: 'Colectivo', categoria: 'Transporte' },
    { id: 3, descripcion: 'Cena', categoria: 'Comida' },
  ]

  it('sin filtros devuelve todos los gastos', () => {
    expect(filtrarGastos(gastos, '', '')).toHaveLength(3)
  })

  it('filtra por categoría', () => {
    const resultado = filtrarGastos(gastos, 'Comida', '')

    expect(resultado.map((g) => g.id)).toEqual([1, 3])
  })

  it('busca en la descripción sin importar mayúsculas', () => {
    const resultado = filtrarGastos(gastos, '', 'ALMU')

    expect(resultado.map((g) => g.id)).toEqual([1])
  })
})

describe('obtenerResumen', () => {
  // vi.fn() como STUB: sólo contesta datos fijos
  it('devuelve lo que contesta la API', async () => {
    const respuesta = { total: 2000, cantidad: 2, porCategoria: [] }
    const traer = vi.fn().mockResolvedValue(respuesta)

    const resumen = await obtenerResumen('2026-08', traer)

    expect(resumen).toEqual(respuesta)
  })

  // vi.fn() como MOCK: el assert mira la INTERACCIÓN (el equivalente del Verify de Moq)
  it('le pide a la API el resumen del mes elegido', async () => {
    const traer = vi.fn().mockResolvedValue({})

    await obtenerResumen('2026-08', traer)

    expect(traer).toHaveBeenCalledWith('/api/gastos/resumen?mes=2026-08')
  })

  it('sin mes le pide a la API el resumen general', async () => {
    const traer = vi.fn().mockResolvedValue({})

    await obtenerResumen('', traer)

    expect(traer).toHaveBeenCalledWith('/api/gastos/resumen')
  })
})
