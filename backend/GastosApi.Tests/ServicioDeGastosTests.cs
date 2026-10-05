using GastosApi.Logica;
using GastosApi.Models;
using Moq;
using Xunit;

namespace GastosApi.Tests;

public class ServicioDeGastosTests
{
    [Fact]
    public async Task CrearUnGastoValido_LoGuardaUnaSolaVez()
    {
        // Arrange: el impostor, en lugar del repositorio real (nada de Postgres)
        var repositorio = new Mock<IGastosRepositorio>();
        var servicio = new ServicioDeGastos(repositorio.Object);
        var gasto = new Gasto { Descripcion = "Almuerzo", Monto = 1500m, Categoria = "Comida" };

        // Act
        await servicio.CrearAsync(gasto);

        // Assert: no mira un valor devuelto — mira la INTERACCIÓN
        repositorio.Verify(r => r.AgregarAsync(gasto), Times.Once);
    }

    [Fact]
    public async Task CrearUnGastoInvalido_NoLoGuardaYExplicaElMotivo()
    {
        var repositorio = new Mock<IGastosRepositorio>();
        var servicio = new ServicioDeGastos(repositorio.Object);
        var gasto = new Gasto { Descripcion = "Almuerzo", Monto = 0m, Categoria = "Comida" };

        var error = await Assert.ThrowsAsync<ArgumentException>(() => servicio.CrearAsync(gasto));

        Assert.Equal("El monto tiene que ser mayor a cero.", error.Message);
        repositorio.Verify(r => r.AgregarAsync(It.IsAny<Gasto>()), Times.Never);
    }
}
