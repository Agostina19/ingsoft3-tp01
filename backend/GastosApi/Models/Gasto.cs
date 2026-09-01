namespace GastosApi.Models;

// Entidad del dominio: representa un gasto personal.
// EF Core mapea cada propiedad a una columna de la tabla "Gastos".
public class Gasto
{
    // Clave primaria. EF la reconoce por convención (propiedad llamada Id)
    // y Postgres la genera de forma autoincremental.
    public int Id { get; set; }

    // Qué se gastó. string.Empty evita nulls por defecto (Nullable enable).
    public string Descripcion { get; set; } = string.Empty;

    // Cuánto. decimal (no double) porque es dinero: evita errores de redondeo binario.
    public decimal Monto { get; set; }

    // Categoría libre (ej: "Comida", "Transporte").
    public string Categoria { get; set; } = string.Empty;

    // Cuándo se hizo el gasto. Se guarda en UTC para no depender de la zona horaria.
    public DateTime Fecha { get; set; }
}
