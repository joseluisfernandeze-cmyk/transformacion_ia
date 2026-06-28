function AuthService_login(payload) {
  var errors = AuthValidator_validateLogin(payload);

  if (errors.length) {
    return ApiResponse_validationError(errors);
  }

  var user = UserRepository_findByEmail(payload.email);

  if (!user || user.status !== "ACTIVE" || String(user.isActive).toUpperCase() !== "TRUE") {
    return ApiResponse_error("AUTH_INVALID_CREDENTIALS", "Invalid email or password.", null);
  }

  var passwordHash = HashUtils_sha256(payload.password);

  if (passwordHash !== user.passwordHash) {
    return ApiResponse_error("AUTH_INVALID_CREDENTIALS", "Invalid email or password.", null);
  }

  var session = SessionService_create(user);
  UserRepository_touchLastLogin(user.userId);

  return ApiResponse_success({
    sessionId: session.sessionId,
    user: AuthService_publicUser(user)
  }, "Login successful.");
}

function AuthService_logout(payload) {
  if (!payload.sessionId) {
    return ApiResponse_error("VALIDATION_ERROR", "sessionId is required.", "sessionId");
  }

  SessionService_destroy(payload.sessionId);
  return ApiResponse_success({ loggedOut: true }, "Logout successful.");
}

function AuthService_validateSession(payload) {
  if (!payload.sessionId) {
    return ApiResponse_error("VALIDATION_ERROR", "sessionId is required.", "sessionId");
  }

  var session = SessionService_get(payload.sessionId);

  if (!session) {
    return ApiResponse_error("AUTH_SESSION_EXPIRED", "Session is invalid or expired.", "sessionId");
  }

  return ApiResponse_success({ session: session }, "Session is valid.");
}

function AuthService_publicUser(user) {
  return {
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    role: user.role
  };
}

