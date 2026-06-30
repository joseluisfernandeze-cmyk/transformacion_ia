# PB12A - Casos de prueba metodologicos

## TC-PB12A-001 - Framework disponible

Pasos:

1. Abrir `frontend/index.html`.
2. Verificar que se carga `frontend/shared/services/consulting-decision-framework.js`.

Resultado esperado:

- Existe `window.ConsultingDecisionFramework`.
- Expone `frameworkId`.
- Expone `version`.
- Expone nueve etapas.

## TC-PB12A-002 - Nueve etapas obligatorias

Pasos:

1. Inspeccionar `window.ConsultingDecisionFramework.stages`.

Resultado esperado:

- Contiene:
  - Comprender;
  - Validar;
  - Diagnosticar;
  - Cuantificar;
  - Proponer;
  - Justificar;
  - Estimar;
  - Advertir;
  - Preguntar.

## TC-PB12A-003 - Evidencia insuficiente bloquea conclusion

Pasos:

1. Ejecutar `createDecisionTrace` sin evidencia.

Resultado esperado:

- `canConclude` es `false`.
- `conclusionPolicy` es `ASK_BEFORE_CONCLUSION`.
- `confidence` es `INSUFFICIENT_INFORMATION`.
- Las etapas posteriores a Validar quedan bloqueadas por evidencia insuficiente.

## TC-PB12A-004 - Evidencia suficiente permite conclusion

Pasos:

1. Ejecutar `createDecisionTrace` con evidencia de confianza media o alta.
2. No incluir preguntas bloqueantes.

Resultado esperado:

- `canConclude` es `true`.
- `conclusionPolicy` es `CONCLUSION_ALLOWED`.
- `confidence` es al menos `MEDIUM_CONFIDENCE`.

## TC-PB12A-005 - Pregunta bloqueante impide conclusion

Pasos:

1. Ejecutar `createDecisionTrace` con evidencia.
2. Incluir una pregunta con `blocksConclusion` o `blocksConsolidation`.

Resultado esperado:

- `canConclude` es `false`.
- El framework exige preguntar antes de concluir.

## TC-PB12A-006 - Integracion preparada con Lean Consultant

Pasos:

1. Ejecutar Lean Transformation Consultant.
2. Revisar el `Lean Assessment Package`.

Resultado esperado:

- El paquete contiene `decisionTrace`.
- Cada diagnostico de actividad contiene `decisionTrace`.
- Las preguntas se generan mediante el contrato comun cuando el framework esta disponible.

## TC-PB12A-007 - Sin interfaces nuevas

Pasos:

1. Revisar navegacion principal.
2. Revisar rutas en `frontend/assets/js/app.js`.

Resultado esperado:

- No existe una nueva pantalla para PB12A.
- No existe ruta dedicada al framework.
- El flujo del usuario no cambia.
