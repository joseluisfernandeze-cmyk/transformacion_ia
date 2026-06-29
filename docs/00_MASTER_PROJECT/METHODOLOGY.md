# METHODOLOGY

## 1. Metodologia oficial

La metodologia de Process Transformation AI se ejecuta en etapas coordinadas por el Methodology Orchestrator.

El Orchestrator no analiza, no ejecuta IA y no produce recomendaciones. Solo administra secuencia, aprobaciones, bloqueos y estado del caso.

## 2. Flujo oficial

1. Business Discovery.
2. Context Builder.
3. Process Discovery.
4. Process Modeling.
5. Process Validation.
6. Process Data Collection.
7. Intelligent VSM.
8. Transformation Workshop.
9. Lean Consultant futuro.
10. TOC Consultant futuro.
11. Automation & AI Consultant futuro.
12. To-Be Designer futuro.
13. Business Case futuro.
14. Roadmap futuro.
15. Executive Report futuro.

## 3. Etapa 1 - Business Discovery

Objetivo:

- Comprender la organizacion antes de analizar procesos.

Captura:

- Organizacion.
- Industria.
- Pais.
- Ciudades.
- Plantas.
- Centros de distribucion.
- Oficinas.
- Colaboradores.
- Productos.
- Servicios.
- Clientes.
- Canales.
- Objetivos estrategicos.
- Estructura.
- Sistemas.
- Objetivo del proyecto.
- Documentacion.

Salida:

- Business Knowledge Package.

## 4. Etapa 2 - Context Builder

Objetivo:

- Construir conocimiento estructurado del proyecto.

Consume:

- Documentos normalizados.
- Entrevistas.
- Notas.
- Business Knowledge Package.

Salida:

- Knowledge Package.
- Context Graph.

Decision:

- El Context Builder Agent no consume archivos directamente.
- Consume documentos normalizados por Document Intelligence Layer.

## 5. Etapa 3 - Process Discovery

Objetivo:

- Construir borrador As-Is desde paquetes de conocimiento y evidencia.

Salida:

- Draft Process Model.
- Actividades.
- Secuencia.
- Responsables.
- Entradas.
- Salidas.
- Sistemas.
- Decisiones.
- Reglas.
- Evidencia.
- Confianza por actividad.

Regla:

- No inventar actividades.
- Si falta informacion, preguntar.

## 6. Etapa 4 - Process Modeling

Objetivo:

- Validar y editar visualmente el proceso As-Is.

Permite:

- Mover actividades.
- Agregar actividades.
- Eliminar actividades.
- Dividir actividades.
- Unir actividades.
- Cambiar responsables.
- Agregar sistemas, documentos, reglas, decisiones y observaciones.

Salida:

- Process Model editable y trazable.

## 7. Etapa 5 - Process Validation

Objetivo:

- Validar que el proceso es apto para analisis posteriores.

Valida:

- Actividad inicial.
- Actividad final.
- Responsables.
- Areas.
- Entradas.
- Salidas.
- Sistemas.
- Documentos.
- Reglas.
- Decisiones.
- Evidencia.
- Confianza.
- Duplicados.
- Ciclos.
- Actividades sin conexion.
- Contradicciones.
- Informacion faltante.

Salida:

- Health Score.
- Clasificacion.
- Bloqueos.

## 8. Etapa 6 - Process Data Collection

Objetivo:

- Capturar informacion operacional por actividad.

Captura:

- Responsable.
- Area.
- Cargo.
- Sistema.
- Documento.
- Frecuencia.
- Tiempo minimo.
- Tiempo probable.
- Tiempo maximo.
- VA/NNVA/NVA.
- Esperas.
- Recursos.
- Volumen.
- Riesgos.
- Indicadores.

Salida:

- Process Model enriquecido con `operationalData`.

## 9. Etapa 7 - Intelligent VSM

Objetivo:

- Generar VSM vivo desde Process Model enriquecido.

Muestra:

- Actividades.
- Secuencia.
- Responsable.
- Area.
- Sistema.
- Documentos.
- Tiempos.
- Lead Time.
- Process Time.
- Touch Time.
- Waiting Time.
- VA/NNVA/NVA.
- Indicadores.
- Recursos.
- Riesgos.

Salida:

- `vsmData` sincronizado con actividades.

## 10. Etapa 8 - Transformation Workshop

Objetivo:

- Capturar observaciones del taller antes del diagnostico automatico.

Registra:

- Problemas observados.
- Desperdicios percibidos.
- Retrabajos.
- Esperas.
- Riesgos.
- Ideas de mejora.
- Automatizaciones sugeridas.
- Uso de IA sugerido.
- Comentarios.
- Evidencias adicionales.
- Fotografias.
- Documentos.
- Enlaces.
- Notas.
- Referencias a voz para versiones futuras.

Salida:

- Transformation Observation Package.

Restriccion:

- No clasifica oficialmente desperdicios Lean.
- No calcula restricciones TOC.
- No genera recomendaciones automaticas.

## 11. Methodology Orchestrator

Objetivo:

- Coordinar el flujo metodologico.

Salida:

- Project Transformation Status.

Administra:

- Etapa actual.
- Avance.
- Etapas completadas.
- Etapas pendientes.
- Bloqueos.
- Informacion faltante.
- Health Score.
- Fecha de actualizacion.
- Consultor responsable.
- Aprobaciones.

Reglas:

- No aprobar etapa con bloqueos.
- No aprobar etapa posterior si una obligatoria anterior no esta aprobada.
- Registrar aprobador, fecha y comentarios.
- Mostrar etapas futuras como `FUTURE`.

## 12. Etapas futuras

Lean Consultant:

- Usara VSM y Transformation Observation Package.
- Clasificara desperdicios Lean formalmente.

TOC Consultant:

- Detectara restricciones, dependencias y cuellos de botella.

Automation & AI Consultant:

- Identificara oportunidades de automatizacion e IA.

To-Be Designer:

- Construira proceso futuro.

Business Case:

- Cuantificara beneficios.

Roadmap:

- Secuenciara iniciativas.

Executive Report:

- Generara reporte ejecutivo final.
