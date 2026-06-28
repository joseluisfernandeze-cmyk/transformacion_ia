function UserRepository_findByEmail(email) {
  return SheetRepository_findOneBy("USERS", "email", String(email || "").toLowerCase());
}

function UserRepository_touchLastLogin(userId) {
  SheetRepository_updateById("USERS", "userId", userId, {
    lastLoginAt: new Date().toISOString()
  });
}

