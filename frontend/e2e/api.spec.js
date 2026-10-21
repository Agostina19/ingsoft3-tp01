import { expect, test } from '@playwright/test'

// La api de QA tiene su propia dirección: NO es la del front. Sin barra al final.
const API = process.env.API_BASE_URL || 'http://localhost:8080'

// Pide la lista de gastos y la devuelve ya convertida
async function listar (request) {
  const r = await request.get(`${API}/api/gastos`)
  expect(r.status()).toBe(200)
  return await r.json()
}

// Pide el resumen por categoría y lo devuelve ya convertido
async function resumen (request) {
  const r = await request.get(`${API}/api/gastos/resumen`)
  expect(r.status()).toBe(200)
  return await r.json()
}

test('el alta guarda el gasto en la base, y el borrado lo saca', async ({ request }) => {
  const descripcion = `api ${Date.now()}`                  // único: no choca con otra corrida
  const alta = await request.post(`${API}/api/gastos`, {
    data: { descripcion, monto: 123.45, categoria: 'Prueba' },
  })
  expect(alta.status()).toBe(201)                          // la api dice «creado»
  const creado = await alta.json()

  const lista = await listar(request)                      // y la BASE lo devuelve
  expect(lista.some(g => g.descripcion === descripcion)).toBe(true)

  const borrado = await request.delete(`${API}/api/gastos/${creado.id}`)
  expect(borrado.status()).toBe(204)                       // borrado, sin contenido

  const despues = await listar(request)                    // y el borrado, comprobado
  expect(despues.some(g => g.descripcion === descripcion)).toBe(false)
})

test('una descripción vacía la rechaza la api, y no crea nada', async ({ request }) => {
  const antes = await listar(request)

  const alta = await request.post(`${API}/api/gastos`, {
    data: { descripcion: '', monto: 100, categoria: 'Prueba' },   // sólo la descripción está mal
  })
  expect(alta.status()).toBe(400)                          // el contrato del error

  const despues = await listar(request)
  expect(despues.length).toBe(antes.length)                // y de verdad no se creó nada
})

test('el resumen por categoría suma el gasto nuevo, y deja de sumarlo al borrarlo', async ({ request }) => {
  const categoria = `api ${Date.now()}`                    // categoría única: sólo este gasto la tiene
  const alta = await request.post(`${API}/api/gastos`, {
    data: { descripcion: `resumen ${categoria}`, monto: 250, categoria },
  })
  expect(alta.status()).toBe(201)
  const creado = await alta.json()

  const conGasto = await resumen(request)                  // la suma la hace Postgres (GROUP BY)
  const fila = conGasto.porCategoria.find(c => c.categoria === categoria)
  expect(fila?.total).toBe(250)

  const borrado = await request.delete(`${API}/api/gastos/${creado.id}`)
  expect(borrado.status()).toBe(204)

  const sinGasto = await resumen(request)                  // y ya no aparece en el resumen
  expect(sinGasto.porCategoria.some(c => c.categoria === categoria)).toBe(false)
})
