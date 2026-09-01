Por qué Git no pudo resolver el conflicto solo — y qué habría tenido que pasar para que nunca apareciera?
 Las ramas A y B modificaron la misma línea del README y Git no tiene forma de saber cuál de las dos versiones
 es la correcta, ya que esto es una decision del autor de contenido.Para que nunca hubiera aparecido, 
 alguna de las dos ramas debería haber tocado una línea distinta, o haberse creado después de que la otra ya 
 estuviera mergeada.

Qué problemas encontraste y cómo los solucionaste. Los tropiezos bien contados valen más que un camino perfecto: son los que demuestran que entendiste.
Al crear una rama sin escribir un nombre, GitHub generó nombres automáticos en vez de la convención feature/<descripcion> 
pedida por la guía tuve que borrar esas ramas y rehacer el PR poniendo el nombre a mano. Esto me paso porque no scrollee
y no veia donde poner el nombre de la rama. Gh no se reconocía como comando después de instalarlo con winget porque la terminal ya estaba 
  abierta antes de la instalación y esto lo resolvi abriendo una terminal nueva.

Declaración de uso de IA: qué partes hiciste con ayuda de inteligencia artificial y cómo verificaste lo que te devolvió (§ Uso de IA del enunciado).
Usé Claude como asistente para entender los conceptos de la guía y resolver dudas puntuales sobre la interfaz 
de GitHub (dónde encontrar botones, cómo interpretar mensajes de error, cómo resolver el conflicto de merge). 
Verifiqué cada paso ejecutándolo yo misma y comparando el resultado con lo que pedía la guía del TP antes de continuar.

## TP2 — Contenedores

### Elección de la app del semestre
Elegi una app de gastos porque me resulta bastante interpretable, entiendo el dominio y no es muy complicada como requiere el TP. Es una app desarrollada principalmente por Claude. Además, se le puede escribir tests, buildea y corre local.
feat: app gestor de gastos (backend .NET 8 + frontend React/Vite)

- Backend: minimal API + EF Core + PostgreSQL, entidad Gasto,
  CRUD completo, endpoint de total y de resumen por categoría
- Frontend: React + Vite, 2 pestañas (Gastos y Resumen),
  filtros, formato de moneda y diseño responsive.

### Decisiones de contenerización
Imágenes base:
- Backend: mcr.microsoft.com/dotnet/sdk:8.0 (etapa build, compila) +
  mcr.microsoft.com/dotnet/aspnet:8.0 (etapa final, solo ejecuta).
- Frontend: node:22-alpine (etapa build, compila con Vite) + nginx:alpine
  (etapa final, sirve los estáticos).
- Base de datos: postgres:16-alpine.

Por qué multi-stage: separa "compilar" de "ejecutar". El SDK completo pesa
850MB; mi imagen final (runtime + mi app) pesa 225MB — casi 4 veces menos.
El compilador y las herramientas de build no viajan a producción, lo que
además reduce la superficie de ataque (menos cosas que un atacante podría
aprovechar si entra al contenedor).

Qué persiste y qué no: solo la base de datos necesita persistencia, así que
solo ella tiene volumen (db_data:/var/lib/postgresql/data). Comprobé que:
- `docker compose down` + `up` conserva los datos (el volumen sobrevive).
- `docker compose down -v` + `up` los borra (se destruye también el volumen).
Los contenedores de backend y frontend son stateless (no guardan nada
importante en su propio filesystem), así que no necesitan volumen.

Comunicación entre servicios: el backend se conecta a la base por el nombre
del servicio en la red de compose (Host=db), no por IP ni localhost. El
frontend llama a rutas relativas (/api/...) y es nginx quien las reenvía al
backend (http://backend:8080) — así evito CORS y la misma imagen del
frontend sirve en cualquier entorno.

Registry: elegí ghcr.io porque ya tengo la cuenta de GitHub del TP1 y las
imágenes quedan asociadas a mi mismo repo.

### Problemas encontrados y cómo los resolví
Tuve varias trabas al resolver este TP, 
- Conflicto de puertos: mi app y la práctica del sample usaban los mismos
  puertos (8080, 5173, 5432) por seguir la misma guía. Lo resolví entendiendo
  que un puerto lo ocupa el proceso que está corriendo en ese momento, no "la
  app": alcanza con parar los contenedores/procesos de uno para liberarle el
  puerto al otro.

- Docker no se reconocía en la terminal después de instalarlo. La terminal ya
  estaba abierta antes de la instalación y no se actualizó su variable PATH.
  Lo resolví abriendo una terminal nueva (o reiniciando VS Code).

- `docker images <nombre>` devolvía vacío para las imágenes base del
  Dockerfile (sdk/aspnet), aunque sí existían. Es una rareza de esta versión
  de Docker Desktop con el filtro por nombre exacto.

- Mi rama de git se creó antes de que `decisiones.md`/`evidencias.md` se
  agregaran a `main`, así que mi rama no los tenía. Lo resolví con
  `git merge origin/main` antes de editar los archivos reales (mismo
  concepto de ramas divergentes que ya había visto en el TP1).


### Declaración de uso de IA
La app (backend .NET 8 + frontend React/Vite) fue desarrollada
principalmente con asistencia de Claude, que me explicó cada decisión de
diseño (por qué minimal API, por qué decimal para el monto, por qué rutas
relativas, etc.).
La dockerización (Dockerfiles, nginx.conf, docker-compose.yml) la ejecuté 
a mano yo misma en mi terminal de los comandos de Docker y de Git, viendo 
cada resultado antes de seguir.
