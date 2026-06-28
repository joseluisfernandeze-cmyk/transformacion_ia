# Sprint 8 - Requirements Discovery Consultant Test Plan

## Objetivo

Validar que el Requirements Discovery Consultant genere un Requirements Package para ERP Discovery usando evidencia existente, sin inventar informacion y formulando preguntas cuando falten datos.

## Casos de prueba

1. Generacion con fuentes completas
   - Dado un Business Knowledge Package, Knowledge Package y Process Model validado.
   - Cuando se ejecuta "Construir Requirements Package".
   - Entonces se generan requerimientos con evidencia, confianza, documentos y entrevistas usadas.

2. Generacion sin Process Model validado
   - Dado que no existe validacion suficiente del proceso.
   - Cuando se ejecuta el consultor.
   - Entonces se genera una pregunta bloqueante sobre el Process Model.

3. Trazabilidad de requerimientos
   - Dado un requerimiento seleccionado.
   - Cuando se revisa el inspector o se solicita explicacion.
   - Entonces se muestran fuentes, fragmentos y nivel de confianza.

4. Respuesta a preguntas
   - Dada una pregunta abierta del consultor.
   - Cuando el usuario responde.
   - Entonces la respuesta queda registrada como evidencia humana.

5. Aprobacion humana
   - Dado un requerimiento en estado DRAFT.
   - Cuando el usuario lo aprueba.
   - Entonces pasa a HUMAN_APPROVED y queda disponible para Fit-Gap y RFP.

## Pruebas ejecutadas

- Validacion de sintaxis JavaScript con `node --check`.
- Prueba funcional local del servicio con fuentes simuladas:
  - Resultado: 10 requerimientos generados.
  - Estado: READY_FOR_REVIEW.
  - Confianza: HIGH_CONFIDENCE.

## Riesgos pendientes

- La persistencia actual es localStorage.
- La extraccion avanzada con IA real queda pendiente de configuracion backend/AIService.
- Fit-Gap y RFP todavia no consumen automaticamente el Requirements Package.
