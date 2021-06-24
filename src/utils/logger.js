import winston from "winston";
import appRoot from "app-root-path";

const consoleLogFormat = winston.format.printf((info) => {
  return `${info.message}`;
});

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: `${appRoot}/logs/error.log`,
      level: "error",
      handleExceptions: true,
      maxsize: 5242880
    }),
    new winston.transports.File({
      filename: `${appRoot}/logs/info.log`,
      level: "info",
      maxsize: 5242880
    }),
    new winston.transports.Console({
      level: "debug",
      format: consoleLogFormat,
      handleExceptions: true
    }),
  ],
  exitOnError: false,
});

logger.stream = {
  write(message) {
    logger.debug(message.substring(0,message.lastIndexOf('\n')));
  }
};

export default logger;
