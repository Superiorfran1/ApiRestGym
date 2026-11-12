export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export const toHttpError = (error: unknown): HttpError => {
  if (error instanceof HttpError) return error;
  const message = error instanceof Error ? error.message : String(error);
  return new HttpError(500, message);
};