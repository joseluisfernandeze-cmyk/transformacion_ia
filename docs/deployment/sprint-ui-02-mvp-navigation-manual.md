# Sprint UI-02 - Manual de prueba local

## Objetivo

Validar que Process Transformation AI puede recorrerse como MVP navegable desde `frontend/index.html`, usando persistencia temporal en `localStorage` y sin requerir backend Apps Script activo.

## Requisitos

- Visual Studio Code.
- Navegador moderno.
- Repositorio local en `C:\Users\josh_\Documents\GitHub\transformacion_ia`.
- No se requiere npm.
- No se requieren frameworks.
- No se requiere despliegue de Google Apps Script.

## Ejecucion desde VS Code

1. Abrir VS Code.
2. Abrir la carpeta `C:\Users\josh_\Documents\GitHub\transformacion_ia`.
3. Abrir `frontend/index.html`.
4. Ejecutar con una de estas opciones:
   - abrir el archivo directamente en el navegador;
   - usar una extension local de servidor estatico si esta disponible.
5. Confirmar que aparece la pantalla principal de Process Transformation AI.

## Flujo de prueba recomendado

1. Ingresar al Dashboard.
2. Abrir Gestion de Proyectos.
3. Crear un proyecto MVP.
4. Avanzar a Business Discovery.
5. Guardar borrador.
6. Presionar Siguiente.
7. Repetir guardar borrador y Siguiente en:
   - Context Builder;
   - Process Discovery;
   - Process Modeling;
   - Process Validation;
   - Process Data Collection;
   - Intelligent VSM;
   - Transformation Workshop.
8. Volver al Dashboard.
9. Confirmar que el proyecto aparece en Proyectos recientes.
10. Confirmar que el porcentaje de avance cambia.

## Validacion de bloqueo

1. Limpiar `localStorage` del navegador.
2. Recargar `frontend/index.html`.
3. Intentar abrir directamente Process Discovery desde el sidebar.
4. Confirmar que la plataforma muestra la etapa bloqueada.
5. Completar o guardar borrador de las etapas previas.
6. Confirmar que la etapa se desbloquea al avanzar.

## Persistencia temporal

La persistencia se guarda en:

`localStorage["operational-intelligence.mvp-navigation"]`

La estructura conserva:

- proyecto activo;
- proyectos recientes;
- etapa actual;
- estado por etapa;
- borradores por etapa;
- porcentaje de avance;
- fecha de ultima modificacion.

Esta persistencia es temporal y esta encapsulada para reemplazarse posteriormente por Apps Script.

## Resultado esperado

El usuario debe poder recorrer toda la metodologia implementada desde el navegador sin editar archivos manualmente y sin paginas huerfanas.
