# DECISIONS LOG

Fecha de creacion: 2026-06-30

Este documento registra decisiones tecnicas y funcionales relevantes del proyecto.

## 2026-06-30 - Congelamiento temporal del desarrollo funcional

Decision:

El desarrollo funcional queda temporalmente congelado hasta finalizar la fase `Integration & Validation`.

Motivo:

La primera fase de infraestructura fue completada y el riesgo principal ahora es validar la ejecucion real end-to-end del MVP.

Impacto:

- No se agregan nuevas funcionalidades.
- Solo se corrigen bugs de integracion.
- El foco pasa a pruebas `Frontend -> Apps Script -> Google Sheets -> Google Drive`.

## 2026-06-30 - URL oficial DEV registrada

Decision:

Registrar la URL oficial DEV en `APP_CONFIG.API.BASE_URL`.

URL:

```text
https://script.google.com/macros/s/AKfycbyhjHHkkYjNiKvJkpdgwqS3IagrBIprTi-RxWEx5z-HNlvaQS6c4fYAd-YDx0EZMUqR/exec
```

Motivo:

El frontend debe consumir el backend publicado en Apps Script desde una configuracion centralizada.

Impacto:

- Se evita hardcodear URLs en modulos.
- Se prepara la configuracion multiambiente.

## 2026-06-30 - Configuracion multiambiente del frontend

Decision:

`app-config.js` adopta estructura multiambiente con:

- `APP_NAME`
- `VERSION`
- `ENVIRONMENT`
- `API.BASE_URL`
- `API.TIMEOUT`
- `FEATURES`

Motivo:

Preparar el frontend para DEV y futuros ambientes sin dispersar configuracion.

Impacto:

- Los modulos deben consumir la configuracion desde `APP_CONFIG`.
- Se corrigio `app-shell.js` para leer `APP_NAME`, `VERSION` y `ENVIRONMENT`.

## 2026-06-30 - Google Drive con carpeta padre configurable

Decision:

`initializeOperationalIntelligenceDrive(parentFolderId)` debe crear `Process Transformation AI` dentro de la carpeta padre recibida por ID.

Motivo:

Evitar crear la estructura en la raiz cuando el usuario necesita ubicarla dentro de una carpeta especifica.

Regla:

Si `parentFolderId` existe:

```javascript
DriveApp.getFolderById(parentFolderId)
```

Si `parentFolderId` no existe:

```javascript
DriveApp.getRootFolder()
```

Impacto:

- Nunca se debe crear una carpeta cuyo nombre sea el ID de la carpeta padre.
- La estructura documental queda dentro de una ubicacion controlada.

## 2026-06-30 - Bug corregido: parentFolderId tratado como nombre

Bug:

`DriveDeploymentService` interpretaba `parentFolderId` como nombre de carpeta.

Estado:

Corregido.

Impacto:

La carpeta raiz `Process Transformation AI` ahora se crea dentro de la carpeta padre correcta.

## 2026-06-30 - Bug corregido: app-shell con nombres legacy

Bug:

`app-shell.js` utilizaba `config.appName` y `config.appVersion`, mientras `APP_CONFIG` utiliza `APP_NAME` y `VERSION`.

Estado:

Corregido.

Impacto:

La interfaz ya no muestra `undefined` ni `undefined - vundefined`.

## 2026-06-30 - Google Sheets inicializado

Decision:

Google Sheets queda como base operativa inicial del MVP.

Estado:

- Inicializado correctamente.
- 29 hojas creadas automaticamente.

Impacto:

La siguiente fase debe validar lectura y escritura real desde Apps Script.

## 2026-06-30 - Apps Script y Clasp operativos

Decision:

Apps Script queda como backend oficial del MVP y Clasp como mecanismo operativo de conexion/despliegue.

Estado:

- Apps Script creado.
- Clasp configurado y operativo.
- Backend desplegado.
- Web App publicada.

Impacto:

La siguiente prioridad es validar contratos reales desde frontend.
