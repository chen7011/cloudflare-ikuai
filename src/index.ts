import {App} from "./App";
import winston from "winston";
import env from 'dotenv'
import {ServiceConfigs} from "./configs/ServiceConfigs";
import {FileUtils} from "./utils/FileUtils";
console.log('Hello, TypeScript!');
env.config({path:'./configs/service.env'});
let domain=FileUtils.loadDomainList('./configs/domain.txt');
const configs: ServiceConfigs = {
    ENABLE_V6: process.env.ENABLE_V6 === 'true',
    CRON: process.env.CRON || '0 0 0 * * *',
    ROUTER_USERNAME: process.env.ROUTER_USERNAME || '',
    ROUTER_PASSWORD: process.env.ROUTER_PASSWORD || '',
    ROUTER_IP: process.env.ROUTER_IP || '',
    ROUTER_PORT: Number(process.env.ROUTER_PORT || 0),
    DN: Number(process.env.DOWNLOAD_NUM || 0),
    TL: Number(process.env.TIME_LIMIT || 0),
    TLL: Number(process.env.TIME_LOWER_LIMIT || 0),
    TLR: Number(process.env.LOSS_RATE || 0),
    SL: Number(process.env.SPEED_LIMIT || 0),
    SELECT_NUM: Number(process.env.SELECT_NUM || 0),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    DOMAIN_SET:domain,
    SCRIPT_LINUX:'CloudflareST',
    SCRIPT_WIN:'CloudflareST.exe',
    FILE:'result.csv',
    FILE6:'result6.csv'
};

const log=winston.createLogger({
    level: configs.LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './log/app.log' })
    ]
});

log.debug("配置："+JSON.stringify(configs))
new App(log,configs).main()