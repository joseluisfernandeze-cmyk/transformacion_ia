function AuthValidator_validateLogin(payload) {
  var errors = [];

  if (!payload.email) {
    errors.push({ code: "VALIDATION_ERROR", field: "email", message: "Email is required." });
  }

  if (!payload.password) {
    errors.push({ code: "VALIDATION_ERROR", field: "password", message: "Password is required." });
  }

  return errors;
}

