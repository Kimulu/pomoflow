// Example: frontend/utils/AuthError.ts
export class AuthError extends Error {
  public status?: number; // Make sure this line exists

  constructor(message: string, status?: number) {
    // Make sure status is a parameter
    super(message);
    this.name = "AuthError";
    this.status = status; // Make sure status is assigned
    Object.setPrototypeOf(this, AuthError.prototype); // Important for instanceof checks
  }
}
