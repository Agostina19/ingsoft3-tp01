## Enlaces del TP7

**(a) Paquetes públicos** (etiqueta del commit que está en PROD, `69c24d6`):
- Backend: https://github.com/Agostina19/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-backend
  - `ghcr.io/agostina19/ingsoft3-tp01-backend:sha-69c24d6c4688dd797500994bcafdf3351b420337`
- Frontend: https://github.com/Agostina19/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-frontend
  - `ghcr.io/agostina19/ingsoft3-tp01-frontend:sha-69c24d6c4688dd797500994bcafdf3351b420337`

**(b) Corrida con integración VERDE y e2e ROJA:**
- Commit que rompió la app (PR #31): https://github.com/Agostina19/ingsoft3-tp01/commit/942a35473c95459f88294f3c69cf2a59d088a131
- Corrida: https://github.com/Agostina19/ingsoft3-tp01/actions/runs/39849490579
- Reporte de integración (verde): https://github.com/Agostina19/ingsoft3-tp01/actions/runs/39849490579/artifacts/12456647758
- Reporte e2e (rojo): https://github.com/Agostina19/ingsoft3-tp01/actions/runs/39849490579/artifacts/12456817865

- Los dos reportes vencen el 29/10 (el workflow los guarda 7 días). Tengo descargadas copias. (c/Users/Agostina/Documents/tp7-reportes)

**(c) Corrida completa en verde hasta PROD (el arreglo, PR #32):**
https://github.com/Agostina19/ingsoft3-tp01/actions/runs/39876520571

**(d) Entornos:**
- QA: front https://gastos-front-qa-7ph4.onrender.com · API https://gastos-api-qa-1sjb.onrender.com
- PROD: front https://gastos-front-prod-267c.onrender.com · API https://gastos-api-prod-zf3e.onrender.com

---


## Enlaces de TP6

**(a) Paquetes públicos del registry** (etiquetados con el commit del merge del PR #26, `7e3bf50`):
- Backend: https://github.com/Agostina19/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-backend
  - `docker pull ghcr.io/agostina19/ingsoft3-tp01-backend:sha-7e3bf50bacb2600a25a2857c0d1b6bb26a220a01`
- Frontend: https://github.com/Agostina19/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-frontend
  - `docker pull ghcr.io/agostina19/ingsoft3-tp01-frontend:sha-7e3bf50bacb2600a25a2857c0d1b6bb26a220a01`

**(b) La cadena de la Tarea 1:**
- Job del PR, con «Entrar al registry» salteado: https://github.com/Agostina19/ingsoft3-tp01/actions/runs/38190248956/job/114621252019?pr=23
- Corrida de `main`, con la publicación como último paso: https://github.com/Agostina19/ingsoft3-tp01/actions/runs/38190612658/job/114622382181

**(c) Entornos:**
- QA: front https://gastos-front-qa-7ph4.onrender.com · API https://gastos-api-qa-1sjb.onrender.com
- PROD: front https://gastos-front-prod-267c.onrender.com · API https://gastos-api-prod-zf3e.onrender.com

---

## TP 1 - Configuracion de GIT y merge
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


## TP5 — Testing, coverage y quality gate

### Qué lógica testeé y por qué esa
Elegí las reglas que, si fallan, me rompen los números de la app, que es
lo único que importa en un gestor de gastos:
- Validación de un gasto (`GastoValidator` en el back, `validarGasto` en
  el front): descripción obligatoria y de hasta 100 caracteres, monto mayor
  a cero y categoría obligatoria. Si entra un gasto con monto 0 o negativo,
  el total y el resumen por categoría quedan mal y nadie se da cuenta.
- Fechas (`Fechas`): pasar la fecha a UTC y armar el rango de un mes para
  el resumen. Si esto falla, hay gastos que no aparecen en el mes que
  corresponde (diciembre es el caso raro, porque el mes siguiente es de
  otro año).
- Crear un gasto (`ServicioDeGastos`): que valide antes de guardar y que
  guarde una sola vez. Si guardara dos veces, el gasto queda duplicado y
  el total se infla.
- En el front también: el filtro de la lista (`filtrarGastos`), el pedido
  del resumen a la API (`obtenerResumen`) y la antigüedad de un gasto
  (`antiguedadDe`, que entró con el PR del gate).

Backend: 14 métodos de test sobre 7 reglas (21 ejecuciones, porque cada
dato de un `[Theory]` corre aparte). Tiene parametrizados
(`DescripcionSinContenido_EsRechazada`, `MontoCeroONegativo_EsRechazado`,
`MesInvalido_DevuelveNull`), casos de error
(`DescripcionDemasiadoLarga_ExplicaElLimiteEnElMensaje`,
`CrearUnGastoInvalido_NoLoGuardaYExplicaElMotivo`) y bordes
(`DescripcionEnElLimite_EsAceptada` con 100 caracteres justos,
`MontoMinimoPositivo_EsAceptado` con 0,01 y
`Diciembre_TerminaEnEneroDelAnioSiguiente`). Los bordes los puse a
propósito: si alguien cambia un `>` por `>=`, son los que se ponen en rojo.

Frontend: 25 tests en `gastos.test.js` y `antiguedad.test.js`, sin DOM,
con `it.each` para los parametrizados, casos de error con su mensaje y
`vi.fn()` para el mock.

Uso el mismo stack que la cátedra: xUnit + Moq + coverlet + ReportGenerator
en el back, y vitest + `vi.fn()` + `@vitest/coverage-v8` en el front.

### Refactor para poder mockear (y reglas que agregué)
Backend: antes, el POST guardaba directo con `GastosContext` adentro del
lambda de `Program.cs`. No había ninguna clase que un test pudiera llamar,
y aunque la sacara, dependía de la clase concreta de EF: Moq no la puede
reemplazar, y probarla me obligaba a tener Postgres levantado. Además el
POST no validaba nada: se podía guardar un gasto con monto negativo.
Lo que cambié:
- Creé la interfaz `IGastosRepositorio` (solo `AgregarAsync`) y su
  implementación real `GastosRepositorio`, que guarda con EF.
- `ServicioDeGastos` recibe el repositorio por el constructor, valida con
  `GastoValidator` y recién después guarda.
- Registré los dos en `Program.cs` con `AddScoped`. El endpoint ahora
  solo llama al servicio y devuelve 201 o 400.
- Las reglas de `GastoValidator` no existían: las agregué yo, y el PUT
  también valida ahora. Lo de fechas lo saqué de los endpoints a `Fechas`.

El test `CrearUnGastoValido_LoGuardaUnaSolaVez` usa un
`Mock<IGastosRepositorio>` y verifica con `Times.Once` que se llamó a
`AgregarAsync`. Es un mock y no un stub porque el assert no mira lo que
devuelve el método, mira cómo se usó la dependencia. El otro test del
servicio verifica con `Times.Never` que un gasto inválido no se guarda.

Frontend: `cargarResumen` hacía el `fetch` directo dentro de `App.jsx`.
Lo saqué a `obtenerResumen(mes, traer)` en `src/lib/gastos.js`, que
recibe el cliente por parámetro. La app le pasa `traerJson`
(`src/api/cliente.js`, el fetch real) y el test le pasa un `vi.fn()`. En
un test lo uso como stub (solo contesta datos y miro lo devuelto) y en
otro como mock (`toHaveBeenCalledWith` con la URL del mes).

### Umbral de cobertura
80 % en líneas y en ramas, en los dos lados:
- Back: `coverlet.msbuild` en el `ENTRYPOINT` de la etapa de tests, con
  `Threshold=80` y `ThresholdType=line,branch` (escrito con `%2c`).
- Front: `thresholds: { lines: 80, branches: 80 }` en `vite.config.js`.

Hoy mido: backend 100 % de líneas (31/31) y 100 % de ramas (16/16);
frontend 100 % de líneas y 100 % de ramas.

Por qué 80 y no 100: mi código medido es chico y cada línea pesa mucho.
Con 100, cualquier línea defensiva que no tenga sentido testear me
bloquearía el merge y terminaría escribiendo tests para cumplir el número.
Con 80 tengo algo de margen, pero si entra una función nueva sin tests me
frena: lo comprobé, una función sin tests (`antiguedadDe`, 10 líneas
medibles) me bajó el front a 61,53 %.
Puse también ramas porque con líneas solas un `if` recorrido por un
solo lado ya cuenta como cubierto. En el back tengo un solo ensamblado
medido (`GastosApi`), así que da lo mismo si coverlet evalúa por módulo o por total.


Para subirlo: subir el número no me suma mucho, porque ya estoy en 100. Lo
que haría falta es medir más código: tests de componentes para `App.jsx`
(necesitan DOM) y sacar de `Program.cs` lo que queda en los endpoints (los
404 del PUT y del DELETE, el armado del resumen) para poder testearlo.

Una aclaración: el umbral del back nunca lo vi en rojo en el pipeline,
porque siempre dio 100 %. El freno que demostré es el del front.

### Qué dejé afuera de la cuenta
Backend (el mismo recorte en el umbral y en el reporte de ReportGenerator,
así los dos números miden lo mismo):
- `Program`: el arranque, el registro de servicios y los endpoints. Antes
  de excluirlo saqué las reglas (validación y fechas) a `Logica`, porque
  si no estaría excluyendo mi propia lógica. Lo que queda ahí es HTTP y
  consultas de EF.
- `GastosApi.Data`: `GastosContext` y `GastosRepositorio`. Es la
  configuración de EF y el guardado en Postgres; probar eso es un test de
  integración con una base real, no un unit test.
- `GastosApi.Models`: `Gasto`, que solo tiene propiedades.
- No tengo código generado (no uso migraciones, uso `EnsureCreated`).

Frontend: con `include: ['src/lib/**']` solo cuenta la lógica pura. Queda
afuera `App.jsx` (la pantalla en React, necesita DOM), `main.jsx` (el
arranque) y `api/cliente.js` (el fetch real a la red). El riesgo de
`include` es que un archivo de lógica nuevo fuera de `lib/` no se mediría;
por eso la regla que sigo es que la lógica va en `lib/`.

Revisé que el filtro no se comiera de más: coverlet y ReportGenerator dan
el mismo número, y el reporte muestra las tres clases de `Logica`
(`Fechas`, `GastoValidator`, `ServicioDeGastos`).

### Por qué coverage alto no garantiza calidad
Un ejemplo con mi código: si escribo un test que llama a
`GastoValidator.Validar` con cinco gastos, uno por camino, y no pongo
ningún Assert, la clase queda en 100 % de líneas y de ramas. Si después
alguien cambia `Monto <= 0` por `Monto < 0`, ese test sigue verde. En mi
suite lo detecta `MontoCeroONegativo_EsRechazado`, por el dato 0.

Y uno real que tengo hoy: `antiguedadDe` está al 100 % de líneas y ramas,
pero si le paso `{ fecha: 'hola' }` devuelve `'viejo'`. La fecha inválida
da NaN, todas las comparaciones dan falso y cae en el último return.
Ningún test lo ve, y el número dice 100 %.

### Ejercicio del camino sin cubrir
- Línea: `frontend/src/lib/montos.js`, línea 5, `if (!(valor > 0))`, en
  el PR #21. En el reporte toda la función aparece en rojo porque ningún
  test la llama, y en la tabla las ramas del front bajaron a 78,37 %:
  los caminos de sus `if` cuentan como no recorridos.
- Entradas que los recorren: `rangoDeMonto(0)` (o `'abc'`) entra al `if`
  y devuelve `'invalido'`; `rangoDeMonto(500)` sigue de largo y devuelve
  `'chico'`. También haría falta el borde `rangoDeMonto(1000)`, que tiene
  que dar `'mediano'` y no `'chico'`: es el que se pone en rojo si alguien
  cambia `<` por `<=`.
- Qué decidí: no agregarlo, a propósito. Ese PR es el freno que tiene que
  quedar abierto y en rojo hasta la defensa; si lo testeo, deja de probar
  que el gate funciona.

Antes había elegido la línea 18 de `gastos.js`
(`if (!categoria || !categoria.trim())`), pensando que el caso
`categoria = null` era una rama sin cubrir. Lo comprobé sacando los tests
de `null` y de `''`: el reporte siguió en 100 % de ramas. El medidor que
uso (v8) no cuenta el corto circuito del `||` como un camino aparte. Es
otro ejemplo de que el número no ve todo: el test de `null` sigue
teniendo sentido aunque la cobertura no lo pida.


### Mi Pull Request bloqueado
En el PR #20 agregué `antiguedadDe`, una función con 5 caminos, sin tests.
Compiló, `build-backend` quedó verde y los 20 tests del front pasaron,
pero `build-frontend` quedó rojo: líneas 61,53 % y ramas 62,06 % contra un
umbral de 80 (vitest 5.0.3, frenó en las dos métricas). Como
`build-frontend` es required check de `main`, el botón de merge quedó
gris. Lo arreglé con `antiguedad.test.js`: 5 tests, uno por camino, con
`ahora` fijo por parámetro para que no dependan del reloj. Volvió a 100 %
en las dos métricas, quedó verde y lo mergeé.

La diferencia con el freno del TP4: allá frenaba porque algo no compilaba.
Acá compila, todos los tests pasan, y frena igual por un número que elegí
yo. Lo que este freno sigue dejando pasar: tests sin asserts y requisitos
mal entendidos (el caso de la fecha inválida de arriba).

El PR #21 queda abierto y en rojo hasta la defensa: agrega `rangoDeMonto`
sin tests y baja el front a 72,22 % de líneas y 78,37 % de ramas.

| Qué prueba | Link |
|---|---|
| Resumen de coverage (back y front) y reportes descargables | https://github.com/Agostina19/ingsoft3-tp01/actions/runs/37664618921 |
| Corrida roja por umbral, con el número en el log | https://github.com/Agostina19/ingsoft3-tp01/actions/runs/37551926806 |
| Secuencia rojo → tests → verde → merge | https://github.com/Agostina19/ingsoft3-tp01/pull/20 |
| Freno vigente, abierto y en rojo | https://github.com/Agostina19/ingsoft3-tp01/pull/21 |
| Umbral del backend con coverlet.msbuild | https://github.com/Agostina19/ingsoft3-tp01/pull/19 |
| Suite, coverage en el pipeline y umbral del front | https://github.com/Agostina19/ingsoft3-tp01/pull/18 |

### Problemas encontrados y cómo los resolví
- El backend me dio 100 % de líneas y de ramas, y me pareció sospechoso:
  podía ser que el filtro de exclusión se estuviera comiendo todo. Lo
  descarté comparando la tabla de coverlet con el reporte de
  ReportGenerator: dan lo mismo y las tres clases de `Logica` están
  adentro.
- Al abrir el PR del umbral del backend buscaba los checks `build-backend`
  y `build-frontend` en la pantalla de "Open a pull request" y no
  aparecían. Es porque los checks arrancan recién cuando el PR ya está
  creado; después de crearlo aparecieron, con la etiqueta Required.
- Tuve la duda de si en este TP había que romper el backend a propósito,
  como en el TP4. No hace falta: en el TP4 el back se rompía por
  compilación, y acá alcanza con que uno de los dos jobs quede rojo por
  cobertura. En mi caso fue el del front.


### Declaración de uso de IA
Usé Claude para entender los conceptos (AAA, mock vs stub, line vs branch
coverage, quality gate), para el código de los tests y del refactor. 
Los comandos de git, dotnet, npm y docker los ejecuté yo en mi terminal, y 
los PR los abrí y mergeé yo.
Verifiqué corriendo los tests en mi máquina antes de cada push, mirando
los checks en rojo y en verde en Actions y leyendo cada assert para saber
qué comprueba. Casos que sé que no están cubiertos: fechas inválidas o
futuras en `antiguedadDe`, los endpoints de `Program.cs` (404, PUT,
DELETE) y `GastosRepositorio`, que necesita una base real.



## TP6 — Continuous Delivery: QA automático, PROD con aprobación

### Por qué la imagen se publica sólo con la verificación en verde
El pipeline publica las imágenes en ghcr.io sólo desde `main` y como **último paso** del mismo job
que corre los tests. Son tres eslabones encadenados: (1) nada entra a `main` sin los checks en verde
(required checks del TP4/TP5), (2) sólo `main` publica (en un PR el login al registry se saltea y el
`push` es `false`), y (3) si un test falla, el job se corta antes de llegar al paso que publica.
Así, una imagen `sha-<commit>` en el registry significa "este commit pasó la verificación". Si se
publicara igual con los tests en rojo, el registry dejaría de significar eso: habría imágenes
rotas mezcladas con las buenas y no habría forma de distinguirlas.
Lo que esto **no** garantiza: alguien con permisos podría hacer un `docker push` a mano con el mismo
tag. Para atarlo de verdad haría falta desplegar por **digest** (el hash del contenido de la imagen),
no por tag.

### Continuous Delivery vs Continuous Deployment
Implementé **Continuous Delivery**: QA se despliega solo después de cada merge, pero a PROD sólo se
llega con mi aprobación. En Continuous Deployment no hay humano: todo lo que pasa los checks llega
solo a producción. Para eso me faltaría una red de seguridad mucho más fuerte: tests de integración
y end-to-end,por ejemplo. A esta altura a mi pipeline le faltaria madurez para llevarlo a continuous deployment.

### El diseño de la cadena y el alcance de cada secret
`build-backend` + `build-frontend` → `deploy-qa` → `deploy-prod`
- `deploy-qa` tiene `needs: [build-backend, build-frontend]`: sin CI verde no hay deploy.
- `deploy-qa` tiene `if: github.ref == 'refs/heads/main'`: los PRs verifican pero no despliegan.
- `deploy-qa` usa `environment: qa` y `deploy-prod` usa `environment: production`, con required
  reviewer (yo, con *Prevent self-review* desactivado). El job de PROD no arranca hasta que apruebo.
- `deploy-prod` tiene `needs: deploy-qa`: no se llega a PROD sin QA desplegado y con smoke verde.
- Los hooks se llaman con `&ref=$GITHUB_SHA`: Render despliega **el commit que este pipeline
  verificó**, no la punta de `main`. Importa porque entre que la corrida queda esperando y que yo
  apruebo puede entrar otro merge: sin el `&ref=`, aprobaría A y a PROD subiría B, que nadie aprobó.
  Por eso también `deploy-prod` tiene `concurrency` con `cancel-in-progress: false`: dos deploys a
  PROD no corren a la vez, y uno no cancela al otro a mitad de camino.
- **Secrets**: los cuatro deploy hooks son **environment secrets**. `RENDER_HOOK_API_QA` y
  `RENDER_HOOK_FRONT_QA` viven en `qa`; `RENDER_HOOK_API_PROD` y `RENDER_HOOK_FRONT_PROD` viven en
  `production`. Un job sólo ve los secrets de su environment, así que los de PROD sólo los lee un
  job aprobado. Las connection strings de Neon no están en GitHub: están en las variables de entorno
  de cada servicio de Render (QA apunta a `app_qa`, PROD a `app_prod`).

### Qué miro antes de aprobar (los criterios del gate)
1. Que `deploy-qa` esté verde **y** que en Render → Deploys el deploy de QA de ese commit figure
   como **Live** (el smoke solo no alcanza, ver más abajo).
2. Que el cambio se vea bien en QA: abro el front de QA y pruebo lo que cambió.
3. Qué cambia este deploy: el PR mergeado y su diff.
Si algo de eso no se cumple, rechazo con el motivo escrito. Lo hice una vez: rechacé el deploy de
https://github.com/Agostina19/ingsoft3-tp01/actions/runs/38203259263 porque el smoke de QA pasó en
36 segundos, antes de que Render terminara de construir: el verde era de la versión vieja, no de la
nueva. El flujo completo aprobado (QA verde → Waiting for review → aprobación → PROD con smoke
verde) está en https://github.com/Agostina19/ingsoft3-tp01/actions/runs/38204351414.
Lo que mi aprobador **no** puede ver: qué versión está corriendo realmente (nada la informa), si
hay errores en PROD (no tengo logs centralizados ni métricas) ni cómo se comporta con usuarios
reales. Para decidir mejor me faltaría observabilidad.

### Cómo comprobé que cada entorno usa su propia base
Inserté un gasto `'SOY PROD'` sólo en `app_prod` desde el SQL Editor de Neon. Aparece en el front de
PROD y **no** en el de QA. Si apareciera en los dos, PROD estaría escribiendo en la base de QA, y
ningún check se pondría en rojo.

### La letra chica del free tier y cómo la maneja el pipeline
- **Sleep y cold start**: Render duerme cada servicio a los ~15 min sin tráfico y el primer request
  lo despierta en hasta ~1 minuto. Por eso el smoke test **reintenta** (30 intentos cada 20 s) en vez
  de hacer un curl seco, que daría falsos rojos. Neon suspende el cómputo a los ~5 min idle, pero se
  despierta mucho más rápido.
- **750 horas por mes, por workspace** (no por servicio): mis 4 servicios duermen cuando no se usan,
  así que no llego. No dejo nada haciendo ping para mantenerlos despiertos.
- **500 minutos de build por mes**: cada promoción son hasta 4 builds (back y front, en QA y PROD).
  Medí entre 27 y 45 segundos por build (con caché), o sea unos 3 minutos por promoción: me alcanza
  de sobra. El riesgo es que si se acaban, Render deja de construir, el hook responde igual y el
  smoke da verde contra la versión vieja. El consumo lo miro en Workspace → Billing.
- **El proveedor también falla**: el 14/10 Render tuvo un incidente («Builds are not starting in all
  regions») y el deploy del API quedó trabado en Building 18 minutos. Ver el rollback, más abajo.
- Uso Neon y no el Postgres de Render porque el gratuito de Render expira a los 30 días.

### Qué garantía pierdo porque Render reconstruye desde el repo
Promuevo el mismo **commit**, pero no la misma **imagen**. Lo que corre en QA y en PROD no es la
imagen que mis tests aprobaron: es otra construcción del mismo código, hecha por Render. Podría
salir distinta: una imagen base (`node`, `nginx`, `dotnet`) que se actualizó entre un build y otro,
o una dependencia que cambió. Además, QA y PROD son dos builds separados, así que ni siquiera puedo
asegurar que PROD corre exactamente lo que probé en QA. La imagen `sha-<commit>` del registry queda
publicada pero no se usa. 

### Qué prueba mi smoke test y qué no
Prueba tres cosas: `/health` (el proceso del API está vivo), `/api/gastos` (el API llega a la base
y la consulta funciona; un `/health` solo podría dar verde con la connection string rota) y que el
front se sirve. **No prueba qué versión corre**: contesta igual la versión vieja que la nueva. Me
pasó: el smoke de QA dio verde en 36 segundos con la versión anterior, mientras Render todavía
construía la nueva (es el motivo de mi rechazo). Tampoco prueba que la app funcione bien
(crear un gasto, los totales): sólo que responde.

### Deployment pattern para producción real
Elegiría **blue-green**: dos entornos completos de PROD y un router que manda el tráfico a uno.
Despliego en el que no recibe tráfico, lo verifico, y cambio el router. Por qué ése:
- **Rollback**: instantáneo, es volver el router al entorno anterior, sin reconstruir nada.
- **Riesgo**: los usuarios nunca ven un deploy a medio terminar, y no hay downtime.
- **Costo**: el doble de infraestructura. Para una app de gastos chica es caro, pero es lo que compra
  el rollback rápido.
- Descarté **canary** porque necesita métricas que me digan si la versión nueva anda peor, y con
  pocos usuarios el porcentaje no muestra nada. **Rolling** no tiene sentido con una sola instancia.
- **Lo que me falta para ejecutarlo**: Observabilidad. Hoy no tengo métricas de errores ni de
  latencia en PROD, así que después del switch no podría saber con datos si la versión nueva anda
  peor y conviene volver.


### Plan de rollback actual (medido)
Si un deploy aprobado sale mal:
1. Busco el último deploy bueno: en GitHub → Deployments → `production`, o el tag de la release
   anterior (`git rev-list -n1 v6.0.0`).
2. Copio los deploy hooks de PROD desde Render (el secret de GitHub no se puede volver a leer).
3. Disparo los dos hooks con `&ref=<sha bueno>`.
4. Espero a que en Render → Deploys ese commit figure como **Live** en el API y en el front.

Lo probé de verdad el 14/10: después de la release `v6.0.0` aprobé un cambio visible (PR #27, el
título "MIS GASTOS version -Rollback", commit `25155af`) y volví a `v6.0.0` (`7e3bf50`).

- **Front PROD**: arrancó 16:52:59 y quedó Live en **35,8 s**.
- **API PROD**: el primer intento (16:52:02) quedó trabado en Building por el incidente de Render;
  lo cancelé a los 18 minutos y volví a disparar el hook. El reintento arrancó 17:11:17 y quedó Live
  en **45,3 s**.
- En condiciones normales mi rollback tarda **menos de 1 minuto por servicio**. Ese día tardó
  **unos 20 minutos** de punta a punta (16:52 → 17:12) por la falla del proveedor.

**Lo que el rollback de código no deshace: los datos.** Si un deploy hubiera corrido una migración
que borra una columna, volver al commit anterior no la recupera: la columna sigue borrada y el
código viejo puede romperse contra el esquema nuevo. Para eso haría falta un backup de la base antes
del deploy (o el *point-in-time restore* de Neon), y migraciones que sólo agreguen y no borren hasta
que la versión vieja ya no corra.

### Problemas encontrados y cómo los resolví
- **El front no sabía a qué backend llamar en cada entorno**: el `nginx.conf` tenía la dirección del
  backend fija. Lo convertí en plantilla (`default.conf.template`) que lee `BACKEND_URL` y
  `DNS_RESOLVER` de las variables de entorno de cada servicio de Render.
- **El smoke de QA daba verde antes de tiempo**: pasó en 36 s contra la versión vieja, porque Render
  todavía estaba construyendo. Lo detecté mirando Render → Deploys, rechacé ese deploy a PROD y desde
  ahí, antes de aprobar, confirmo que el deploy de QA figure como Live.
- **El rollback del API se trabó en Building** por un incidente de Render. Lo diagnostiqué mirando
  los logs (el build había terminado en 14 s y después no avanzó nada) y la página
  status.render.com. Cancelé y volví a disparar el hook.
- **El `git push` del tag falló con «Could not resolve host: github.com»**: era la conexión, no Git.
  Lo reintenté cuando volvió internet, sin volver a crear el tag.

### Declaración de uso de IA
Usé Claude como asistente para entender los conceptos de la guía, armar el paso a paso de cada
tarea (los jobs de deploy, los environments, el rollback) y redactar esta sección a partir de lo que
hice y medí. Los cambios los hice yo y los verifiqué ejecutándolos: miré cada corrida en Actions, el
estado de cada deploy en Render (commit, hora y Live), la prueba de `'SOY PROD'` en las dos bases y
los tiempos del rollback, que salen de Render y no de una estimación.


## TP7 — Contenedores en el pipeline, integración y e2e

### Build once, deploy many
En el TP6 Render reconstruía la app desde el repo en cada entorno, así que QA y PROD eran dos builds
distintos y ninguno era la imagen que pasó mis tests. Ahora la imagen se construye una sola vez en
el pipeline y QA y PROD ejecutan esa misma imagen. Se ve en el log: `deploy-qa` y `deploy-prod`
mandan el mismo `imgURL` (`sha-69c24d6…`).

### Etiquetas
- `sha-<commit>` en el registry: dice de qué commit salió cada imagen. Es la que uso para desplegar.
- `v7.0.0` en git: el nombre de la versión que está en PROD al cerrar el TP.
- No publico `latest` porque cambia con cada publicación y no dice qué hay adentro: un deploy con
  `latest` podría subir algo que no pasó las pruebas.
- En Render configuré los 4 servicios con `sha-68e5531…` (el merge del PR #28). Esa es sólo la imagen
  de partida: lo que corre lo define cada deploy del pipeline con su `imgURL`. No creé servicios
  nuevos, les cambié la fuente a los que ya tenía, así no cambiaron las URLs.

### De la release a la imagen
`git rev-list -n1 v7.0.0` me da el commit, y con ese sha busco la etiqueta `sha-<commit>` en los
dos paquetes.

### Cómo compruebo que un entorno ejecuta mi imagen
En los *Events* de cada servicio de Render, el deploy dice «Triggered via Deploy Hook» y nombra la
imagen `sha-<commit>` de esa corrida, y esa etiqueta está en mis paquetes. El smoke no alcanza:
sólo prueba que la app responde, y respondería igual si el deploy hubiera fallado y siguiera
corriendo la versión anterior.

### Qué pruebo en cada suite
**Integración** (`e2e/api.spec.js`, contra la API de QA, sin navegador):
1. Alta, la encuentro en la lista, la borro y ya no está.
2. Descripción vacía: la API contesta 400 y no se crea nada.
3. Resumen por categoría: creo un gasto con una categoría única, el resumen lo suma, lo borro y ya
   no aparece.

**e2e** (`e2e/gastos.spec.js`, con navegador, contra el front de QA):
1. Crear un gasto, verlo en la lista, borrarlo y que ya no esté.
2. Descripción de más de 100 caracteres: se ve el error y no se crea nada.
3. Resumen por categoría: el gasto nuevo aparece en la pestaña Resumen con su monto, y al borrarlo
   desaparece.

La tercera de cada suite la elegí porque ver cuánto gasté por categoría es lo que más uso de la app,
y la suma la hace la base. Si se rompe, la app deja de servirme.

Lo que no puse:
- En integración, cada regla de validación por separado (monto 0, categoría vacía): eso ya lo
  cubren los unit tests del TP5.
- En e2e, los filtros y la búsqueda: filtran en el navegador sin tocar la base, y también tienen
  unit tests. Las e2e son lentas, así que dejo sólo lo crítico (pirámide).

### Integración vs e2e: lo que me dijo la corrida roja
La integración le habla a la API directo, con los nombres de campo correctos. La e2e usa la app
como un usuario, así que prueba también cómo el front le habla a la API.
En la corrida roja cambié en el front el campo `descripcion` por `desc`. La integración quedó
verde y la e2e roja: la API y la base andaban bien, el que estaba mal era el front. En la traza de
la e2e, en Network, el `POST /api/gastos` dio 400 y el body mandaba `desc`. El test de error pasó
igual porque ese error lo valida el front antes de llamar a la API.

### Por qué integración amplia (contra QA) y no estrecha
- Gano: prueba la imagen exacta que va a PROD, contra el Postgres real de Neon, y casi sin
  configuración extra.
- Pierdo: corre recién después del deploy a QA (me entero más tarde), depende de que QA esté
  despierto, y comparte la base de QA con otras corridas.

### Cold start y tests flaky
El smoke de `deploy-qa` ya despierta QA antes de las pruebas. Además, cada test tiene 60 s de tope
y cada `expect` espera hasta 15 s a que aparezca lo que busca, sin `sleep`. Con `retries: 1`, un
test que falla y pasa al reintentar sale como **flaky**: un test que a veces pasa y a veces no sin
que cambie el código. En mis corridas hubo 0 flaky.

### La misma imagen del front en QA y en PROD
Adentro de la imagen van los archivos del build y la plantilla de nginx. Lo que cambia por entorno
son dos variables de cada servicio de Render: `BACKEND_URL` (la API de ese entorno) y
`DNS_RESOLVER`. El front llama a `/api` relativo y nginx lo manda a `BACKEND_URL`.

### Límite conocido
QA es uno solo. Si mergeo dos veces seguidas, la segunda corrida puede redesplegar QA mientras las
pruebas de la primera están corriendo. Por eso hago un merge por vez.

### Problemas encontrados y cómo los resolví
- **Docker Desktop no arrancaba.** En los logs vi que varios archivos de configuración de Docker
  (`daemon.json`, `windows-daemon.json`) habían quedado llenos de ceros después de que la compu se
  colgó. Los reescribí con la configuración por defecto y limité la memoria de Docker a 2 GB con
  `.wslconfig`.
- **Un test agarraba dos botones.** `getByRole('button', { name: 'Resumen' })` también encontraba
  el botón «Borrar resumen e2e…». Lo arreglé con `exact: true`.
- **Faltaban labels en el front.** Los inputs sólo tenían placeholder. Agregué `aria-label` a los
  inputs y a cada botón de borrar, y `role="alert"` al mensaje de error.
- **Una e2e tardó 8 minutos**, pero no por los tests (8 s): fue instalar Chromium en el runner.

### Declaración de uso de IA
Usé Claude para entender la guía, armar el paso a paso y escribir los tests y esta sección a partir
de lo que hice. Lo verifiqué corriendo los tests contra mi compose local y contra QA, mirando las
corridas en Actions, los reportes y trazas de Playwright, y los *Events* de Render.


## TP8 — Infraestructura como Código

### Riel y versiones
Terraform (v1.16.6, instalado con winget) contra Neon y Render, los mismos proveedores del TP6.
Providers fijados en `infra/main.tf`: `kislerdm/neon` **0.18.0** y `render-oss/render` **1.9.1**.
Preprod es un entorno nuevo (base de Neon + api y front en Render corriendo la imagen de `v7.0.0`);
QA y producción no se tocaron.

### Problemas encontrados y cómo los resolví
- **El primer `apply` falló con «org_id is required».** Mi cuenta de Neon está dentro de una
  organización, y Neon pide en cuál crear el proyecto. Agregué `org_id` al `neon_project`, con el id
  en `variables.tf` (no es un secreto).
- **Preprod quedó en otra cuenta de Neon.** La API key la saqué de mi cuenta de la facu, y QA y
  PROD están en mi cuenta personal. No es un problema, porque preprod no tiene que tocarlos, pero
  para crearlo tengo que exportar la key de la cuenta de la facu.
- **La URL de preprod cambia cada vez que lo recreo.** Render le agrega un sufijo nuevo
  (`-7lq8` la primera vez, `-fs14` después del `destroy` → `apply`). Por eso leo las URLs del
  `output`, y el front recibe la de su api por `BACKEND_URL = render_web_service.api.url`.
- **Instalación de Terraform.** No tenía `choco`, así que lo instalé con `winget`. Después la
  terminal no reconocía el comando hasta que cerré VS Code del todo.
- **El `.gitignore` de la guía** tiene un comentario en la misma línea que `*.tfvars`. En un
  `.gitignore` eso rompe la regla, así que puse el comentario en su propia línea.

### Declaración de uso de IA
Usé Claude para entender la guía y armar el paso a paso, y para escribir el HCL adaptado a mi app.
Lo verifiqué corriendo cada `plan` y leyéndolo antes del `apply`, comprobando en las consolas de
Neon y Render que preprod se creaba y se destruía, que QA y producción seguían intactos, y que
`/health` y `/api/gastos` respondían.

