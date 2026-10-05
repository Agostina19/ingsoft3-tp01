using GastosApi.Models;

namespace GastosApi.Logica;

// Reglas de negocio de un gasto. Es lógica pura: recibe un gasto y
// devuelve un resultado, sin tocar la base ni la red. Por eso se testea
// sin mocks ni base de datos.
public static class GastoValidator
{
    public const int LargoMaximo = 100;

    public record Resultado(bool EsValido, string? Error);

    public static Resultado Validar(Gasto gasto)
    {
        if (string.IsNullOrWhiteSpace(gasto.Descripcion))
            return new Resultado(false, "La descripción es obligatoria.");

        if (gasto.Descripcion.Trim().Length > LargoMaximo)
            return new Resultado(false, $"La descripción no puede superar los {LargoMaximo} caracteres.");

        if (gasto.Monto <= 0)
            return new Resultado(false, "El monto tiene que ser mayor a cero.");

        if (string.IsNullOrWhiteSpace(gasto.Categoria))
            return new Resultado(false, "La categoría es obligatoria.");

        return new Resultado(true, null);
    }
}
