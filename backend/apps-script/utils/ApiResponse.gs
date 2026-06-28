function ApiResponse_success(data, message) {
  return {
    success: true,
    data: data || {},
    message: message || "Operation completed successfully.",
    errors: [],
    meta: ApiResponse_meta(null)
  };
}

function ApiResponse_error(code, message, field, detail) {
  return {
    success: false,
    data: null,
    message: message,
    errors: [{
      code: code,
      field: field || null,
      message: message
    }],
    meta: ApiResponse_meta(detail)
  };
}

function ApiResponse_validationError(errors) {
  return {
    success: false,
    data: null,
    message: "Validation failed.",
    errors: errors,
    meta: ApiResponse_meta(null)
  };
}

function ApiResponse_meta(detail) {
  return {
    timestamp: new Date().toISOString(),
    appVersion: "0.1.0",
    environment: "MVP",
    detail: detail || undefined
  };
}

function ApiResponse_json(response) {
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

