using GastosApi.Logica;
using Xunit;

namespace GastosApi.Tests;

public class FechasTests
{
    [Fact]
    public void FechaSinCargar_UsaLaFechaAlternativa()
    {
        // Arrange: un "ahora" fijo, para no depender del reloj (determinismo, §2.2)
        var ahora = new DateTime(2026, 9, 30, 12, 0, 0, DateTimeKind.Utc);

        // Act
        var resultado = Fechas.NormalizarAUtc(default, ahora);

        // Assert
        Assert.Equal(ahora, resultado);
    }

    [Fact]
    public void FechaCargada_SeMarcaComoUtcSinCambiarLaHora()
    {
        var fecha = new DateTime(2026, 8, 15, 10, 30, 0, DateTimeKind.Unspecified);
        var otra = new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        var resultado = Fechas.NormalizarAUtc(fecha, otra);

        Assert.Equal(DateTimeKind.Utc, resultado.Kind);
        Assert.Equal(new DateTime(2026, 8, 15, 10, 30, 0), resultado);
    }

    [Fact]
    public void MesValido_DevuelveInicioYFinDelMes()
    {
        var rango = Fechas.RangoDeMes("2026-08");

        Assert.NotNull(rango);
        Assert.Equal(new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc), rango.Value.Inicio);
        Assert.Equal(new DateTime(2026, 9, 1, 0, 0, 0, DateTimeKind.Utc), rango.Value.Fin);
    }

    [Fact]
    public void Diciembre_TerminaEnEneroDelAnioSiguiente()
    {
        var rango = Fechas.RangoDeMes("2026-12");

        Assert.NotNull(rango);
        Assert.Equal(new DateTime(2027, 1, 1, 0, 0, 0, DateTimeKind.Utc), rango.Value.Fin);
    }

    [Theory]
    [InlineData(null)]          // no vino el parámetro
    [InlineData("")]            // vino vacío
    [InlineData("hola")]        // no es una fecha
    [InlineData("2026-13")]     // mes que no existe
    public void MesInvalido_DevuelveNull(string? mes)
    {
        var rango = Fechas.RangoDeMes(mes);

        Assert.Null(rango);
    }
}
