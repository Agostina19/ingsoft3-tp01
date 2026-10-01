using GastosApi.Models;

namespace GastosApi.Logica;

public class ServicioDeGastos
{
    private readonly IGastosRepositorio _repositorio;

    // La dependencia ENTRA desde afuera (inyección de dependencias):
    // la app le pasa el repositorio real; el test, un impostor.
    public ServicioDeGastos(IGastosRepositorio repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<Gasto> CrearAsync(Gasto gasto)
    {
        var validacion = GastoValidator.Validar(gasto);          // ← la regla SIGUE acá
        if (!validacion.EsValido) throw new ArgumentException(validacion.Error);

        gasto.Id = 0;                                            // el Id lo genera la base
        gasto.Fecha = Fechas.NormalizarAUtc(gasto.Fecha, DateTime.UtcNow);

        await _repositorio.AgregarAsync(gasto);
        return gasto;
    }
}
