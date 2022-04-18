export type HttpResponseErrorType = {
  error: string;
  error_description?: string;
};

export class HttpResponseError extends Error {
  status: number;
  message: string;
  description: string;
  constructor(status: number, message: string, desc: string) {
    super();
    this.status = status;
    this.message = message;
    this.description = desc;
  }

  toString(): string {
    return "HttpResponseError: " + JSON.stringify(this.toJSON());
  }

  toJSON(): HttpResponseErrorType {
    return {
      error: this.message,
      error_description: this.description,
    };
  }
}

export class HttpBadRequestError extends HttpResponseError {
  constructor(message: string, description: string) {
    super(400, message, description);
  }
}
