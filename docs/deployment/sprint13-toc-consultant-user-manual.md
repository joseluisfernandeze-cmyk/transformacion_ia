# Sprint 13 - Manual de usuario TOC Transformation Consultant

## Objetivo

Usar el TOC Transformation Consultant para identificar restricciones reales, posibles cuellos de botella, dependencias criticas e impactos operativos del proceso.

## Entradas utilizadas

El consultor utiliza exclusivamente informacion existente:

- Business Knowledge Package.
- Knowledge Package.
- Context Graph.
- Process Model.
- Operational Data.
- Intelligent VSM.
- Transformation Observation Package.
- Lean Assessment Package.
- Consulting Decision Framework.

No usa informacion externa y no ejecuta IA nueva.

## Como ejecutar localmente

1. Abrir VS Code.
2. Abrir `C:\Users\josh_\Documents\GitHub\transformacion_ia`.
3. Abrir `frontend/index.html` en el navegador o servir la carpeta `frontend` con un servidor estatico.
4. Navegar a `TOC Consultant`.
5. Presionar `Ejecutar diagnostico TOC`.

## Flujo recomendado

1. Completar Process Model.
2. Registrar datos operativos.
3. Generar Intelligent VSM.
4. Capturar observaciones del Transformation Workshop.
5. Ejecutar Lean Transformation Consultant.
6. Abrir TOC Consultant.
7. Ejecutar diagnostico TOC.
8. Revisar:
   - resumen ejecutivo;
   - restricciones detectadas;
   - cuellos de botella;
   - dependencias criticas;
   - impacto;
   - acciones TOC sugeridas;
   - evidencia;
   - preguntas pendientes.

## Acciones TOC generadas

Cuando existe evidencia de restriccion, el consultor propone:

- Explotar la restriccion.
- Subordinar el sistema.
- Elevar la restriccion.
- Reevaluar la restriccion.

No genera Business Case, To-Be, Roadmap ni Executive Report.

## Salida

El sistema genera:

`TOC Assessment Package`

El paquete queda persistido temporalmente en:

`localStorage["operational-intelligence.toc-consultant"]`
