using GastosApi.Logica;
using GastosApi.Models;
using Xunit;

namespace GastosApi.Tests;

public class GastoValidatorTests
{
    // Un gasto que cumple todas las reglas. Cada test le cambia UNA cosa,
    // así si falla se sabe exactamente qué regla se rompió.
    private static Gasto GastoValido() => new Gasto
    {
        Descripcion = "Almuerzo",
        Monto = 1500m,
        Categoria = "Comida"
    };

    [Fact]
    public void GastoCompleto_EsValido()
    {
        var resultado = GastoValidator.Validar(GastoValido());

        Assert.True(resultado.EsValido);
        Assert.Null(resultado.Error);
    }

    [Theory]
    [InlineData("")]            // vacía
    [InlineData("   ")]         // sólo espacios
    [InlineData("\t")]          // un tabulador
    public void DescripcionSinContenido_EsRechazada(string descripcion)
    {
        // Arrange
        var gasto = GastoValido();
        gasto.Descripcion = descripcion;

        // Act
        var resultado = GastoValidator.Validar(gasto);

        // Assert
        Assert.False(resultado.EsValido);
        Assert.Equal("La descripción es obligatoria.", resultado.Error);
    }

    [Fact]
    public void DescripcionDemasiadoLarga_ExplicaElLimiteEnElMensaje()
    {
        var gasto = GastoValido();
        gasto.Descripcion = new string('a', GastoValidator.LargoMaximo + 1);   // 101: uno más que el tope

        var resultado = GastoValidator.Validar(gasto);

        Assert.False(resultado.EsValido);
        Assert.Contains(GastoValidator.LargoMaximo.ToString(), resultado.Error);
    }

    [Fact]
    public void DescripcionEnElLimite_EsAceptada()
    {
        var gasto = GastoValido();
        gasto.Descripcion = new string('a', GastoValidator.LargoMaximo);       // 100: justo el tope

        var resultado = GastoValidator.Validar(gasto);

        Assert.True(resultado.EsValido);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-0.01)]
    public void MontoCeroONegativo_EsRechazado(double monto)
    {
        var gasto = GastoValido();
        gasto.Monto = (decimal)monto;

        var resultado = GastoValidator.Validar(gasto);

        Assert.False(resultado.EsValido);
        Assert.Equal("El monto tiene que ser mayor a cero.", resultado.Error);
    }

    [Fact]
    public void MontoMinimoPositivo_EsAceptado()
    {
        var gasto = GastoValido();
        gasto.Monto = 0.01m;                                                   // el borde: un centavo

        var resultado = GastoValidator.Validar(gasto);

        Assert.True(resultado.EsValido);
    }

    [Fact]
    public void CategoriaVacia_EsRechazada()
    {
        var gasto = GastoValido();
        gasto.Categoria = "  ";

        var resultado = GastoValidator.Validar(gasto);

        Assert.False(resultado.EsValido);
        Assert.Equal("La categoría es obligatoria.", resultado.Error);
    }
}
