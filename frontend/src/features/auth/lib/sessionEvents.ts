export const SESSION_EXPIRED_EVENT = "SESSION_EXPIRED";
export const PASSWORD_CHANGE_REQUIRED_EVENT = "PASSWORD_CHANGE_REQUIRED";

export function dispatchSessionExpired(): void {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function dispatchPasswordChangeRequired(): void {
  window.dispatchEvent(new Event(PASSWORD_CHANGE_REQUIRED_EVENT));
}
