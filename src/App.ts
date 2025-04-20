import { Logger } from "winston";
import {ServiceConfigs} from "./configs/ServiceConfigs";
import {IkuaiService} from "./services/IkuaiService";
const cron=require('node-cron')
export class App {
    private logger: Logger;
    private configs: ServiceConfigs
    constructor(logger: Logger,configs:ServiceConfigs) {
        this.logger = logger;
        this.configs=configs

    }

    public main() {
        this.logger.debug("1213");
        let task = new IkuaiService(this.configs);
        task.task();
        cron.schedule(this.configs.CRON,()=>{
            this.logger.info("开始定时任务，更新CF优选----")
            task.task();
        }).start()
    }
}
