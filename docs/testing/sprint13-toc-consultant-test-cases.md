# Sprint 13 - Casos de prueba TOC Transformation Consultant

## TC-TOC-001 - Carga del modulo

Pasos:

1. Abrir `frontend/index.html`.
2. Navegar a `TOC Consultant`.

Resultado esperado:

- La pantalla abre dentro del Workspace.
- No aparece como `Proximamente`.
- Se muestra el boton `Ejecutar diagnostico TOC`.

## TC-TOC-002 - Process Model requerido

Condicion inicial: no existe Process Model.

Pasos:

1. Abrir `TOC Consultant`.

Resultado esperado:

- El sistema informa que se requiere Process Model.
- No genera diagnostico sin datos.

## TC-TOC-003 - Generar TOC Assessment Package

Condicion inicial: existe Process Model con actividades.

Pasos:

1. Abrir `TOC Consultant`.
2. Presionar `Ejecutar diagnostico TOC`.

Resultado esperado:

- Se crea `TOC Assessment Package`.
- Existe diagnostico por actividad.
- Existe resumen ejecutivo.
- Existe `decisionTrace`.

## TC-TOC-004 - Detectar restriccion

Condicion inicial: actividad con espera, utilizacion alta, regla de aprobacion o dependencia critica.

Pasos:

1. Ejecutar diagnostico TOC.
2. Seleccionar la actividad.

Resultado esperado:

- Se clasifica como restriccion fisica, capacidad, politica, informacion o tecnologia.
- Se muestra evidencia.
- Se muestra nivel de confianza.

## TC-TOC-005 - Detectar cuello de botella

Condicion inicial: actividad con mayor tiempo de ciclo o mayor tiempo de espera.

Pasos:

1. Ejecutar diagnostico TOC.
2. Revisar seccion `Cuellos de botella`.

Resultado esperado:

- La actividad aparece como cuello de botella.
- Se muestran senales y confianza.

## TC-TOC-006 - Preguntas por informacion insuficiente

Condicion inicial: actividad sin tiempos o sin evidencia.

Pasos:

1. Ejecutar diagnostico TOC.
2. Revisar panel de preguntas.

Resultado esperado:

- El consultor genera preguntas especificas.
- Las preguntas criticas bloquean consolidacion.

## TC-TOC-007 - Acciones TOC

Condicion inicial: existe evidencia de restriccion.

Pasos:

1. Ejecutar diagnostico TOC.
2. Revisar acciones sugeridas.

Resultado esperado:

- Se generan acciones para explotar, subordinar, elevar y reevaluar la restriccion.
- No se genera Business Case ni To-Be.

## TC-TOC-008 - Integracion con Methodology Orchestrator

Pasos:

1. Ejecutar diagnostico TOC.
2. Abrir Methodology Orchestrator.
3. Seleccionar TOC Consultant.

Resultado esperado:

- TOC Consultant aparece como etapa implementada.
- Muestra avance, Health Score, bloqueos e informacion faltante.

## TC-TOC-009 - Integracion con Consulting Decision Framework

Pasos:

1. Ejecutar diagnostico TOC.
2. Inspeccionar el paquete persistido en `localStorage`.

Resultado esperado:

- El paquete contiene `decisionTrace`.
- Cada actividad contiene `decisionTrace`.
- El framework tiene 9 etapas.
