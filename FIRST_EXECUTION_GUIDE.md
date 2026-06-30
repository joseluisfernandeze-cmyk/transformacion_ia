# FIRST EXECUTION GUIDE

Guia para ejecutar por primera vez Process Transformation AI.

Esta guia esta pensada para una persona sin conocimientos tecnicos avanzados. Siga los pasos en orden y no configure claves o credenciales dentro del frontend.

## 1. Crear Google Sheets

1. Abra Google Drive.
2. Cree una hoja de calculo nueva.
3. Nombre sugerido: `Operational Intelligence Platform - Data`.
4. Copie el ID del archivo desde la URL.

Ejemplo de URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

El valor que debe conservar es `SPREADSHEET_ID`.

## 2. Crear Google Drive

1. Abra Google Drive.
2. No cree manualmente toda la estructura.
3. La estructura se creara desde Apps Script con una funcion incluida en el proyecto.

Carpeta raiz sugerida:

```text
Operational Intelligence Platform
```

## 3. Crear Apps Script

1. Abra [script.google.com](https://script.google.com).
2. Cree un proyecto nuevo.
3. Nombre sugerido: `Process Transformation AI Backend`.
4. Copie los archivos `.gs` desde `backend/apps-script` manteniendo sus nombres.
5. Copie primero utilidades y configuracion, luego repositorios, servicios, controladores y finalmente `Code.gs`.

Carpetas locales de referencia:

- `backend/apps-script/config`
- `backend/apps-script/controllers`
- `backend/apps-script/repositories`
- `backend/apps-script/services`
- `backend/apps-script/utils`
- `backend/apps-script/validators`

## 4. Inicializar Google Sheets

En Apps Script, abra el editor y ejecute:

```javascript
initializeOperationalIntelligenceSheets("SPREADSHEET_ID");
```

Reemplace `SPREADSHEET_ID` por el ID real de su Google Sheet.

La funcion creara las hojas necesarias, encabezados y validaciones basicas. No insertara informacion ficticia.

## 5. Inicializar Google Drive

En Apps Script ejecute:

```javascript
initializeOperationalIntelligenceDrive("Operational Intelligence Platform");
```

La funcion creara la estructura documental base para proyectos, evidencias, paquetes de conocimiento, VSM, casos de negocio, roadmaps y reportes.

## 6. Configurar IA

Abra la hoja `AI_PROVIDERS`.

Registre un proveedor activo. Ejemplo de campos:

- `providerId`: `PROV-001`
- `providerCode`: `OPENAI`, `CLAUDE`, `GEMINI`, `DEEPSEEK` o `CUSTOM`
- `providerName`: nombre visible del proveedor
- `model`: modelo a utilizar
- `baseUrl`: URL solo si aplica
- `apiKey`: clave del proveedor
- `temperature`: por ejemplo `0.2`
- `maxTokens`: por ejemplo `1200`
- `isActive`: `TRUE`
- `status`: `ACTIVE`

Importante:

- La API Key nunca debe escribirse en `frontend/config/app-config.js`.
- La API Key nunca debe subirse a GitHub.
- La configuracion IA se lee desde Apps Script y Google Sheets.

## 7. Configurar prompts y agentes

Abra las hojas:

- `PROMPTS`
- `AGENTS`

Registre los prompts y agentes que desee probar. Para la primera ejecucion puede dejar esta configuracion pendiente si solo validara navegacion frontend.

## 8. Publicar Web App

En Apps Script:

1. Haga clic en `Deploy`.
2. Seleccione `New deployment`.
3. Elija tipo `Web app`.
4. Configure quien puede ejecutar la aplicacion segun el piloto.
5. Publique.
6. Copie la URL que termina en `/exec`.

## 9. Probar backend

Abra la URL `/exec` en el navegador.

Debe ver una respuesta JSON indicando que el backend esta disponible.

## 10. Ejecutar index.html

Opcion simple desde VS Code:

1. Abra VS Code.
2. Abra la carpeta `C:\Users\josh_\Documents\GitHub\transformacion_ia`.
3. Abra una terminal en VS Code.
4. Ejecute:

```powershell
cd frontend
python -m http.server 4183 --bind 127.0.0.1
```

5. Abra en el navegador:

```text
http://127.0.0.1:4183/index.html
```

## 11. Ejecutar primer proyecto

1. Ingrese al Dashboard.
2. Abra Gestion de Proyectos.
3. Cree o continue un proyecto local.
4. Recorra el flujo:
   - Business Discovery
   - Context Builder
   - Process Discovery
   - Process Modeling
   - Process Validation
   - Process Data Collection
   - Intelligent VSM
   - Transformation Workshop
5. Revise el Methodology Orchestrator para validar avance, bloqueos y estado.

## 12. Criterios de exito

La primera ejecucion es exitosa cuando:

- El frontend carga desde `index.html`.
- El Dashboard se visualiza.
- El Sidebar permite navegar.
- Las pantallas abren dentro del Workspace.
- El backend responde por `doGet`.
- Las hojas se crearon correctamente.
- La estructura Drive se creo correctamente.
- No se expusieron credenciales en GitHub ni en frontend.
