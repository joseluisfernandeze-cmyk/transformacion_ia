# CODING STANDARDS

## 1. Principios

- Modularidad.
- Reutilizacion.
- SOLID.
- Clean Code.
- Separacion de responsabilidades.
- No romper funcionalidades existentes.
- Sin dependencias externas salvo aprobacion.

## 2. Frontend

Tecnologia:

- HTML.
- CSS.
- JavaScript.

Patron por modulo:

```text
module/
  module-service.js
  module-renderer.js
  module-controller.js
```

Service:

- Estado.
- Logica local.
- Transformaciones.
- Persistencia local.

Renderer:

- HTML.
- Escape de valores.
- Sin logica pesada.

Controller:

- Eventos.
- `init`.
- Coordinacion UI.

## 3. Global namespace

Los modulos usan `window.ModuleName`.

Ejemplos:

- `window.BusinessDiscoveryService`.
- `window.ProcessDiscoveryController`.
- `window.MethodologyOrchestratorRenderer`.

## 4. Persistencia local

Usar `localStorage` con claves namespaced:

```text
operational-intelligence.module-name
```

## 5. CSS

Archivos:

- `main.css`
- `layout.css`
- `components.css`
- `responsive.css`

Reglas:

- Reutilizar clases existentes.
- Evitar estilos inline salvo posiciones dinamicas de canvas.
- Mantener responsive.
- Evitar componentes visuales que dependan de frameworks.

## 6. Backend Apps Script

Estructura:

- Controllers.
- Services.
- Repositories.
- Validators.
- Utils.
- Config.

Reglas:

- Controllers reciben solicitudes.
- Services contienen reglas.
- Repositories acceden Sheets.
- Validators validan payloads.
- Utils estandarizan respuesta y errores.

## 7. Respuestas API

Formato esperado:

- `success`.
- `message`.
- `data`.
- `errors`.
- `meta`.

## 8. Seguridad

- No API keys en frontend.
- No tokens en repo.
- No credenciales.
- No archivos `.env`.
- No logs.

## 9. Git

Flujo:

```text
feature/sprint-XX
develop
main
tag v0.X.X
```

Commits sugeridos:

```text
Sprint XX - Short description
```

## 10. Pruebas

Minimo:

- `node --check` para JS.
- Prueba funcional local con datos simulados cuando aplique.
- Test plan en `docs/testing`.

## 11. Prohibiciones

- No npm.
- No frameworks.
- No librerias externas.
- No redisenar Core.
- No duplicar Process Model.
- No crear nuevos componentes Core sin autorizacion.
