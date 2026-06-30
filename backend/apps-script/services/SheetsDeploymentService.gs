var DEPLOYMENT_STATUS_VALUES = ["DRAFT", "IN_PROGRESS", "READY_FOR_REVIEW", "APPROVED", "ARCHIVED", "ACTIVE", "INACTIVE"];
var DEPLOYMENT_BOOLEAN_VALUES = ["TRUE", "FALSE"];

function initializeOperationalIntelligenceSheets(spreadsheetId) {
  var spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw AppError_create("SPREADSHEET_NOT_FOUND", "Open a Google Sheet or provide a spreadsheetId.");
  }

  var schemas = getOperationalIntelligenceSheetSchema_();
  schemas.forEach(function(schema) {
    ensureDeploymentSheet_(spreadsheet, schema);
  });

  return {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    sheetsCreatedOrUpdated: schemas.map(function(schema) {
      return schema.name;
    })
  };
}

function getOperationalIntelligenceSheetSchema_() {
  return [
    {
      name: "CONFIG",
      columns: ["configKey", "configValue", "description", "isSecret", "status", "updatedBy", "updatedAt"],
      validations: { isSecret: DEPLOYMENT_BOOLEAN_VALUES, status: DEPLOYMENT_STATUS_VALUES }
    },
    {
      name: "USERS",
      columns: ["userId", "email", "name", "passwordHash", "role", "status", "createdAt", "updatedAt"],
      validations: { role: ["ADMIN", "CONSULTOR", "LECTOR"], status: DEPLOYMENT_STATUS_VALUES }
    },
    {
      name: "AI_PROVIDERS",
      columns: ["providerId", "providerCode", "providerName", "model", "baseUrl", "apiKey", "temperature", "maxTokens", "isActive", "status", "createdAt", "updatedAt"],
      validations: {
        providerCode: ["OPENAI", "CLAUDE", "GEMINI", "DEEPSEEK", "CUSTOM"],
        isActive: DEPLOYMENT_BOOLEAN_VALUES,
        status: DEPLOYMENT_STATUS_VALUES
      }
    },
    {
      name: "PROMPTS",
      columns: ["promptId", "agentId", "name", "description", "prompt", "active", "version", "createdAt", "updatedAt"],
      validations: { active: DEPLOYMENT_BOOLEAN_VALUES }
    },
    {
      name: "AGENTS",
      columns: ["agentId", "name", "description", "promptId", "status", "createdAt", "updatedAt"],
      validations: { status: DEPLOYMENT_STATUS_VALUES }
    },
    {
      name: "AGENT_EXECUTIONS",
      columns: ["executionId", "projectId", "agentId", "sessionId", "status", "requestJson", "responseJson", "createdBy", "createdAt", "completedAt"],
      validations: { status: ["REQUESTED", "RUNNING", "COMPLETED", "FAILED"] }
    },
    createPackageSheetSchema_("PROJECTS"),
    createPackageSheetSchema_("DOCUMENTS"),
    createPackageSheetSchema_("INTERVIEWS"),
    createPackageSheetSchema_("NOTES"),
    createPackageSheetSchema_("NORMALIZED_DOCUMENTS"),
    createPackageSheetSchema_("BUSINESS_KNOWLEDGE_PACKAGES"),
    createPackageSheetSchema_("KNOWLEDGE_PACKAGES"),
    createPackageSheetSchema_("CONTEXT_GRAPHS"),
    createPackageSheetSchema_("PROCESS_MODELS"),
    createPackageSheetSchema_("OPERATIONAL_DATA"),
    createPackageSheetSchema_("VSM_MAPS"),
    createPackageSheetSchema_("VSM_ACTIVITY_DATA"),
    createPackageSheetSchema_("VSM_METRICS"),
    createPackageSheetSchema_("TRANSFORMATION_OBSERVATIONS"),
    createPackageSheetSchema_("REQUIREMENTS_PACKAGES"),
    createPackageSheetSchema_("LEAN_ASSESSMENTS"),
    createPackageSheetSchema_("TOC_ASSESSMENTS"),
    createPackageSheetSchema_("AUTOMATION_AI_OPPORTUNITIES"),
    createPackageSheetSchema_("TO_BE_PACKAGES"),
    createPackageSheetSchema_("BUSINESS_CASE_PACKAGES"),
    createPackageSheetSchema_("ROADMAP_PACKAGES"),
    createPackageSheetSchema_("EXECUTIVE_REPORT_PACKAGES"),
    createPackageSheetSchema_("PROJECT_TRANSFORMATION_STATUS")
  ];
}

function createPackageSheetSchema_(name) {
  return {
    name: name,
    columns: ["id", "projectId", "version", "status", "createdBy", "createdAt", "updatedBy", "updatedAt", "payloadJson"],
    validations: { status: DEPLOYMENT_STATUS_VALUES }
  };
}

function ensureDeploymentSheet_(spreadsheet, schema) {
  var sheet = spreadsheet.getSheetByName(schema.name) || spreadsheet.insertSheet(schema.name);
  var headerRange = sheet.getRange(1, 1, 1, schema.columns.length);

  headerRange.setValues([schema.columns]);
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, schema.columns.length);
  applyDeploymentValidations_(sheet, schema);
}

function applyDeploymentValidations_(sheet, schema) {
  Object.keys(schema.validations || {}).forEach(function(columnName) {
    var columnIndex = schema.columns.indexOf(columnName) + 1;

    if (columnIndex <= 0) {
      return;
    }

    var validation = SpreadsheetApp.newDataValidation()
      .requireValueInList(schema.validations[columnName], true)
      .setAllowInvalid(false)
      .build();

    sheet.getRange(2, columnIndex, 999, 1).setDataValidation(validation);
  });
}
