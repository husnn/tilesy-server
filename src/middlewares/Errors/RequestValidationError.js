import ApplicationError from './ApplicationError';

export default class RequestValidationError extends ApplicationError {
  constructor(message, status) {
    super();
    
    this.message = message || 'Invalid request.';
    this.status = status || 400;
  }
}
