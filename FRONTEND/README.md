# Olinda Herd Health

Quiero que actúes como un equipo integrado por un arquitecto de software, desarrollador full stack, diseñador UX/UI, científico de datos y experto en analítica reproductiva de ganado bovino.

Construye un MVP web completo, funcional y ejecutable llamado:

Olinda Alerta Reproductiva

El sistema debe administrar información reproductiva del ganado bovino, almacenarla en una base de datos SQLite, analizar cada animal y generar alertas tempranas sobre el riesgo de superar un intervalo de 14 meses entre partos.

No construyas solamente una maqueta visual. Implementa una aplicación de extremo a extremo con frontend, backend, base de datos, datos iniciales, validaciones, lógica de alertas, importación y exportación de información, documentación y pruebas básicas.

1. Información académica del proyecto

Título

Sistema de alerta temprana del riesgo reproductivo en ganado bovino mediante clasificación supervisada.

Introducción: contexto

La reproducción es muy importante en una ganadería, porque de ella depende que las vacas puedan tener crías de manera constante y que la finca aproveche mejor los recursos utilizados en la alimentación, el manejo y el cuidado de los animales.

En este proyecto se tomará como referencia que una vaca debería tener una nueva cría aproximadamente cada 12 a 14 meses. Para revisar este comportamiento se utilizarán los registros disponibles de la Ganadería Olinda, como las fechas de parto, edad de los animales, antecedentes de maternidad, condición corporal, estado de salud y tiempo transcurrido desde el último parto.

Introducción: problema

El problema se presenta cuando algunas vacas pasan demasiado tiempo sin tener una nueva cría. Estos animales siguen generando gastos de alimentación, cuidado y mantenimiento, pero no están aportando la producción reproductiva esperada.

En los registros de la Ganadería Olinda se pueden observar vacas con intervalos entre partos de 14, 16, 18 y hasta más de 20 meses. Aunque estos registros permiten identificar animales que ya presentan dificultades reproductivas, muchas veces el problema se detecta cuando la vaca ya superó el tiempo esperado.

Por esta razón, es necesario analizar la información histórica para identificar anticipadamente cuáles vacas tienen mayor riesgo de superar los 14 meses entre partos.

Introducción: propuesta

El proyecto propone desarrollar una herramienta web basada en los registros históricos de la Ganadería Olinda, con el objetivo de identificar las vacas que presentan mayor riesgo de tener un intervalo reproductivo superior a 14 meses.

En una primera etapa, el MVP utilizará reglas configurables y transparentes para evaluar el riesgo. Posteriormente, cuando exista una cantidad suficiente de datos históricos, se podrá entrenar y validar un modelo de clasificación supervisada.

La herramienta permitirá clasificar las vacas por nivel de riesgo, generar alertas tempranas, priorizar animales que necesiten seguimiento y apoyar la toma de decisiones para mejorar el manejo reproductivo y la productividad de la ganadería.

Objetivo general

Desarrollar un sistema de alerta temprana que identifique vacas con riesgo de superar un intervalo de 14 meses entre partos, mediante el análisis de información histórica reproductiva y la aplicación de técnicas de clasificación supervisada, para apoyar la toma de decisiones y mejorar la eficiencia reproductiva del hato.

Objetivos específicos

Caracterizar y preparar el conjunto de datos reproductivos del ganado, identificando variables relevantes, valores faltantes, inconsistencias y variables categóricas.

Construir variables e indicadores reproductivos a partir de los registros disponibles, como los meses desde el último parto, número de servicios, condición corporal e intervalos entre partos.

Entrenar y evaluar modelos de clasificación supervisada que permitan estimar el riesgo de que una vaca supere los 14 meses entre partos, cuando se disponga de suficientes registros históricos.

Implementar un sistema de alerta temprana que clasifique a las vacas según su nivel de riesgo y genere reportes para apoyar las decisiones de manejo reproductivo.

Fuente de los datos

Fuente: registros históricos reproductivos de ganado bovino de la Ganadería Olinda.

Enlace: no aplica inicialmente; la información procede de registros propios de la explotación ganadera.

Licencia: uso académico autorizado por el propietario de los datos.

Tamaño: por determinar una vez se consoliden los registros históricos disponibles y los datos que se incorporen mediante las actualizaciones.

Periodo: por determinar, de acuerdo con los años disponibles en los registros reproductivos.

Forma de obtención: registros generados durante el manejo reproductivo de los animales, incluyendo identificación de cada vaca, fechas de parto, diagnósticos de preñez, servicios y demás antecedentes disponibles.

2. Alcance del MVP

La aplicación debe permitir:

