using GastosApi.Models;

namespace GastosApi.Logica;

// QUÉ se le puede pedir al almacenamiento, no CÓMO lo hace.
// La app real la implementa con EF + Postgres; el test, con un mock.
public interface IGastosRepositorio
{
    Task AgregarAsync(Gasto gasto);
}
