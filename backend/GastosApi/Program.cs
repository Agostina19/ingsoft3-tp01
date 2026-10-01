using GastosApi.Data;
using GastosApi.Models;
using Microsoft.EntityFrameworkCore;
using GastosApi.Logica;


var builder = WebApplication.CreateBuilder(args);

// ── Configuración de la base ────────────────────────────────────────────────
// La connection string sale de la configuración con la clave "Default".
// En local se lee de appsettings.json (Host=localhost). En contenedor se PISA
// con la variable de entorno ConnectionStrings__Default (Host=db en compose).
// Misma imagen, distinta config según dónde corra: ese es el principio del TP.
var connectionString = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<GastosContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IGastosRepositorio, GastosRepositorio>();
builder.Services.AddScoped<ServicioDeGastos>();

var app = builder.Build();

// ── Crear el schema al arrancar ─────────────────────────────────────────────
// El Postgres del contenedor nace VACÍO. EnsureCreated crea la tabla "Gastos"
// si todavía no existe, así no hay que correr un script de schema a mano.
// (En un proyecto más grande se usarían Migrations; para este CRUD alcanza.)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GastosContext>();
    db.Database.EnsureCreated();
}

// ── Endpoint de salud ───────────────────────────────────────────────────────
// Lo usa el healthcheck de Docker y sirve para saber "si esto contesta, anda".
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// ── CRUD de gastos ──────────────────────────────────────────────────────────

// LISTAR todos (más nuevo primero).
app.MapGet("/api/gastos", async (GastosContext db) =>
    await db.Gastos.OrderByDescending(g => g.Fecha).ToListAsync());

// TOTAL gastado. Va ANTES del {id:int} igual no choca: "total" no es un int,
// así que la ruta con restricción :int nunca lo captura.
app.MapGet("/api/gastos/total", async (GastosContext db) =>
{
    var total = await db.Gastos.SumAsync(g => g.Monto);
    return Results.Ok(new { total });
});

// RESUMEN por categoría. GroupBy de EF Core -> GROUP BY en SQL: la base hace
// la suma, no traemos todos los gastos para sumarlos en memoria.
// Parámetro opcional mes ("yyyy-MM", ej "2026-08"): si viene, filtra ese mes
// con un WHERE sobre la fecha (rango [inicio de mes, inicio del mes siguiente)).
app.MapGet("/api/gastos/resumen", async (string? mes, GastosContext db) =>
{
    var query = db.Gastos.AsQueryable();

    var rango = Fechas.RangoDeMes(mes);
    if (rango is not null)
    {
        var (inicio, fin) = rango.Value;
        query = query.Where(g => g.Fecha >= inicio && g.Fecha < fin);
    }


    var porCategoria = await query
        .GroupBy(g => g.Categoria)
        .Select(grupo => new { categoria = grupo.Key, total = grupo.Sum(g => g.Monto) })
        .OrderByDescending(x => x.total)
        .ToListAsync();

    var total = porCategoria.Sum(x => x.total);
    var cantidad = porCategoria.Count == 0 ? 0 : await query.CountAsync();
    return Results.Ok(new { total, cantidad, porCategoria });
});

// OBTENER uno por id. Devuelve 404 si no existe.
app.MapGet("/api/gastos/{id:int}", async (int id, GastosContext db) =>
    await db.Gastos.FindAsync(id) is Gasto gasto
        ? Results.Ok(gasto)
        : Results.NotFound());

// CREAR. La lógica (validar, normalizar fecha, guardar) vive en ServicioDeGastos;
// el endpoint sólo pide, delega y responde.
app.MapPost("/api/gastos", async (Gasto gasto, ServicioDeGastos servicio) =>
{
    try
    {
        var creado = await servicio.CrearAsync(gasto);
        // 201 Created + la URL del recurso nuevo, como manda REST.
        return Results.Created($"/api/gastos/{creado.Id}", creado);
    }
    catch (ArgumentException e)
    {
        return Results.BadRequest(e.Message);
    }
});


// ACTUALIZAR. 404 si no existe; si existe, se copian los campos editables.
app.MapPut("/api/gastos/{id:int}", async (int id, Gasto cambios, GastosContext db) =>
{
    var validacion = GastoValidator.Validar(cambios);
    if (!validacion.EsValido) return Results.BadRequest(validacion.Error);

    var gasto = await db.Gastos.FindAsync(id);
    if (gasto is null) return Results.NotFound();

    gasto.Descripcion = cambios.Descripcion;
    gasto.Monto = cambios.Monto;
    gasto.Categoria = cambios.Categoria;
    gasto.Fecha = Fechas.NormalizarAUtc(cambios.Fecha, gasto.Fecha);

    await db.SaveChangesAsync();
    return Results.Ok(gasto);
});

// BORRAR. 404 si no existe; 204 (sin contenido) si se borró.
app.MapDelete("/api/gastos/{id:int}", async (int id, GastosContext db) =>
{
    var gasto = await db.Gastos.FindAsync(id);
    if (gasto is null) return Results.NotFound();

    db.Gastos.Remove(gasto);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();


// TODO: endpoint de salud
