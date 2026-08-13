using GastosApi.Models;
using Microsoft.EntityFrameworkCore;

namespace GastosApi.Data;

// El DbContext es el puente entre tus objetos C# y la base PostgreSQL.
// Recibe la configuración (qué proveedor y qué connection string) por
// inyección de dependencias: se arma en Program.cs con AddDbContext.
public class GastosContext : DbContext
{
    public GastosContext(DbContextOptions<GastosContext> options) : base(options)
    {
    }

    // Cada DbSet es, conceptualmente, una tabla. Este mapea a la tabla "Gastos".
    // Sobre él corren las consultas LINQ que EF traduce a SQL.
    public DbSet<Gasto> Gastos => Set<Gasto>();
}
