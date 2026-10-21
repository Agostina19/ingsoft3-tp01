import { expect, test } from '@playwright/test'

// Completa el formulario de "Nuevo gasto" como lo haría una persona
async function cargarGasto (page, { descripcion, monto, categoria }) {
  await page.getByLabel('Descripción del nuevo gasto').fill(descripcion)
  await page.getByLabel('Monto del nuevo gasto').fill(monto)
  await page.getByLabel('Categoría del nuevo gasto').fill(categoria)
  await page.getByRole('button', { name: 'Agregar' }).click()
}

test('crear un gasto lo muestra en la lista, y borrarlo lo saca', async ({ page }) => {
  await page.goto('/')
  const descripcion = `e2e ${Date.now()}`                   // único: no choca con otra corrida
  await cargarGasto(page, { descripcion, monto: '150', categoria: 'Prueba e2e' })

  await expect(page.getByText(descripcion)).toBeVisible()   // el dato que ESTE test creó, sin sleeps

  await page.getByRole('button', { name: `Borrar ${descripcion}` }).click()
  await expect(page.getByText(descripcion)).toHaveCount(0)  // y el borrado, comprobado
})

test('una descripción demasiado larga muestra el error y no crea nada', async ({ page }) => {
  await page.goto('/')
  const descripcion = `e2e ${Date.now()} ${'x'.repeat(100)}` // pasa el máximo de 100 caracteres
  await cargarGasto(page, { descripcion, monto: '150', categoria: 'Prueba e2e' })

  await expect(page.getByRole('alert')).toBeVisible()       // el usuario ve el error…
  await expect(page.getByText(descripcion)).toHaveCount(0)  // …y en la lista no apareció nada
})

test('el resumen por categoría muestra el gasto nuevo, y deja de mostrarlo al borrarlo', async ({ page }) => {
  await page.goto('/')
  const categoria = `e2e ${Date.now()}`                     // categoría única: sólo este gasto la tiene
  const descripcion = `resumen ${categoria}`
  await cargarGasto(page, { descripcion, monto: '250', categoria })
  await expect(page.getByText(descripcion)).toBeVisible()   // esperamos a que se haya guardado 
  await page.getByRole('button', { name: 'Resumen', exact: true }).click()

  const fila = page.getByText(categoria, { exact: true }).locator('..')   // la fila de esa categoría
  await expect(fila).toContainText('250,00')                // con el monto que sumó la base

  await page.getByRole('button', { name: 'Gastos', exact: true }).click()   // vuelvo, borro… 
  await page.getByRole('button', { name: `Borrar ${descripcion}` }).click()
  await expect(page.getByText(descripcion)).toHaveCount(0)
  await page.getByRole('button', { name: 'Resumen', exact: true }).click() // …y ya no está en el resumen
  await expect(page.getByText(categoria, { exact: true })).toHaveCount(0)
})
