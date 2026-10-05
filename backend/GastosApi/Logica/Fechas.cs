namespace GastosApi.Logica;

// Reglas de fechas de la app, fuera de Program.cs para poder testearlas.
public static class Fechas
{
    // Si la fecha no vino (default), usa "siNoViene"; si vino, la marca como UTC
    // (Npgsql guarda timestamptz y exige Kind=Utc).
    // "siNoViene" entra por parámetro: así el test no depende del reloj.
    public static DateTime NormalizarAUtc(DateTime fecha, DateTime siNoViene) =>
        fecha == default ? siNoViene : DateTime.SpecifyKind(fecha, DateTimeKind.Utc);

    // De "yyyy-MM" (ej "2026-08") arma el rango [inicio de mes, inicio del mes siguiente).
    // Si el mes no vino o es inválido, devuelve null (= no filtrar).
    public static (DateTime Inicio, DateTime Fin)? RangoDeMes(string? mes)
    {
        if (string.IsNullOrEmpty(mes) || !DateTime.TryParse($"{mes}-01", out var inicio))
            return null;

        inicio = DateTime.SpecifyKind(inicio, DateTimeKind.Utc);
        return (inicio, inicio.AddMonths(1));
    }
}
