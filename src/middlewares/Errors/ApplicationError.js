export default class ApplicationError extends Error {
  constructor(message, status) {
    super();
    
    this.name = this.constructor.name;
    this.message = message || 'Something went wrong. Please try again.';
    this.status = status || 500;

    Error.captureStackTrace(this, this.constructor);
  }
}
