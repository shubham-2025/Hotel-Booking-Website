export const AUTH_ERROR_CODES = {
  UNAUTHENTICATED: "unauthenticated",
  PROFILE_REQUIRED: "profile_required",
  OWNER_REQUIRED: "owner_required",
};

export class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}
