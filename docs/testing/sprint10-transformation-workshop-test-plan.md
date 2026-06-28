# Sprint 10 - Transformation Workshop Test Plan

## Objetivo

Validar que el Transformation Workshop capture observaciones colaborativas sobre actividades del VSM y genere un Transformation Observation Package reutilizable por consultores posteriores.

## Casos de prueba

1. Captura de observacion
   - Dada una actividad del VSM.
   - Cuando el usuario registra una observacion.
   - Entonces la observacion queda asociada a la actividad.

2. Clasificacion de observaciones
   - Dada una observacion con texto de espera, retrabajo, riesgo, automatizacion o IA.
   - Cuando se guarda.
   - Entonces el consultor digital asigna una categoria de taller y razon de clasificacion.

3. Confianza de observacion
   - Dada una observacion con texto, actividad y evidencia.
   - Cuando se guarda.
   - Entonces obtiene un nivel de confianza alto.

4. Adjuntos
   - Dada una observacion con fotografia, documento, enlace, nota o voz.
   - Cuando se guarda.
   - Entonces los adjuntos quedan registrados como referencias.

5. Preguntas aclaratorias
   - Dada una observacion sin evidencia suficiente.
   - Cuando se guarda.
   - Entonces el consultor genera una pregunta aclaratoria.

6. Sincronizacion
   - Dado un paquete de observaciones.
   - Cuando se guarda.
   - Entonces se actualiza Process Model, Knowledge Package y Context Graph.

## Pruebas ejecutadas

- Validacion de sintaxis JavaScript con `node --check`.
- Prueba funcional local del servicio:
  - Observaciones generadas: 1.
  - Clasificacion: RETRABAJO.
  - Confianza: HIGH_CONFIDENCE.
  - Adjuntos registrados: 2.
  - Context Graph actualizado.

## Riesgos pendientes

- Los adjuntos se registran como referencias locales; no hay carga real a Google Drive.
- Grabaciones de voz quedan preparadas como arquitectura, sin procesamiento de audio.
- No se generan recomendaciones automaticas, diagnostico Lean, restricciones TOC ni To-Be.
