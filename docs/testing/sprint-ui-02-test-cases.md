# Sprint UI-02 - Casos de prueba

## TC-UI02-001 - Carga inicial

Condicion inicial: navegador sin datos previos o con `localStorage` existente.

Pasos:

1. Abrir `frontend/index.html`.
2. Verificar que carga el Application Shell.
3. Verificar que se muestra el Dashboard.

Resultado esperado:

- Header, Sidebar, Workspace, Breadcrumb, Footer y controles de flujo se visualizan correctamente.

## TC-UI02-002 - Crear proyecto

Pasos:

1. Ir a Gestion de Proyectos.
2. Escribir un nombre de proyecto.
3. Presionar Crear proyecto.

Resultado esperado:

- El proyecto queda seleccionado.
- El usuario navega a Business Discovery.
- El proyecto aparece luego en Dashboard como proyecto reciente.

## TC-UI02-003 - Guardar borrador

Pasos:

1. Entrar a Business Discovery.
2. Presionar Guardar borrador.
3. Recargar el navegador.

Resultado esperado:

- El borrador permanece en `localStorage`.
- El estado de la etapa se conserva como en progreso.

## TC-UI02-004 - Avanzar etapa

Pasos:

1. Entrar a Gestion de Proyectos.
2. Presionar Siguiente.
3. Entrar a Business Discovery.
4. Presionar Guardar borrador.
5. Presionar Siguiente.

Resultado esperado:

- Gestion de Proyectos queda completado.
- Business Discovery queda completado.
- Context Builder queda disponible.
- El porcentaje de avance aumenta.

## TC-UI02-005 - Bloqueo de etapa

Condicion inicial: limpiar `localStorage`.

Pasos:

1. Recargar la aplicacion.
2. Intentar abrir Process Discovery desde el sidebar.

Resultado esperado:

- La etapa no se abre como workspace funcional.
- Se muestra mensaje de etapa bloqueada.
- El mensaje indica que deben completarse etapas anteriores.

## TC-UI02-006 - Navegacion anterior

Pasos:

1. Llegar a Context Builder.
2. Presionar Anterior.

Resultado esperado:

- El usuario vuelve a Business Discovery.

## TC-UI02-007 - Continuar proyecto desde Dashboard

Pasos:

1. Crear proyecto.
2. Avanzar al menos una etapa.
3. Volver al Dashboard.
4. Presionar Continuar en el proyecto reciente.

Resultado esperado:

- El usuario abre la etapa actual del proyecto seleccionado.

## TC-UI02-008 - Rutas sin paginas huerfanas

Pasos:

1. Abrir cada ruta implementada desde el sidebar:
   - Dashboard;
   - Proyectos;
   - Business Discovery;
   - Context Builder;
   - Process Discovery;
   - Process Modeling;
   - Process Validation;
   - Process Data Collection;
   - Intelligent VSM;
   - Transformation Workshop.

Resultado esperado:

- Cada ruta abre dentro del Workspace.
- No se requiere abrir otro HTML.
- Las rutas futuras muestran Proximamente.

## TC-UI02-009 - Persistencia compatible

Pasos:

1. Guardar borrador en una etapa.
2. Inspeccionar `localStorage["operational-intelligence.mvp-navigation"]`.

Resultado esperado:

- Existe `currentProjectId`.
- Existe arreglo `projects`.
- Cada proyecto tiene `stages`.
- Cada borrador tiene `projectId`, `stageId`, `route`, `status`, `payload` y `savedAt`.
