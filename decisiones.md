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
