# Sprint 12 - Manual de usuario Lean Transformation Consultant

## Objetivo

Usar el Lean Transformation Consultant como consultor digital experto en Lean Manufacturing. El consultor genera un Lean Assessment Package trazable a partir de Business Knowledge Package, Knowledge Package, Context Graph, Process Model, datos operativos, Intelligent VSM, Transformation Observation Package y Requirements Package cuando exista.

## Como ejecutar localmente

1. Abrir VS Code.
2. Abrir la carpeta `C:\Users\josh_\Documents\GitHub\transformacion_ia`.
3. Abrir `frontend/index.html` en el navegador o servir la carpeta `frontend` con un servidor estatico local.
4. Navegar hasta `Lean Consultant` desde el sidebar.

## Flujo de uso

1. Completar o preparar etapas previas:
   - Process Discovery;
   - Process Modeling;
   - Process Validation;
   - Process Data Collection;
   - Intelligent VSM;
   - Transformation Workshop.
2. Abrir `Lean Consultant`.
3. Presionar `Ejecutar diagnostico Lean`.
4. Revisar el Resumen Ejecutivo:
   - diagnostico consolidado;
   - perfil VA/NNVA/NVA;
   - desperdicios detectados;
   - preguntas pendientes;
   - nivel de confianza.
5. Seleccionar cada actividad y revisar:
   - que hace;
   - proposito;
   - quien la ejecuta;
   - que recibe;
   - que entrega;
   - valor;
   - ocho desperdicios Lean;
   - causa probable;
   - evidencia;
   - preguntas.
6. Revisar el resumen Lean:
   - actividades VA;
   - actividades NNVA;
   - actividades NVA;
   - desperdicios detectados;
   - Quick Wins;
   - oportunidades;
   - confianza promedio.
7. Resolver informacion faltante en los studios previos cuando existan preguntas bloqueantes.

## Reglas del consultor

- No inventa desperdicios.
- No asume clasificacion VA/NNVA/NVA si no existe dato.
- Evalua explicitamente los ocho desperdicios como `Existe`, `No existe` o `Evidencia insuficiente`.
- No recomienda mejoras cuando la evidencia es insuficiente.
- Formula preguntas especificas para completar el diagnostico.
- No genera Business Case.
- No genera TOC.
- No construye To-Be.
- Toda afirmacion debe mostrar evidencia o indicar informacion insuficiente.

## Salida generada

El sistema genera:

`Lean Assessment Package`

El paquete contiene:

- Resumen Ejecutivo.
- Diagnostico por actividad.
- Diagnostico consolidado.
- Desperdicios detectados.
- Quick Wins.
- Oportunidades Lean.
- Preguntas pendientes.
- Evidencia utilizada.
- Nivel de confianza.

Este paquete queda disponible para:

- TOC Consultant;
- Automation & AI Consultant;
- To-Be Designer;
- Business Case.

## Persistencia

Durante el MVP, el paquete se guarda en:

`localStorage["operational-intelligence.lean-consultant"]`

Tambien se sincroniza al Knowledge Package local para que otros consultores puedan consumirlo posteriormente.
