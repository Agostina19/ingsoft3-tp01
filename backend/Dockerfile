# ---- Etapa 1: build (imagen con SDK) ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Se copian el .sln y el .csproj ANTES del resto del código: así, si solo
# cambia una línea de código, Docker no vuelve a descargar las dependencias
# (usa la capa cacheada del restore).
COPY Backend.sln .
COPY GastosApi/GastosApi.csproj GastosApi/
COPY GastosApi.Tests/GastosApi.Tests.csproj GastosApi.Tests/
RUN dotnet restore Backend.sln

COPY . .
RUN dotnet publish GastosApi/GastosApi.csproj -c Release -o /app/publish

# ---- Etapa 2: tests (parte del build, con el SDK adentro) ----
FROM build AS test
ENTRYPOINT ["dotnet", "test", "Backend.sln", \
            "/p:CollectCoverage=true", "/p:Threshold=80", "/p:ThresholdType=line%2cbranch", \
            "/p:Exclude=[GastosApi]Program*%2c[GastosApi]GastosApi.Data.*%2c[GastosApi]GastosApi.Models.*", \
            "--logger", "trx;LogFileName=tests.trx", \
            "--results-directory", "/out"]


# ---- Etapa 3: runtime (imagen mínima, sin SDK) ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "GastosApi.dll"]
