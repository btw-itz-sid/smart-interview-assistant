export class HttpException extends Error {
  public readonly status: number;
  public readonly message: string;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.message = message;

    Object.setPrototypeOf(this, HttpException.prototype);
  }
}
