export class AppError extends Error {
  constructor(public readonly code: string, message?: string) {
    super(message ?? code);
    this.name = 'AppError';
  }
}
