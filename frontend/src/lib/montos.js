// Clasifica un gasto según su monto.
// (Varios caminos y —a propósito— ningún test: este PR queda frenado.)
export function rangoDeMonto(monto) {
  const valor = Number(monto)
  if (!(valor > 0)) {
    return 'invalido'
  }
  if (valor < 1000) {
    return 'chico'
  }
  if (valor < 10000) {
    return 'mediano'
  }
  if (valor < 100000) {
    return 'grande'
  }
  return 'enorme'
}
