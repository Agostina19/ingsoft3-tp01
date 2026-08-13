import { useState, useEffect } from 'react'
import './App.css'

// Rutas relativas: nunca escribimos el host del backend.
// En dev lo resuelve el proxy de Vite; en contenedor, nginx.
const API = '/api/gastos'

// Formatea números como plata argentina: $ 1.234,50
const pesos = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

// Convierte una clave "2026-08" en un nombre legible: "agosto de 2026".
const nombreMes = (clave) => {
  const [anio, mes] = clave.split('-')
  return new Date(anio, mes - 1).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })
}

function App() {
  // Pestaña activa: 'gastos' o 'resumen'.
  const [tab, setTab] = useState('gastos')

  const [gastos, setGastos] = useState([])
  const [total, setTotal] = useState(0)
  // Datos del dashboard (dependen del mes seleccionado).
  const [resumen, setResumen] = useState([]) // total por categoría
  const [resumenTotal, setResumenTotal] = useState(0)
  const [resumenCant, setResumenCant] = useState(0)
  const [mesSel, setMesSel] = useState('') // '' = todos los meses

  // Formulario (sirve para alta y edición).
  const [form, setForm] = useState({ descripcion: '', monto: '', categoria: '' })
  const [editandoId, setEditandoId] = useState(null)

  // Filtros de la pestaña Gastos.
  const [filtroCat, setFiltroCat] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // Trae la lista y el total general (todos los meses).
  async function cargar() {
    const lista = await fetch(API).then((r) => r.json())
    const t = await fetch(`${API}/total`).then((r) => r.json())
    setGastos(lista)
    setTotal(t.total)
  }

  // Trae el resumen del dashboard, filtrado por el mes seleccionado.
  async function cargarResumen(mes) {
    const url = mes ? `${API}/resumen?mes=${mes}` : `${API}/resumen`
    const res = await fetch(url).then((r) => r.json())
    setResumen(res.porCategoria)
    setResumenTotal(res.total)
    setResumenCant(res.cantidad)
  }

  // Al montar: cargamos la lista una vez.
  useEffect(() => {
    cargar()
  }, [])

  // Cada vez que cambia el mes elegido, recargamos el dashboard.
  useEffect(() => {
    cargarResumen(mesSel)
  }, [mesSel])

  // Alta o edición según si hay un id en edición.
  async function guardar(e) {
    e.preventDefault()
    const body = JSON.stringify({
      descripcion: form.descripcion,
      monto: Number(form.monto),
      categoria: form.categoria,
    })
    const headers = { 'Content-Type': 'application/json' }

    if (editandoId) {
      await fetch(`${API}/${editandoId}`, { method: 'PUT', headers, body })
    } else {
      await fetch(API, { method: 'POST', headers, body })
    }
    setForm({ descripcion: '', monto: '', categoria: '' })
    setEditandoId(null)
    cargar()
    cargarResumen(mesSel)
  }

  function editar(g) {
    setForm({ descripcion: g.descripcion, monto: g.monto, categoria: g.categoria })
    setEditandoId(g.id)
  }

  function cancelar() {
    setForm({ descripcion: '', monto: '', categoria: '' })
    setEditandoId(null)
  }

  async function borrar(id) {
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    cargar()
    cargarResumen(mesSel)
  }

  // Categorías únicas para el desplegable del filtro.
  const categorias = [...new Set(gastos.map((g) => g.categoria))].sort()

  // Meses con datos (clave "yyyy-MM"), más nuevo primero, para el filtro del resumen.
  const meses = [...new Set(gastos.map((g) => g.fecha.slice(0, 7)))].sort().reverse()

  // Lista visible: aplica filtro por categoría y búsqueda por descripción.
  const gastosVisibles = gastos.filter((g) => {
    const coincideCat = !filtroCat || g.categoria === filtroCat
    const coincideTexto = g.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCat && coincideTexto
  })

  // El monto más alto entre las categorías, para dimensionar las barras del resumen.
  const maxCat = Math.max(1, ...resumen.map((r) => r.total))

  return (
    <div className="app">
      <header className="topbar">
        <h1>💸 Gestor de gastos</h1>
        <div className="total-chip">Total: {pesos(total)}</div>
      </header>

      <nav className="tabs">
        <button className={tab === 'gastos' ? 'active' : ''} onClick={() => setTab('gastos')}>
          Gastos
        </button>
        <button className={tab === 'resumen' ? 'active' : ''} onClick={() => setTab('resumen')}>
          Resumen
        </button>
      </nav>

      {tab === 'gastos' && (
        <>
          <section className="card">
            <h2>{editandoId ? 'Editar gasto' : 'Nuevo gasto'}</h2>
            <form onSubmit={guardar}>
              <input
                placeholder="Descripción"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Monto"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                required
              />
              <input
                placeholder="Categoría"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                required
              />
              <button type="submit" className="primary">
                {editandoId ? 'Guardar' : 'Agregar'}
              </button>
              {editandoId && (
                <button type="button" onClick={cancelar}>
                  Cancelar
                </button>
              )}
            </form>
          </section>

          <section className="card">
            <div className="filtros">
              <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}>
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                placeholder="🔍 Buscar por descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {gastosVisibles.length === 0 ? (
              <p className="vacio">No hay gastos para mostrar.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Monto</th>
                    <th>Categoría</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {gastosVisibles.map((g) => (
                    <tr key={g.id}>
                      <td>{g.descripcion}</td>
                      <td className="monto">{pesos(g.monto)}</td>
                      <td>
                        <span className="badge">{g.categoria}</span>
                      </td>
                      <td>{new Date(g.fecha).toLocaleDateString('es-AR')}</td>
                      <td className="acciones">
                        <button onClick={() => editar(g)}>Editar</button>
                        <button className="danger" onClick={() => borrar(g.id)}>
                          Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

      {tab === 'resumen' && (
        <>
          <section className="card">
            <div className="filtros">
              <select value={mesSel} onChange={(e) => setMesSel(e.target.value)}>
                <option value="">Todos los meses</option>
                {meses.map((m) => (
                  <option key={m} value={m}>
                    {nombreMes(m)}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="card total-grande">
            <span>Total gastado {mesSel ? `· ${nombreMes(mesSel)}` : ''}</span>
            <strong>{pesos(resumenTotal)}</strong>
            <small>{resumenCant} gasto(s)</small>
          </section>

          <section className="card">
            <h2>Total por categoría</h2>
            {resumen.length === 0 ? (
              <p className="vacio">Todavía no cargaste gastos.</p>
            ) : (
              <div className="barras">
                {resumen.map((r) => (
                  <div key={r.categoria} className="barra-fila">
                    <span className="barra-label">{r.categoria}</span>
                    <div className="barra-track">
                      <div
                        className="barra-fill"
                        style={{ width: `${(r.total / maxCat) * 100}%` }}
                      />
                    </div>
                    <span className="barra-monto">{pesos(r.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default App
