# Proyecto IngSoft3 - versión A
Desarrollo de Tp 1, materia ingeniería de software 3 por Agostina Blasón.
## Instalación

git clone https://github.com/Agostina19/ingsoft3-tp01.git




## TP2 — Contenedores

App: gestor de gastos personales (CRUD + total gastado). Backend .NET 8
(minimal API + EF Core) + PostgreSQL, frontend React + Vite. Todo orquestado
con Docker Compose.

### Requisitos

- [Docker Desktop](https://docs.docker.com/get-docker/) instalado y corriendo.
  No hace falta instalar .NET ni Node: todo se compila dentro de los
  contenedores.

### Ejecutar en una máquina limpia con Docker

Desde la raíz del proyecto:

```bash
cp .env.example .env
```

Editá `.env` y poné la contraseña que quieras para la base de datos.

#### Opción 1: construir las imágenes desde el código

Usa `docker-compose.yml`. Docker construye las imágenes de frontend y
backend localmente, y descarga la de PostgreSQL.

```bash
docker compose up -d --build
docker compose ps
```

#### Opción 2: usar las imágenes publicadas en el registry

Usa `docker-compose.registry.yml`. Docker **descarga** las imágenes ya
publicadas en GitHub Container Registry en vez de construirlas.

```bash
docker compose -f docker-compose.registry.yml up -d
```

Abrir la aplicación:

```text
http://localhost:3000
```

API / chequeo de salud:

```text
http://localhost:8080/health
```

Para bajar los contenedores (conserva los datos):

```bash
docker compose down
```

Para bajar los contenedores y borrar también los datos de la base:

```bash
docker compose down -v
```

### Estructura del proyecto

```
backend/                     API .NET 8 (minimal API + EF Core + PostgreSQL)
frontend/                    SPA React + Vite
docker-compose.yml           orquesta los 3 servicios, construyendo localmente
docker-compose.registry.yml  igual, pero usando las imágenes publicadas
.env.example                 plantilla de variables de entorno (.env no se commitea)
```

### Funcionalidad incluida

- CRUD completo de gastos (alta, edición, borrado, listado).
- Filtro por categoría y búsqueda por descripción.
- Total gastado y resumen por categoría, con filtro por mes.
