# Sprint 8 - Process Data Collection Studio Test Plan

## Objetivo

Validar que el Studio capture datos operacionales por actividad y deje el Process Model enriquecido para analisis posteriores.

## Casos de prueba

1. Captura completa por actividad
   - Dado un Process Model con actividades.
   - Cuando el usuario completa responsable, frecuencia, tiempos, clasificacion e indicadores.
   - Entonces la actividad queda sin validaciones pendientes.

2. Validaciones automaticas
   - Dada una actividad incompleta.
   - Cuando se carga el Studio.
   - Entonces se detectan tiempos faltantes, frecuencia faltante, clasificacion pendiente, responsable faltante e indicadores faltantes.

3. Sincronizacion con Process Model
   - Dada una actividad editada.
   - Cuando se guardan datos operacionales.
   - Entonces `operationalData`, responsable, area, sistemas, documentos, riesgos e indicadores quedan en la actividad.

4. Sincronizacion con Knowledge Package
   - Dado un Knowledge Package existente.
   - Cuando se guardan datos operacionales.
   - Entonces `identifiedActivities` incluye `operationalData`, indicadores, riesgos y errores frecuentes.

5. Sincronizacion con Context Graph
   - Dado un Context Graph existente.
   - Cuando se guardan datos operacionales.
   - Entonces se agregan nodos operacionales de rol, KPI, SLA, recursos y riesgos cuando aplican.

## Pruebas ejecutadas

- Validacion de sintaxis JavaScript con `node --check`.
- Prueba funcional local del servicio con Process Model simulado:
  - Validaciones de actividad: 0.
  - Readiness score: 100.
  - Clasificacion: Listo para analisis.
  - `operationalData` persistido en actividad.
  - Context Graph enriquecido con nodos operacionales.

## Riesgos pendientes

- La persistencia sigue siendo localStorage.
- No existe guardado real en Google Sheets para datos operacionales.
- VSM, Lean, TOC, Business Case y Monte Carlo todavia no consumen automaticamente este dataset operativo.
