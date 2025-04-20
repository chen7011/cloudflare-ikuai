import winston from "winston";

export class LoggerUtils{
    static logger = winston.createLogger({
        level: 'debug',
        format: winston.format.simple(),
        transports: [new winston.transports.Console()],
    });
}