Registrar, consultar, editar y eliminar vacas.

Almacenar toda la información en SQLite.

Importar registros desde archivos CSV.

Exportar la información y los resultados a CSV.

Consultar una ficha individual por animal.

Calcular indicadores reproductivos automáticamente.

Asignar un puntaje y nivel de riesgo.

Explicar las razones de cada alerta.

Mostrar un dashboard general del hato.

Filtrar y ordenar animales por riesgo.

Crear un listado priorizado para seguimiento.

Registrar observaciones y acciones realizadas.

Mantener un historial de evaluaciones por vaca.

Incorporar un módulo experimental de clasificación supervisada.

Mostrar claramente cuando no existan suficientes datos para entrenar un modelo confiable.

3. Tecnologías

Backend

Python 3.11 o superior.

FastAPI.

SQLAlchemy.

Pydantic.

SQLite.

Alembic para migraciones.

Pandas.

Scikit-learn.

Joblib.

Frontend

React.

TypeScript.

Vite.

Tailwind CSS.

React Router.

Recharts.

Axios o Fetch.

Componentes accesibles y reutilizables.

Organiza el proyecto en carpetas independientes para frontend y backend.

4. Diseño e idioma

Toda la interfaz debe estar en español.

El diseño debe transmitir tecnología aplicada al campo, confianza, claridad y facilidad de uso.

Utiliza una identidad visual basada en:

Verde oscuro.

Verde oliva.

Beige claro.

Blanco.

Amarillo o naranja para advertencias.

Rojo para riesgo crítico.

La aplicación debe funcionar correctamente en computador, tableta y teléfono móvil.

No utilices textos de relleno ni botones sin funcionalidad.

5. Landing page

Crea una landing page moderna con:

Encabezado

Nombre: “Olinda Alerta Reproductiva”.

Menú: Inicio, Beneficios, Funcionamiento e Ingresar.

Botón: “Ingresar al sistema”.

Sección principal

Título:

“Anticipe el riesgo reproductivo de su ganado”

Subtítulo:

“Centralice los registros de sus vacas, identifique los animales que requieren seguimiento y tome decisiones oportunas mediante alertas basadas en datos.”

Botones:

“Ver dashboard”.

“Conocer cómo funciona”.

Incluye una composición visual relacionada con ganado, información y alertas.

Problema

Explica que una vaca con intervalos reproductivos prolongados sigue generando costos sin alcanzar el desempeño esperado.

Destaca:

“Intervalo reproductivo esperado: entre 12 y 14 meses”.

Beneficios

Mostrar tarjetas con:

Detección temprana.

Priorización de animales.

Información centralizada.

Decisiones basadas en datos.

Seguimiento reproductivo.

Reportes descargables.

Funcionamiento

Registrar o importar información.

Validar y preparar los datos.

Evaluar el riesgo reproductivo.

Priorizar el seguimiento del animal.

Advertencia

Mostrar:

“Las alertas constituyen una herramienta de apoyo para la toma de decisiones y no reemplazan la valoración de un médico veterinario o profesional responsable del manejo reproductivo.”

Pie de página

“Proyecto académico de analítica de datos aplicado a la Ganadería Olinda”.

6. Aplicación interna

Implementa un menú lateral con:

Resumen general.

Inventario de vacas.

Alertas reproductivas.

Registrar vaca.

Importar datos.

Seguimientos.

Analítica.

Modelo predictivo.

Configuración.

7. Dashboard

Mostrar indicadores con:

Total de vacas.

Vacas en riesgo bajo.

Vacas en riesgo medio.

Vacas en riesgo alto.

Vacas en riesgo crítico.

Candidatas a descarte.

Promedio del intervalo entre partos.

Promedio de meses desde el último parto.

Porcentaje con intervalo superior a 14 meses.

Incluir gráficas de:

Distribución por nivel de riesgo.

Distribución por clasificación reproductiva.

Intervalos entre partos.

Condición corporal frente al intervalo entre partos.

Edad frente al desempeño reproductivo.

Animales priorizados.

Estados de salud.

Meses desde el último parto.

Las gráficas deben usar datos reales de SQLite e incluir títulos, leyendas, tooltips y estados vacíos.

8. Base de datos SQLite

Crea las siguientes tablas:

Tabla vacas

id: entero, llave primaria.

vaca_id: texto, único y obligatorio.

edad_meses: decimal positivo.

color: texto.

cachona: booleano.

peso_kg: decimal positivo.

condicion_corporal: decimal entre 1 y 5.

estado_salud: texto.

edad_primer_parto_meses: decimal positivo o nulo.

