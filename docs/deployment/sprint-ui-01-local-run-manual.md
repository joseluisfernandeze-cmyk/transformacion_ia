# Sprint UI-01 - Local Run Manual

## Objetivo

Ejecutar Process Transformation AI desde `index.html` y recorrer la metodologia desde el Application Shell navegable.

## Pasos

1. Abrir Visual Studio Code.
2. Abrir la carpeta `C:\Users\josh_\Documents\GitHub\transformacion_ia`.
3. Abrir `frontend/index.html` en el navegador.
4. Iniciar sesion en modo local.
5. Usar el sidebar para navegar entre:
   - Dashboard.
   - Proyectos.
   - Business Discovery.
   - Context Builder.
   - Process Discovery.
   - Process Modeling.
   - Process Validation.
   - Process Data Collection.
   - Intelligent VSM.
   - Transformation Workshop.
   - Methodology Orchestrator.
6. Las etapas futuras aparecen marcadas como `Proximamente`.

## Validacion esperada

- El header muestra el producto y version local.
- El sidebar permite cambiar de workspace.
- El breadcrumb cambia segun la ruta seleccionada.
- El Dashboard muestra proyecto actual, estado, avance, proximo paso, Health Score y ultima actualizacion.
- El footer permanece visible al final del workspace.

## Notas

- No se requiere `npm`.
- No se requieren librerias externas.
- La persistencia local sigue usando `localStorage`.
- Las rutas usan hash routing, por ejemplo `#/dashboard` o `#/process-validation`.
