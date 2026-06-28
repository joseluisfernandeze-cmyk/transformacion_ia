function SessionService_create(user) {
  var sessionId = "SES-" + Utilities.getUuid();
  var now = new Date();
  var session = {
    sessionId: sessionId,
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SecurityConfig.sessionTtlSeconds * 1000).toISOString()
  };

  CacheService.getScriptCache().put(sessionId, JSON.stringify(session), SecurityConfig.sessionTtlSeconds);
  return session;
}

function SessionService_get(sessionId) {
  var rawSession = CacheService.getScriptCache().get(sessionId);
  return rawSession ? JSON.parse(rawSession) : null;
}

function SessionService_destroy(sessionId) {
  CacheService.getScriptCache().remove(sessionId);
}

function SessionService_require(sessionId, allowedRoles) {
  var session = SessionService_get(sessionId);

  if (!session) {
    throw AppError_create("AUTH_SESSION_EXPIRED", "Session is invalid or expired.");
  }

  if (allowedRoles && allowedRoles.indexOf(session.role) === -1) {
    throw AppError_create("AUTH_FORBIDDEN", "This role cannot perform the requested action.");
  }

  return session;
}