num_partos: entero igual o mayor que cero.

intervalo_partos_meses: decimal positivo o nulo.

meses_desde_ultimo_parto: decimal positivo o nulo.

perdida_cria: booleano.

produccion_leche_lt_dia: decimal igual o mayor que cero.

candidata_descarte: booleano.

clasificacion_reproductiva: Buena, Regular o Mala.

fecha_ultimo_parto: fecha opcional.

fecha_ultimo_servicio: fecha opcional.

numero_servicios: entero opcional.

diagnostico_prenez: texto opcional.

observaciones: texto opcional.

activa: booleano, predeterminado en verdadero.

fecha_creacion: fecha y hora.

fecha_actualizacion: fecha y hora.

Tabla evaluaciones_riesgo

id.

vaca_id: llave foránea.

fecha_evaluacion.

puntaje_riesgo: número entre 0 y 100.

nivel_riesgo: Bajo, Medio, Alto o Crítico.

probabilidad_modelo: decimal opcional.

metodo: Reglas o Modelo supervisado.

factores_riesgo: JSON.

recomendacion: texto.

version_reglas_modelo: texto.

Tabla seguimientos

id.

vaca_id: llave foránea.

fecha_seguimiento.

tipo_accion.

responsable.

descripcion.

resultado.

proxima_revision.

estado: Pendiente, En proceso o Completado.

fecha_creacion.

Tabla configuracion

Debe permitir modificar:

Umbral crítico reproductivo: 14 meses.

Inicio de advertencia: 12 meses.

Condición corporal mínima recomendada.

Pesos de los factores de riesgo.

Rangos de cada nivel.

Colores de las alertas.

Versión de las reglas.

9. Datos iniciales

Carga automáticamente estos registros:

vaca_id,edad_meses,color,cachona,peso_kg,condicion_corporal,estado_salud,edad_primer_parto_meses,num_partos,intervalo_partos_meses,meses_desde_ultimo_parto,perdida_cria,produccion_leche_lt_dia,candidata_descarte,clasificacion_reproductiva
S00001,134.5,amarillo,1,473.9,3.6,sana,35.8,7,14.8,3.4,0,7.9,0,Buena
S00002,144.0,negro,0,466.0,2.9,sana,37.9,8,15.9,1.6,1,6.3,1,Mala
S00003,76.7,amarillo,0,466.6,2.9,sana,38.8,3,11.2,2.2,0,8.1,0,Buena
S00004,187.7,pardo,0,495.1,3.6,sana,31.3,12,16.3,1.2,1,6.9,1,Regular
S00005,107.2,rojo,0,496.6,3.4,sana,27.5,6,14.7,5.9,0,7.8,0,Regular
S00006,146.6,rojo,0,409.2,1.8,nuche,34.3,9,18.7,10.9,1,5.9,1,Mala
S00007,112.0,blanco,0,453.5,3.7,sana,26.6,6,12.2,3.1,0,8.0,0,Buena


Aclara dentro de la aplicación que estos siete registros son datos de demostración y no constituyen una muestra suficiente para entrenar o validar científicamente un modelo predictivo.

10. Sistema inicial de alertas

Mientras no existan suficientes registros históricos, utiliza reglas transparentes y configurables.

Calcula un puntaje entre 0 y 100.

Meses desde el último parto

Menos de 10 meses: 0 puntos.

Entre 10 y menos de 12 meses: 10 puntos.

Entre 12 y 14 meses: 25 puntos.

Más de 14 meses: 40 puntos.

Intervalo histórico entre partos

Hasta 12 meses: 0 puntos.

Más de 12 y hasta 14 meses: 10 puntos.

Más de 14 y hasta 16 meses: 20 puntos.

Superior a 16 meses: 30 puntos.

Condición corporal

Igual o superior a 3,0: 0 puntos.

Entre 2,5 y menos de 3,0: 10 puntos.

Menor de 2,5: 20 puntos.

Estado de salud

Sana: 0 puntos.

Diferente de sana: 10 puntos.

Pérdida de cría

No: 0 puntos.

Sí: 10 puntos.

Edad al primer parto

Hasta 30 meses: 0 puntos.

Más de 30 y hasta 36 meses: 5 puntos.

Superior a 36 meses: 10 puntos.

Candidata a descarte

No: 0 puntos.

Sí: 10 puntos.

Limita el resultado a un máximo de 100.

Clasifica así:

Bajo: 0 a 24.

Medio: 25 a 49.

Alto: 50 a 74.

Crítico: 75 a 100.

Centraliza las reglas en un servicio del backend y permite modificarlas desde Configuración.

11. Explicación de la alerta

