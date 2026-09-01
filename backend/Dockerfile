# ---- Etapa 1: build (imagen con SDK) ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Se copian el .sln y el .csproj ANTES del resto del código: así, si solo
# cambia una línea de código, Docker no vuelve a descargar las dependencias
# (usa la capa cacheada del restore).
COPY Backend.sln .
COPY GastosApi/GastosApi.csproj GastosApi/
RUN dotnet restore Backend.sln

COPY . .
RUN dotnet publish GastosApi/GastosApi.csproj -c Release -o /app/publish

# ---- Etapa 2: runtime (imagen mínima, sin SDK) ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "GastosApi.dll"]