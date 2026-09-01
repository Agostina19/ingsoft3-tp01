EVIDENCIAS DEL TP 01:

1. Push a rama main rechazado:
<img width="1457" height="638" alt="image" src="https://github.com/user-attachments/assets/e22b062a-7a4b-4248-95bf-b64718dde49b" />

Github no deja pushear directamente a Main porque le pusimos una restricción que pide antes un Pull request, esto incluye al autor.


3. PR de la version B no se mergea automaticamente por conflicto
<img width="1319" height="777" alt="image" src="https://github.com/user-attachments/assets/c76ada02-f370-4ca5-afbd-f5376ed8508b" />

Github no permite mergear automaticamente el PR de B debido a que afecta la misma linea que cambie previamente con la versión a.


5. Muestra version subida y version actual de un cambio con marcadores
<img width="1600" height="575" alt="image" src="https://github.com/user-attachments/assets/9904f5c0-5188-4c9f-93f6-960082d3afc3" />

Acá se decide con que versión de los cambios nos quedamos, uno , otro o combinacion de ambos, es imperativo borrar los marcadores, sino no deja resolver.


7. Primera release publicada
<img width="1600" height="676" alt="image" src="https://github.com/user-attachments/assets/42de0057-4a46-40db-b89c-a2206c72a54e" />

Release publicada vinculada a la tag correspondiente y descripcion de cambios. 


EVIDENCIAS DEL TP 02: 

 1. Comparación de tamaño de imágenes
    <img width="1411" height="372" alt="image" src="https://github.com/user-attachments/assets/ea05fe9c-e99c-466d-9e50-35224a75bc34" />
    La imagen que compila (SDK) pesa 850MB, mientras que mi imagen final del backend pesa 225MB. El multi-stage build deja afuera el compilador y las herramientas que solo hacen falta para compilar, no para ejecutar.

2. Sistema funcionando end-to-end

<img width="1202" height="788" alt="image" src="https://github.com/user-attachments/assets/f06ce085-3a90-4ee5-8923-0a86e1ae532e" />
Con docker compose up -d se levantan los 3 servicios (base, backend, frontend) conectados entre sí por la red de Docker. La app funciona completa: se puede cargar un gasto y aparece en la lista.

3. Prueba de persisitencia

<img width="1600" height="463" alt="image" src="https://github.com/user-attachments/assets/5a125c33-d7c1-40ef-82c1-f917d85a26bf" />
<img width="1141" height="461" alt="image" src="https://github.com/user-attachments/assets/182dc268-8995-4ca5-9851-c3046ffef640" />
Acá docker compose down conserva los datos porque el volumen sobrevive a la destrucción del contenedor. docker compose down -v los borra porque además elimina el volumen — se ve la base con datos y después vacía ([])."

4. Imágenes públicas en Registry
<img width="1600" height="699" alt="image" src="https://github.com/user-attachments/assets/3f6c8f44-9e85-45cf-b027-9a0a82bcfc9b" />
<img width="1600" height="519" alt="image" src="https://github.com/user-attachments/assets/f533714c-ded2-4eb3-9c95-2249958c8d63" />


Después de docker logout, el docker pull de mis imágenes en ghcr.io funciona igual, sin pedir credenciales — confirma que están publicadas como públicas de verdad, no solo que la web dice 'Public'."






 