Cada evaluación debe mostrar:

Puntaje.

Nivel de riesgo.

Factores que aumentaron el puntaje.

Valores observados.

Umbrales aplicados.

Recomendación.

Fecha de evaluación.

Método utilizado.

Versión de reglas o modelo.

Ejemplo:

“Riesgo alto: 70/100. Factores principales: intervalo histórico de 18,7 meses, condición corporal de 1,8, estado de salud ‘nuche’, pérdida previa de cría y condición de candidata a descarte.”

No generar diagnósticos veterinarios definitivos.

12. Recomendaciones

Bajo: continuar con el seguimiento rutinario.

Medio: revisar la información reproductiva y programar control.

Alto: priorizar valoración reproductiva y revisar condición corporal, salud y antecedentes.

Crítico: priorización inmediata para evaluación por el responsable del manejo reproductivo.

13. Inventario de vacas

Crear una tabla con:

Identificación.

Edad.

Peso.

Condición corporal.

Estado de salud.

Número de partos.

Intervalo entre partos.

Meses desde el último parto.

Clasificación reproductiva.

Puntaje.

Nivel de riesgo.

Candidata a descarte.

Acciones.

Agregar:

Búsqueda por identificación.

Filtros por riesgo, salud, clasificación y descarte.

Ordenamiento.

Paginación.

Ver ficha.

Editar.

Evaluar nuevamente.

Eliminar con confirmación.

14. Ficha individual

Mostrar:

Datos generales.

Información productiva.

Información reproductiva.

Evaluación actual.

Factores de riesgo.

Historial de evaluaciones.

Historial de seguimientos.

Formulario de seguimiento.

Botón de edición.

Botón de exportación.

Indicador visual del riesgo.

15. Registro y edición

Validar en frontend y backend:

Identificación obligatoria y única.

Edad y peso positivos.

Condición corporal entre 1 y 5.

Número de partos no negativo.

Intervalos y meses no negativos.

Producción de leche no negativa.

Coherencia de fechas.

Mensajes comprensibles en español.

16. Importación de CSV

El módulo debe:

Permitir seleccionar o arrastrar un CSV.

Mostrar una vista previa.

Validar las columnas.

Convertir 0/1 y verdadero/falso.

Detectar identificaciones duplicadas.

Identificar valores faltantes.

Detectar valores negativos o fuera de rango.

Permitir actualizar registros existentes.

Mostrar filas válidas y filas con errores.

Descargar un reporte de errores.

Solicitar confirmación antes de importar.

Incluir una plantilla CSV descargable.

17. Módulo de analítica

Permitir analizar:

Vacas con intervalos mayores de 14 meses.

Vacas próximas a alcanzar 14 meses.

Vacas con condición corporal baja.

Vacas con pérdida de cría.

Vacas con problemas de salud.

Candidatas a descarte.

Relación entre leche y reproducción.

Relación entre edad, partos e intervalo reproductivo.

Agregar filtros y exportación de resultados.

18. Clasificación supervisada

Construye un módulo experimental, pero no presentes el modelo como válido usando solamente los siete registros.

El módulo debe:

Verificar la cantidad y calidad de datos.

Advertir cuando la muestra sea insuficiente.

Exigir un mínimo configurable, inicialmente 100 registros válidos y por lo menos 20 casos por clase.

Comparar:

Regresión logística.

Árbol de decisión.

Random Forest.

Crear un pipeline con:

Imputación de faltantes.

Escalamiento de variables numéricas.

One-hot encoding de variables categóricas.

Separar entrenamiento y prueba con estratificación.

Utilizar validación cruzada cuando sea posible.

Mostrar:

Accuracy.

Precision.

Recall.

F1-score.

Matriz de confusión.

ROC-AUC cuando corresponda.

Priorizar el recall de la clase de riesgo.

Guardar el modelo, fecha, métricas y variables.

Permitir activar o desactivar el modelo.

Conservar las reglas como alternativa.

19. Variable objetivo

Utiliza:

riesgo_superar_14_meses

Valores:

0: no superó 14 meses.

1: superó 14 meses.

Construye la etiqueta usando intervalos reproductivos históricos que ya hayan finalizado.

Evita la fuga de información:

Si intervalo_partos_meses determina directamente la etiqueta del registro, no debe emplearse como predictor de ese mismo resultado.

Se puede utilizar el promedio de intervalos anteriores si era conocido antes del evento.

Excluye candidata_descarte y clasificacion_reproductiva si fueron asignadas después de conocer el resultado.

Prioriza variables conocidas antes del desenlace:

Edad.

Peso.

Condición corporal.

Estado de salud.

