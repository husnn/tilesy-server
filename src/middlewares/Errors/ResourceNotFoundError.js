import ApplicationError from './ApplicationError';

export default class ResourceNotFoundError extends ApplicationError {
  constructor(message, status) {
    super();
    
    this.message = message || 'Resource not found.';
    this.status = status || 404;
  }
}
