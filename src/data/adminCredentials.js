const ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin123";
const ADMIN_PASSWORD_KEY = "humsAdminPassword";

export function verifyAdminCredentials(username, password) {
  const savedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
  const expectedPassword = savedPassword ?? DEFAULT_ADMIN_PASSWORD;

  return username.trim() === ADMIN_USERNAME && password === expectedPassword;
}

export function updateAdminPassword(currentPassword, nextPassword) {
  const savedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
  const expectedPassword = savedPassword ?? DEFAULT_ADMIN_PASSWORD;

  if (currentPassword !== expectedPassword) {
    throw new Error("The current password is incorrect.");
  }

  localStorage.setItem(ADMIN_PASSWORD_KEY, nextPassword);
}