Edad al primer parto.

Número de partos anteriores.

Promedio de intervalos anteriores.

Pérdidas de cría anteriores.

Producción de leche.

Número de servicios.

Diagnóstico de preñez.

Meses desde el último parto en la fecha de evaluación.

Documenta qué variables se usan y cuáles se excluyen.

20. API REST

Implementa y documenta mediante Swagger/OpenAPI:

Vacas

GET /api/v1/vacas

GET /api/v1/vacas/{id}

POST /api/v1/vacas

PUT /api/v1/vacas/{id}

DELETE /api/v1/vacas/{id}

Evaluaciones

POST /api/v1/vacas/{id}/evaluar

GET /api/v1/vacas/{id}/evaluaciones

GET /api/v1/alertas

Seguimientos

POST /api/v1/vacas/{id}/seguimientos

GET /api/v1/vacas/{id}/seguimientos

PUT /api/v1/seguimientos/{id}

Analítica

GET /api/v1/dashboard/resumen

GET /api/v1/analitica

Archivos

POST /api/v1/importar/csv

GET /api/v1/exportar/csv

GET /api/v1/plantilla/csv

Modelo

GET /api/v1/modelo/estado

POST /api/v1/modelo/entrenar

GET /api/v1/modelo/metricas

POST /api/v1/modelo/activar

21. Seguridad

Validar y sanitizar las entradas.

Aceptar únicamente CSV.

Limitar el tamaño de archivos.

No mostrar errores internos sensibles.

Configurar CORS restrictivamente.

Utilizar variables de entorno.

No incluir secretos en el código.

Registrar acciones importantes.

Implementar autenticación local básica o dejar preparada su incorporación.

22. Accesibilidad

Contraste adecuado.

Formularios con etiquetas.

Navegación mediante teclado.

No depender únicamente del color.

Estados de carga.

Mensajes de éxito y error.

Tooltips.

Unidades visibles.

Diseño responsive.

23. Pruebas

Incluye pruebas para:

Crear una vaca.

Rechazar identificaciones duplicadas.

Validar la condición corporal.

Calcular el puntaje.

Asignar los cuatro niveles.

Importar un CSV válido.

Rechazar un CSV inválido.

Consultar el dashboard.

Registrar un seguimiento.

24. Documentación

Crea un README.md con:

Descripción.

Arquitectura.

Requisitos.

Instalación.

Variables de entorno.

Ejecución de backend y frontend.

Migraciones.

Datos de demostración.

Ejecución de pruebas.

Estructura del CSV.

Reglas de riesgo.

Limitaciones metodológicas.

Próximos pasos.

Incluye .env.example.

25. Ejecución

Configura Docker Compose para iniciar el proyecto mediante:

docker compose up --build


También documenta la ejecución sin Docker.

26. Restricciones metodológicas

No inventar datos adicionales.

No inventar métricas.

No afirmar que existe capacidad predictiva validada con siete registros.

No mostrar porcentajes ficticios de precisión.

Identificar el resultado inicial como “Evaluación basada en reglas configurables”.

Diferenciar riesgo observado, riesgo estimado, clasificación histórica y recomendación.

No confundir asociación con causalidad.

No reemplazar la valoración veterinaria.

27. Criterios de aceptación

El MVP se considera terminado cuando:

La landing page funciona.

Los siete registros se cargan en SQLite.

Funciona el CRUD de vacas.

Funciona la importación y exportación CSV.

Cada animal recibe un puntaje explicable.

El dashboard usa datos reales.

Funcionan filtros y búsquedas.

Se pueden registrar seguimientos.

Las gráficas no contienen información ficticia.

El módulo predictivo detecta la insuficiencia de datos.

La aplicación funciona con Docker Compose.

El README contiene instrucciones completas.

Las pruebas principales pasan.

No hay botones decorativos sin funcionalidad.

28. Entrega esperada

Genera:

Código completo del frontend.

Código completo del backend.

Base de datos SQLite mediante migraciones.

Script de datos iniciales.

Plantilla CSV.

Pruebas.

Dockerfiles.

docker-compose.yml.

.env.example.

README.

Vista previa de las pantallas principales.

Primero presenta brevemente la arquitectura y el árbol de archivos. Después genera todos los archivos requeridos.

Verifica que el proyecto se pueda instalar, ejecutar y probar. Si debes tomar una decisión no especificada, elige la alternativa más sencilla, estable y fácil de mantener para un MVP académico.

No entregues solamente explicaciones, pseudocódigo o interfaces simuladas: construye la aplicación funcional completa.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/666475fb-80fd-49e8-b722-59101374fcf1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
