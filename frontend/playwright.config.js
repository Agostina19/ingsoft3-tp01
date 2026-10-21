import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',                // recoge los DOS archivos; cada job corre el suyo por nombre
  timeout: 60_000,                 // tope de CADA test
  expect: { timeout: 15_000 },     // tope de CADA aserción (el default es 5 s)
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',   // el FRONT. La api usa API_BASE_URL
    trace: 'on-first-retry',         // la traza se graba en el retry de un fallo
    screenshot: 'only-on-failure',   // screenshot de cada fallo en el reporte
  },
  retries: 1,                      // 1 retry: si un test pasa recién ahí, sale «flaky»
  reporter: [['html', { open: 'never' }], ['list']],
})
