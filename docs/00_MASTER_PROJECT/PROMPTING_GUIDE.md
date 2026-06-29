# PROMPTING GUIDE

## 1. Uso previsto

Este documento guia a futuras conversaciones con IA para continuar el proyecto sin perder contexto.

## 2. Prompt inicial recomendado

```text
Actua como Lead Software Architect y Lead Developer de Operational Intelligence Platform.
Lee primero docs/00_MASTER_PROJECT.
No redisenes la arquitectura Core.
No implementes funcionalidades no solicitadas.
Usa los patrones existentes del repositorio.
Trabaja solo en C:\Users\josh_\Documents\GitHub\transformacion_ia.
```

## 3. Contexto obligatorio para cualquier IA

Antes de desarrollar:

- Leer `MASTER_PROJECT_CONTEXT.md`.
- Leer `ARCHITECTURE.md`.
- Leer `METHODOLOGY.md`.
- Leer `CODING_STANDARDS.md`.
- Revisar `SPRINT_HISTORY.md`.

## 4. Reglas de implementacion

Indicar siempre:

- Archivos creados.
- Archivos modificados.
- Archivos eliminados.
- Pruebas realizadas.
- Riesgos.
- Pendientes.
- Commit sugerido.

## 5. Plantilla para Sprint

```text
# Sprint XX - Nombre

La arquitectura del Core permanece congelada.
No crear nuevos componentes Core.
No modificar arquitectura.

Objetivo:

Alcance:

Restricciones:

Entregables:
```

## 6. Prompt para revisar estado

```text
Revisa git status, rg --files y docs/00_MASTER_PROJECT.
Indica el estado real antes de modificar.
No hagas cambios todavia.
```

## 7. Prompt para implementar

```text
Implementa unicamente el Sprint solicitado.
Usa patrones module-service, module-renderer, module-controller.
No agregues dependencias externas.
No uses npm.
Valida con node --check.
Actualiza documentacion oficial si el Sprint lo solicita.
```

## 8. Prompt para documentar

```text
Actualiza docs/00_MASTER_PROJECT con el estado real.
No modifiques codigo.
No resumas decisiones.
Incluye impacto, roadmap y pendientes.
```

## 9. Reglas para agentes IA

Los agentes deben:

- Consumir Knowledge Package si existe.
- Consumir Context Graph si existe.
- Pedir aclaraciones si falta informacion.
- Retornar JSON estandarizado.
- Incluir evidencia.
- Incluir confianza.

## 10. Prohibiciones de prompt

No pedir a la IA:

- Redisenar arquitectura Core sin autorizacion.
- Saltar etapas metodologicas.
- Generar recomendaciones sin evidencia.
- Implementar modulos futuros por anticipado.
- Introducir frameworks.
