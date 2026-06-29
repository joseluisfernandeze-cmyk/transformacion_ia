window.MvpNavigationStore = Object.seal({
  storageKey: "operational-intelligence.mvp-navigation",

  stages: [
    { route: "dashboard", label: "Dashboard", required: false },
    { route: "projects", label: "Gestion de Proyectos", required: true },
    { route: "business-discovery", label: "Business Discovery", required: true },
    { route: "context-builder", label: "Context Builder", required: true },
    { route: "process-discovery", label: "Process Discovery", required: true },
    { route: "process-modeling", label: "Process Modeling", required: true },
    { route: "process-validation", label: "Process Validation", required: true },
    { route: "process-data-collection", label: "Process Data Collection", required: true },
    { route: "intelligent-vsm", label: "Intelligent VSM", required: true },
    { route: "transformation-workshop", label: "Transformation Workshop", required: true },
    { route: "lean-consultant", label: "Lean Consultant", required: true }
  ],

  loadState() {
    try {
      const rawState = window.localStorage.getItem(this.storageKey);
      return this.normalizeState(rawState ? JSON.parse(rawState) : this.createInitialState());
    } catch (error) {
      return this.createInitialState();
    }
  },

  saveState(state) {
    const normalized = this.normalizeState(state);
    window.localStorage.setItem(this.storageKey, JSON.stringify(normalized));
    return normalized;
  },

  createInitialState() {
    const project = this.createProject("Proyecto de transformacion");

    return {
      currentProjectId: project.projectId,
      projects: [project],
      updatedAt: new Date().toISOString()
    };
  },

  createProject(name) {
    const now = new Date().toISOString();

    return {
      projectId: `PRJ-${Date.now()}`,
      name: name || "Proyecto de transformacion",
      status: "IN_PROGRESS",
      currentRoute: "projects",
      currentStageIndex: 1,
      progressPercentage: 0,
      lastModifiedAt: now,
      stages: this.stages.reduce((accumulator, stage, index) => {
        accumulator[stage.route] = {
          stageId: stage.route.toUpperCase().replace(/-/g, "_"),
          route: stage.route,
          label: stage.label,
          status: index <= 1 ? "AVAILABLE" : "LOCKED",
          draftSavedAt: "",
          completedAt: "",
          validationMessage: ""
        };
        return accumulator;
      }, {}),
      drafts: {}
    };
  },

  normalizeState(state) {
    const baseState = this.createInitialState();
    const projects = Array.isArray(state.projects) && state.projects.length ? state.projects : baseState.projects;

    return {
      ...baseState,
      ...state,
      currentProjectId: state.currentProjectId || projects[0].projectId,
      projects: projects.map((project) => this.normalizeProject(project)),
      updatedAt: state.updatedAt || new Date().toISOString()
    };
  },

  normalizeProject(project) {
    const baseProject = this.createProject(project.name);
    const stages = { ...baseProject.stages, ...(project.stages || {}) };

    this.stages.forEach((stage, index) => {
      stages[stage.route] = {
        ...baseProject.stages[stage.route],
        ...(stages[stage.route] || {}),
        status: this.resolveStageStatus(project, stage.route, index, stages)
      };
    });

    const progressPercentage = this.calculateProgress(stages);
    const currentStageIndex = this.resolveCurrentStageIndex(project.currentRoute, stages);

    return {
      ...baseProject,
      ...project,
      stages,
      drafts: project.drafts || {},
      progressPercentage,
      currentStageIndex,
      currentRoute: project.currentRoute || this.stages[currentStageIndex].route,
      lastModifiedAt: project.lastModifiedAt || new Date().toISOString()
    };
  },

  resolveStageStatus(project, route, index, stages) {
    const existing = stages[route] || {};

    if (route === "dashboard") {
      return "AVAILABLE";
    }

    if (existing.completedAt || existing.status === "COMPLETED") {
      return "COMPLETED";
    }

    const previousStage = this.stages[index - 1];
    const previousCompleted = !previousStage || previousStage.route === "dashboard" || (stages[previousStage.route] && stages[previousStage.route].completedAt);

    if (!previousCompleted) {
      return "LOCKED";
    }

    if (project.currentRoute === route || existing.draftSavedAt) {
      return "IN_PROGRESS";
    }

    return "AVAILABLE";
  },

  getActiveProject(state) {
    return state.projects.find((project) => project.projectId === state.currentProjectId) || state.projects[0];
  },

  addProject(state, name) {
    const project = this.createProject(name);
    state.projects.unshift(project);
    state.currentProjectId = project.projectId;
    state.updatedAt = new Date().toISOString();
    return this.saveState(state);
  },

  selectProject(state, projectId) {
    const project = state.projects.find((item) => item.projectId === projectId);

    if (project) {
      state.currentProjectId = project.projectId;
      project.lastModifiedAt = new Date().toISOString();
      state.updatedAt = project.lastModifiedAt;
    }

    return this.saveState(state);
  },

  canAccessRoute(state, route) {
    if (route === "dashboard") {
      return { allowed: true, message: "" };
    }

    const project = this.getActiveProject(state);
    const stage = project.stages[route];

    if (!stage) {
      return { allowed: true, message: "" };
    }

    if (stage.status === "LOCKED") {
      const previous = this.getPreviousStage(route);
      return {
        allowed: false,
        message: previous ? `Completa primero ${previous.label}.` : "La etapa esta bloqueada."
      };
    }

    return { allowed: true, message: "" };
  },

  saveDraft(state, route) {
    const project = this.getActiveProject(state);
    const now = new Date().toISOString();
    const stage = project.stages[route] || null;

    if (!stage) {
      return this.saveState(state);
    }

    stage.status = stage.completedAt ? "COMPLETED" : "IN_PROGRESS";
    stage.draftSavedAt = now;
    stage.validationMessage = "";
    project.currentRoute = route;
    project.currentStageIndex = this.resolveCurrentStageIndex(route, project.stages);
    project.lastModifiedAt = now;
    project.drafts[route] = {
      draftId: `DRF-${Date.now()}`,
      projectId: project.projectId,
      stageId: stage.stageId,
      route,
      status: "DRAFT",
      payload: this.buildStagePayload(route),
      savedAt: now
    };
    this.unlockNextStage(project, route, false);
    return this.saveState(state);
  },

  completeStage(state, route) {
    const project = this.getActiveProject(state);
    const stage = project.stages[route];
    const validation = this.validateStage(project, route);

    if (!stage || !validation.valid) {
      if (stage) {
        stage.validationMessage = validation.message;
      }
      return {
        state: this.saveState(state),
        success: false,
        message: validation.message
      };
    }

    const now = new Date().toISOString();
    stage.status = "COMPLETED";
    stage.completedAt = now;
    stage.validationMessage = "";
    project.currentRoute = route;
    project.currentStageIndex = this.resolveCurrentStageIndex(route, project.stages);
    project.lastModifiedAt = now;
    this.unlockNextStage(project, route, true);
    project.progressPercentage = this.calculateProgress(project.stages);

    return {
      state: this.saveState(state),
      success: true,
      message: "Etapa completada.",
      nextRoute: this.getNextRoute(route)
    };
  },

  validateStage(project, route) {
    if (route === "dashboard") {
      return { valid: true, message: "" };
    }

    if (route === "projects") {
      return project && project.projectId ? { valid: true, message: "" } : { valid: false, message: "Crea o selecciona un proyecto antes de avanzar." };
    }

    if (project.drafts && project.drafts[route]) {
      return { valid: true, message: "" };
    }

    const dataValidation = this.validateExistingModuleData(route);

    if (dataValidation.valid) {
      return dataValidation;
    }

    return {
      valid: false,
      message: "Guarda un borrador o registra informacion minima en esta etapa antes de avanzar."
    };
  },

  validateExistingModuleData(route) {
    const validators = {
      "business-discovery": () => {
        const state = window.BusinessDiscoveryService ? window.BusinessDiscoveryService.loadState() : null;
        return Boolean(state && (state.package || state.organization.name || state.project.mainProblem));
      },
      "context-builder": () => {
        const state = window.ContextBuilderService ? window.ContextBuilderService.loadState() : null;
        return Boolean(state && (state.result || state.documents.length || state.interviews.length || state.notes.length));
      },
      "process-discovery": () => {
        const state = window.ProcessDiscoveryService ? window.ProcessDiscoveryService.loadState() : null;
        return Boolean(state && state.draftProcessModel);
      },
      "process-modeling": () => {
        const state = window.ProcessDiscoveryService ? window.ProcessDiscoveryService.loadState() : null;
        return Boolean(state && state.draftProcessModel && state.draftProcessModel.activities && state.draftProcessModel.activities.length);
      },
      "process-validation": () => {
        const state = window.ProcessValidationStudioService ? window.ProcessValidationStudioService.loadState() : null;
        return Boolean(state && state.validation);
      },
      "process-data-collection": () => {
        const state = window.ProcessDataCollectionStudioService ? window.ProcessDataCollectionStudioService.loadState() : null;
        return Boolean(state && (state.readiness || state.records || state.activityData));
      },
      "intelligent-vsm": () => {
        const state = window.IntelligentVsmStudioService ? window.IntelligentVsmStudioService.loadState() : null;
        return Boolean(state && (state.metrics || state.vsmMap || state.activities));
      },
      "transformation-workshop": () => {
        const state = window.TransformationWorkshopService ? window.TransformationWorkshopService.loadState() : null;
        return Boolean(state && (state.packageData || state.observations));
      },
      "lean-consultant": () => {
        const state = window.LeanConsultantService ? window.LeanConsultantService.loadState() : null;
        return Boolean(state && state.assessmentPackage);
      }
    };

    const validator = validators[route];
    return {
      valid: validator ? validator() : true,
      message: ""
    };
  },

  buildStagePayload(route) {
    return {
      route,
      source: "LOCAL_MVP_NAVIGATION",
      appsScriptReady: true,
      capturedAt: new Date().toISOString()
    };
  },

  unlockNextStage(project, route, completed) {
    const nextRoute = this.getNextRoute(route);

    if (!nextRoute || !project.stages[nextRoute]) {
      return;
    }

    if (completed || project.stages[nextRoute].status === "LOCKED") {
      project.stages[nextRoute].status = completed ? "AVAILABLE" : project.stages[nextRoute].status;
    }
  },

  getPreviousStage(route) {
    const index = this.stages.findIndex((stage) => stage.route === route);
    return index > 0 ? this.stages[index - 1] : null;
  },

  getNextRoute(route) {
    const index = this.stages.findIndex((stage) => stage.route === route);
    const nextStage = index >= 0 ? this.stages[index + 1] : null;
    return nextStage ? nextStage.route : "";
  },

  getPreviousRoute(route) {
    const previousStage = this.getPreviousStage(route);
    return previousStage ? previousStage.route : "";
  },

  resolveCurrentStageIndex(route, stages) {
    const routeIndex = this.stages.findIndex((stage) => stage.route === route);

    if (routeIndex >= 0) {
      return routeIndex;
    }

    const firstOpen = this.stages.findIndex((stage) => {
      const stageState = stages[stage.route];
      return stage.required && stageState && stageState.status !== "COMPLETED";
    });

    return firstOpen >= 0 ? firstOpen : this.stages.length - 1;
  },

  calculateProgress(stages) {
    const required = this.stages.filter((stage) => stage.required);
    const completed = required.filter((stage) => stages[stage.route] && stages[stage.route].status === "COMPLETED");
    return Math.round((completed.length / required.length) * 100);
  },

  getRecentProjects(state) {
    return state.projects
      .slice()
      .sort((left, right) => String(right.lastModifiedAt).localeCompare(String(left.lastModifiedAt)))
      .slice(0, 6);
  },

  summarizeProject(project) {
    const stage = this.stages[project.currentStageIndex] || this.stages[1];

    return {
      projectId: project.projectId,
      name: project.name,
      status: project.status,
      currentRoute: project.currentRoute,
      currentStage: stage.label,
      progressPercentage: project.progressPercentage,
      lastModifiedAt: project.lastModifiedAt
    };
  }
});
