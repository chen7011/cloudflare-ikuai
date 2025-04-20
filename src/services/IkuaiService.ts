import {ServiceConfigs} from "../configs/ServiceConfigs";
import path from "path";
import {Logger, loggers} from "winston";
import {LoggerUtils} from "../utils/LoggerUtils";
import {spawn} from "child_process";

import {FileUtils} from "../utils/FileUtils";
const  ikuai=require('ikuai')
export class IkuaiService{
    private configs:ServiceConfigs
    private logger:Logger =LoggerUtils.logger
    private  script:string=''
    constructor(configs:ServiceConfigs) {
        this.configs=configs
        if (process.platform === 'win32') {
            this.logger.info('Running on Windows');
            this.script=this.configs.SCRIPT_WIN
            // 针对 Windows 的处理
        } else if (process.platform === 'linux') {
            this.logger.info('Running on Linux');
            this.script=this.configs.SCRIPT_LINUX
            // 针对 Linux 的处理
        }

    }
    private  execSpeedTest(workdir:string,param:Array<any>):Promise<any>{
        this.logger.debug("param:"+param+",workdir:"+workdir+",scrpitName:"+this.script)
        return new Promise((resolve, reject) => {
            // 启动 CloudflareST
            const child = spawn('./'+this.script, param,{
                cwd: workdir,  // 工作目录指定
                stdio: 'ignore'  // 标准输出
            });
            // 捕获进程结束
            child.on('close', async (code) => {
                this.logger.info(`CloudflareST 退出，退出码：${code}`);
                this.logger.info('测速完成!');
                resolve('ok')
            });
        })
    }
    private async update2ikuai(ip:Array<string>, type:string, domain_set:Array<string>) {
        if (domain_set == null || domain_set.length == 0 || this.configs.ROUTER_IP == null || this.configs.ROUTER_PASSWORD == null || this.configs.ROUTER_USERNAME == null) return
        if (!['ipv4', 'ipv6'].includes(type)) return
        const myRouter = new ikuai(this.configs.ROUTER_IP, this.configs.ROUTER_PORT)
        try {
            const token = await myRouter.login(this.configs.ROUTER_USERNAME, this.configs.ROUTER_PASSWORD)
            this.logger.info("登录成功！")
            this.logger.debug("token:" + token)
        } catch (e) {
            this.logger.error("登陆失败请检查，IP，端口，用户名与密码是否正确")
        }
        for (let i = 0; i < domain_set.length; i++) {
            let {Data: {data: result}} = await myRouter.exec("dns", "show", {
                "TYPE": "dns_proxy_total,dns_proxy",
                "FINDS": "domain,dns_addr,src_addr,comment",
                "FILTER1": "domain,=," + domain_set[i],
                "FILTER2": "parse_type,=," + type,
                "limit": "0,100"
            })
            this.logger.info(JSON.stringify(result))
            if (result != null && result.length > 0) {
                for (let j = 0; j < result.length; j++) {
                    let dnsEntity = JSON.parse(JSON.stringify(result[j]))
                    dnsEntity['dns_addr'] = ip.join(',')
                    let {ErrMsg} = await myRouter.exec("dns", "edit", dnsEntity)
                    this.logger.info("修改：" + ErrMsg)
                }
            } else {
                this.logger.info("不存在。新建")
                let dnsEntity = JSON.parse(JSON.stringify({
                    "dns_addr": ip.join(','),
                    "domain": domain_set[i],
                    "enabled": "yes",
                    "parse_type": type
                }))
                try {
                    this.logger.info("添加：" + JSON.stringify(dnsEntity))
                    await myRouter.exec("dns", "add", dnsEntity)
                } catch (e) {

                }

            }
        }
    }
    public async task() {
        if (this.script == null || this.script == '') {
            this.logger.error("系统不支持，请使用win32或者linux")
            return
        }
        const option = []
        if (this.configs.DN != null && this.configs.DN > 0) {
            option.push('-dn', this.configs.DN)
        }
        if (this.configs.TL != null && this.configs.TL > 0) {
            option.push('-tl', this.configs.TL)
        }
        if (this.configs.TLL != null && this.configs.TLL > 0) {
            option.push('-tll', this.configs.TLL)
        }
        if (this.configs.TLR != null && this.configs.TLR > 0) {
            option.push('-tlr', this.configs.TLR)
        }
        if (this.configs.SL != null && this.configs.SL > 0) {
            option.push('-sl', this.configs.SL)
        }
        this.logger.debug("path:" + __dirname)
        // 拼接工作目录
        const workdir = path.join(__dirname, 'assets');
        await this.execSpeedTest(workdir, ['-o', this.configs.FILE, ...option])
        let ip:Array<string> = await FileUtils.readCsv2IpArray(path.join(workdir, this.configs.FILE), this.configs.SELECT_NUM);
        this.logger.info("ip--->:"+ip)
        await this.update2ikuai(ip,'ipv4',this.configs.DOMAIN_SET)

        if (this.configs.ENABLE_V6){
            this.logger.info("V6测速......")
            await this.execSpeedTest(workdir,['-o', this.configs.FILE6,'-f','ipv6.txt',...option]);
            let ip6=await FileUtils.readCsv2IpArray(path.join(workdir, this.configs.FILE6),this.configs.SELECT_NUM)
            this.logger.info("V6---->:"+ip6)
            await this.update2ikuai(ip6,'ipv6',this.configs.DOMAIN_SET)
        }
        this.logger.info('测速结束')
    }
}