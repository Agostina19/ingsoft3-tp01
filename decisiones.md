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


## TP3 — Planificación y trazabilidad

### Duración del sprint
Elegí sprints de 2 semanas. Es la duración más común en la industria, y me
pareció la que mejor se adapta a trabajar sola: dos semanas me dan tiempo
suficiente para completar tareas y ver avances reales, sin quedar atrapada
replanificando todo cada semana (como pasaría con sprints de 1 semana)

### Límite de trabajo en progreso (WIP)
Configuré el límite en 2 para la columna "In Progress". Sigo la regla del
enunciado: cantidad de personas + 1; trabajando sola, son 2. El "+1" me da
margen para tener algo esperando (por ejemplo, un PR en revisión) sin
frenarme del todo si quiero avanzar en otra cosa.

### Diagnóstico de la historia mal escrita
Está mal escrita porque describe una acción técnica, no un valor para
alguien: ningún usuario pide "una tabla", eso es un paso de implementación.
Tampoco tiene un beneficio real detrás — "para guardar los datos" solo
repite lo mismo que ya dice el "quiero", no explica para qué le sirve a
alguien. La reescribiría enfocándola en la capacidad que esa tabla permite,
por ejemplo: "Como usuario quiero registrarme con usuario y contraseña para
poder acceder a mi cuenta". Ahí sí hay un rol, algo que se puede probar, y
un motivo real — y "crear la tabla usuarios" queda como una tarea técnica
adentro de esa historia, no como la historia en sí.


### Problemas encontrados y cómo los resolví
- No tenía claro si la vinculación de sub-issues y el board tenían un orden
  obligatorio entre sí; pero depsues entendí que son configuraciones independientes,
  aunque el límite de WIP sí necesita que exista la vista Board primero.
- Al crear el archivo del workflow (ci.yml) desde la web, no tenía claro que
  estaba editando sobre main — GitHub no dejó commitear directo (rama
  protegida del TP1) y me ofreció crear una rama nueva + PR automáticamente.

### Declaración de uso de IA
Usé Claude para entender los conceptos del TP (jerarquía épica/historia/
tarea, sprint, WIP limit, trazabilidad)
Todos los comandos y clics los ejecuté yo misma en mi cuenta de GitHub, sin
que la IA tocara nada directamente. Verifiqué cada paso mirando el
resultado real en GitHub (la jerarquía navegable, el board, y que el PR
cerrara la tarea sola) antes de seguir.

## TP4 — CI: Pipelines as Code

### Estructura elegida del pipeline
Dos jobs separados, build-backend y build-frontend, uno por cada Dockerfile
del TP2. Van en paralelo porque son independientes entre sí: nada de lo que
hace uno afecta al otro, así que no tiene sentido esperarlos en serie.
Cada uno corre en su propia máquina limpia.

### Qué cachea el pipeline
Se cachean las capas de la imagen de Docker (vía type=gha, un scope
distinto por job para que no se pisen entre sí). Se reutilizan las capas
que no dependen de nada que haya cambiado: el restore de paquetes, el
COPY del código si no cambió, etc. Si el cache desaparece (la plataforma
lo puede desalojar en cualquier momento), el pipeline igual funciona:
solo construye todo de cero, más lento. No es una dependencia, es una
optimización.

### Por qué construye con el Dockerfile en vez de compilar por su cuenta
Para no tener dos definiciones de build que puedan diferir entre si. Si el
workflow compilara con dotnet/npm por su lado, estaría verificando algo
distinto de lo que después se termina desplegando. Usando el mismo
Dockerfile del TP2, lo que el pipeline verifica es exactamente lo que se
va a correr en producción.

### Problemas encontrados y cómo los resolví
- Al reemplazar el ci.yml del TP3 tuve dudas sobre si perdía algo de esa
  entrega; no fue así: ese archivo era un esqueleto a propósito, y el
  trabajo real del TP3 (issues, sprint, PR) queda intacto en el historial.
- Al ver la primera corrida con cache, no relacioné el tiempo con el
  cache funcionando -- la evidencia real es la palabra CACHED en el log,
  no que la corrida sea más rápida (a veces no lo es).
- Confundí en qué rama estaba parada al crear el PR de relleno; lo resolví
  chequeando con git branch --show-current antes de seguir.

### Declaración de uso de IA
Usé Claude para entender los conceptos (jobs en paralelo, cache de capas,
el gate del PR) y para que me explicara los comandos.
Todos los comandos de git y gh los ejecuté yo misma en mi terminal.
Verifiqué cada paso mirando el resultado real en GitHub Actions: los
checks en verde/rojo, la palabra CACHED en el log, y el PR bloqueado de
verdad cuando rompí el build a propósito.
