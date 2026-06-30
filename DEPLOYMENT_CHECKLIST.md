# DEPLOYMENT CHECKLIST - Sprint INT-01

Fecha: 2026-06-30  
Producto: Process Transformation AI  
Plataforma objetivo: Operational Intelligence Platform  
Estado: listo para primer despliegue controlado

## 1. Pre requisitos

- Cuenta Google con permisos para crear Google Sheets, Google Drive y Apps Script.
- Acceso al repositorio GitHub oficial.
- Navegador actualizado.
- Visual Studio Code instalado.
- Proyecto local disponible en `C:\Users\josh_\Documents\GitHub\transformacion_ia`.
- No subir API Keys, tokens, credenciales ni archivos locales.

## 2. Verificacion del repositorio local

Ejecutar en PowerShell desde la raiz del proyecto:

```powershell
git status
git branch
git remote -v
```

Resultado esperado:

- Rama de trabajo: `develop`.
- Remoto `origin`: `https://github.com/joseluisfernandeze-cmyk/transformacion_ia.git`.
- Cambios del Sprint INT-01 listos para commit.

## 3. Frontend

Archivo principal:

- `frontend/index.html`

Validaciones obligatorias:

- La aplicacion abre desde navegador.
- El Dashboard carga.
- El Sidebar carga.
- El Workspace carga.
- Las rutas principales responden:
  - `#/dashboard`
  - `#/projects`
  - `#/business-discovery`
  - `#/context-builder`
  - `#/process-discovery`
  - `#/process-modeling`
  - `#/process-validation`
  - `#/process-data-collection`
  - `#/intelligent-vsm`
  - `#/transformation-workshop`
  - `#/lean-consultant`
  - `#/toc-consultant`
  - `#/automation-ai`
  - `#/to-be-designer`
  - `#/business-case`
  - `#/roadmap`
  - `#/executive-report`
  - `#/methodology-orchestrator`
- No hay errores de consola en una ejecucion limpia.

## 4. Backend Apps Script

Copiar a un proyecto Apps Script los archivos de:

- `backend/apps-script/Code.gs`
- `backend/apps-script/config/*.gs`
- `backend/apps-script/controllers/*.gs`
- `backend/apps-script/repositories/*.gs`
- `backend/apps-script/services/*.gs`
- `backend/apps-script/utils/*.gs`
- `backend/apps-script/validators/*.gs`

Orden recomendado de revision:

1. `utils`
2. `config`
3. `repositories`
4. `validators`
5. `services`
6. `controllers`
7. `Code.gs`

No crear rutas nuevas durante el despliegue.

## 5. Google Sheets

Crear un Google Sheet vacio para la base operativa.

En Apps Script ejecutar manualmente:

```javascript
initializeOperationalIntelligenceSheets("SPREADSHEET_ID");
```

Resultado esperado:

- Se crean o actualizan las hojas requeridas.
- Se crean encabezados.
- Se congelan encabezados.
- Se aplican validaciones basicas.
- No se crean datos ficticios.

## 6. Google Drive

En Apps Script ejecutar manualmente:

```javascript
initializeOperationalIntelligenceDrive("Operational Intelligence Platform");
```

Resultado esperado:

- Se crea o verifica la carpeta raiz.
- Se crea la estructura documental estandar.
- No se cargan archivos ficticios.

## 7. Configuracion IA

Configurar la hoja `AI_PROVIDERS` desde Google Sheets.

Campos obligatorios:

- `providerId`
- `providerCode`
- `providerName`
- `model`
- `apiKey`
- `temperature`
- `maxTokens`
- `isActive`
- `status`

Reglas:

- Solo un proveedor debe quedar activo para pruebas iniciales.
- La API Key nunca se configura en frontend.
- La API Key nunca se sube a GitHub.

## 8. Prompt Repository

Configurar las hojas:

- `PROMPTS`
- `AGENTS`

Reglas:

- Cada agente debe apuntar a un prompt activo.
- El frontend solicita `executeAgent`.
- El backend resuelve agente, prompt, proveedor y modelo.

## 9. Publicacion como Web App

En Apps Script:

1. Revisar permisos.
2. Guardar todos los archivos.
3. Ejecutar una funcion de prueba manual.
4. Publicar como Web App.
5. Definir acceso segun el MVP controlado.
6. Copiar la URL `/exec`.
7. Configurar `frontend/config/app-config.js` solo si se va a probar contra backend real.

## 10. Verificacion de API

Probar `doGet` desde la URL de Web App.

Resultado esperado:

```json
{
  "success": true,
  "data": {
    "app": "Process Transformation AI",
    "status": "OK"
  }
}
```

## 11. Verificacion final

- Frontend local ejecuta sin errores.
- Apps Script responde.
- Google Sheets inicializado.
- Google Drive inicializado.
- AI Providers configurado sin exponer claves.
- Documentacion actualizada.
- Commit preparado.

## 12. Comandos Git sugeridos

```powershell
git status
git add .
git commit -m "Sprint INT-01 Platform Integration and First Execution"
git push origin develop
```
