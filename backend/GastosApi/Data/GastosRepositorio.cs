using GastosApi.Logica;
using GastosApi.Models;

namespace GastosApi.Data;

// La implementación REAL: guarda en Postgres vía EF Core.
public class GastosRepositorio : IGastosRepositorio
{
    private readonly GastosContext _db;

    public GastosRepositorio(GastosContext db)
    {
        _db = db;
    }

    public async Task AgregarAsync(Gasto gasto)
    {
        _db.Gastos.Add(gasto);
        await _db.SaveChangesAsync();
    }
}
