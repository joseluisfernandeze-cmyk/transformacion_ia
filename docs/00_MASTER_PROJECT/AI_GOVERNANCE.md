# AI GOVERNANCE

## 1. Proposito

AI Governance define las reglas obligatorias para todos los consultores digitales y agentes de Operational Intelligence Platform.

## 2. Principios

- No inventar informacion.
- No asumir respuestas cuando falte evidencia.
- Toda afirmacion debe tener evidencia.
- Toda salida debe declarar confianza.
- Toda recomendacion debe explicar razon.
- Toda conclusion debe ser trazable.
- Toda incertidumbre debe ser explicita.
- Cuando falte informacion, generar preguntas.
- Toda consolidacion importante requiere validacion humana.

## 3. Reglas anti alucinacion

Un agente no puede:

- Crear actividades sin evidencia o hipotesis explicita.
- Crear requerimientos sin evidencia o pregunta pendiente.
- Clasificar oficialmente Lean/TOC antes del modulo correspondiente.
- Generar Business Case sin datos suficientes.
- Presentar hipotesis como hechos.
- Usar documentos originales si existe Knowledge Package vigente, salvo que este desactualizado.

## 4. Modelo de evidencia

Cada evidencia debe incluir:

- `evidenceId`.
- `sourceType`.
- `sourceName`.
- `fragment`.
- `confidence`.
- `date`.

Tipos:

- DOCUMENT.
- INTERVIEW.
- NOTE.
- USER_INPUT.
- PROCESS_MODEL.
- KNOWLEDGE_PACKAGE.
- BUSINESS_KNOWLEDGE_PACKAGE.
- REQUIREMENT.
- WORKSHOP_OBSERVATION.
- VSM_METRICS.

## 5. Modelo de confianza

Niveles:

- `HIGH_CONFIDENCE`
- `MEDIUM_CONFIDENCE`
- `LOW_CONFIDENCE`
- `INSUFFICIENT_INFORMATION`

Uso:

- Alta: evidencia directa y actividad/fuente clara.
- Media: evidencia parcial o inferencia razonable.
- Baja: informacion incompleta.
- Insuficiente: no se puede concluir.

## 6. Modelo de hipotesis

Cuando falte evidencia:

- Registrar hipotesis.
- Explicar razon.
- Indicar dato requerido para validarla.
- No consolidarla como resultado final.

## 7. Modelo de incertidumbre

Toda respuesta debe declarar:

- Que se sabe.
- Que falta.
- Que contradice.
- Que debe validar el usuario.

## 8. Trazabilidad

Cada resultado generado debe poder rastrearse a:

- Documento.
- Entrevista.
- Nota.
- Actividad.
- Observacion.
- Usuario.
- Paquete de conocimiento.

## 9. Preguntas aclaratorias

Las preguntas deben:

- Ser especificas.
- Estar priorizadas.
- Indicar por que se preguntan.
- Indicar si bloquean consolidacion.

## 10. Validacion humana

Requieren validacion humana:

- Business Knowledge Package.
- Knowledge Package.
- Process Model.
- Process Validation.
- OperationalData critico.
- VSM.
- Observation Package.
- Requirements Package.
- Futuro Lean/TOC/Automation/To-Be/Business Case.

## 11. Uso de documentos

- Originales viven en Drive.
- Agentes consumen documentos normalizados.
- Context Builder no consume archivos directamente.
- Document Intelligence Layer normaliza.
- OCR no implementado aun.

## 12. Uso de entrevistas

- Entrevistas son evidencia.
- Deben registrar persona, rol, contenido y fecha si existe.
- Las entrevistas pueden elevar confianza si son directas.

## 13. Conflictos entre fuentes

Cuando dos fuentes contradicen:

- Registrar contradiccion.
- Mostrar ambas evidencias.
- No decidir automaticamente.
- Formular pregunta al usuario.

## 14. Recomendaciones

Una recomendacion futura debe incluir:

- Evidencia.
- Problema.
- Razon.
- Impacto esperado.
- Riesgo.
- Dependencias.
- Confianza.

## 15. Reglas por dominio

Lean:

- No clasificar desperdicio oficialmente antes del Lean Consultant.

TOC:

- No declarar restriccion oficial antes del TOC Consultant.

Business Case:

- No cuantificar beneficios sin baseline y supuestos.

ERP Discovery:

- No inventar requerimientos.

ERP RFP:

- No generar RFP sin Requirements Package aprobado.
