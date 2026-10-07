// src/lib/antiguedad.test.js — un test por camino. `ahora` entra por parámetro,
// así el test no depende del reloj (la regla de determinismo del §2.2)
import { describe, expect, it } from 'vitest'
import { antiguedadDe } from './gastos.js'

describe('antiguedadDe', () => {
  const ahora = new Date('2026-07-01T12:00:00Z')

  it('devuelve sin-fecha si el gasto no tiene fecha', () => {
    expect(antiguedadDe({}, ahora)).toBe('sin-fecha')
  })

  it('devuelve hoy dentro del primer día', () => {
    expect(antiguedadDe({ fecha: '2026-07-01T06:00:00Z' }, ahora)).toBe('hoy')
  })

  it('devuelve esta-semana antes de los siete días', () => {
    expect(antiguedadDe({ fecha: '2026-06-28T12:00:00Z' }, ahora)).toBe('esta-semana')
  })

  it('devuelve este-mes antes de los treinta días', () => {
    expect(antiguedadDe({ fecha: '2026-06-15T12:00:00Z' }, ahora)).toBe('este-mes')
  })

  it('devuelve viejo pasados los treinta días', () => {
    expect(antiguedadDe({ fecha: '2026-05-01T12:00:00Z' }, ahora)).toBe('viejo')
  })
})
