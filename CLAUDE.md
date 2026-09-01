# Contexto del proyecto

Este es el repo del semestre para Ingeniería de Software 3 (UCC).
App: gestor de gastos personales (CRUD + total gastado).
Stack: backend .NET 8 minimal API, frontend React + Vite, base PostgreSQL.
Estructura: backend/ y frontend/ en carpetas separadas (para dockerizar después).

Entidad Gasto: id, descripción, monto, categoría, fecha.
Funcionalidad: CRUD completo + endpoint de total gastado.

## Reglas de trabajo importantes
- PRIMERO la app tiene que correr localmente. DESPUÉS se dockeriza. No saltear ese orden.
- Tengo que poder DEFENDER todo el código oralmente (la defensa es el 50% de la nota).
  Por eso: explicame cada parte de lo que escribís, no solo el código.
- Uso .NET 8 específicamente (no 10), porque es lo que pide la cátedra.
- El enunciado completo está en docs/enunciado-tp2.md.

## Conceptos que me van a preguntar en la defensa (tenerlos claros)
- Diferencia imagen vs contenedor; CMD vs ENTRYPOINT
- Qué persiste con los volúmenes; qué pasa con docker compose down -v
- Cómo se encuentra el backend con la DB (nombre de servicio en la red de compose)
- Por qué depends_on no alcanza sin healthcheck
- Por qué el .env no va al repo

## Contexto del TP1 (ya está hecho, trabajamos sobre este mismo repo)
- Este repo (ingsoft3-tp01) es el del TP1 y sigue siendo el del semestre.
- main está PROTEGIDA: no se puede pushear directo. Todo cambio entra por Pull Request.
- El flujo es: crear rama feature/<descripcion> → PR → merge con squash → borrar rama.
- Convención de ramas: feature/<descripcion> para features, fix/<descripcion> para correcciones.
- Ya existen en la raíz decisiones.md y evidencias.md del TP1.
  Para el TP2 se AGREGA contenido abajo con un título "## TP2 — Contenedores"
  (NO crear archivos nuevos, el historial del semestre es uno solo).
- Ya hay una release v1.0.0 publicada.