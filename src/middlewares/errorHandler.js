import ApplicationError from "./Errors/ApplicationError";

import logger from "../utils/logger";

export default function errorHandler(err, req, res) {
  if (err instanceof ApplicationError) {
    const { error, message, status } = err;

    (status == 500) ? logger.error(err) : logger.info(err);

    return res.status(status).json({ 
        success: false,
        error,
        message
    });
  }

  logger.error(err);
  return res.status(500).send();
}
