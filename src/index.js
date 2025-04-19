import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser'
import fs from 'fs'
import ikuai from "ikuai"
import cron from 'node-cron'
const ENABLE_V6 = process.env.ENABLE_V6 || false;
const CRON=process.env.CRON || '0 0 0 * * *'
const DOMAIN_SET=((process.env.DOMAIN_SET!=null)?process.env.DOMAIN_SET.split(','):[])
const ROUTER_USERNAME=process.env.ROUTER_USERNAME
const ROUTER_PASSWORD=process.env.ROUTER_PASSWORD
const ROUTER_IP=process.env.ROUTER_IP
const ROUTER_PORT=process.env.ROUTER_PORT||80
const DN=process.env.DOWNLOAD_NUM
const TL=process.env.TIME_LIMIT
const TLL=process.env.TIME_LOWER_LIMIT
const TLR=process.env.LOSS_RATE
const SL=process.env.SPEED_LIMIT
const SELECT_NUM=process.env.SELECT_NUM || 6
function log(message) {
    const timestamp = new Date().toISOString();  // 获取时间：2025-04-18T12:34:56.789Z
    console.log(`[${timestamp}] ${message}`);
}


function  getIp(workdir,filename){

    return new Promise((resolve, reject) => {
        const results = [];
        let count=0;
        fs.createReadStream(workdir+'/'+filename)
            .pipe(csv())
            .on('data', (data) =>{
                if (count<SELECT_NUM){
                    log('item:'+JSON.stringify(data))
                    count++
                    results.push(data['IP 地址'])
                }
            })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}
async function speedtest( scrpitName,workdir,param){
    log("param:"+param+",workdir:"+workdir+",scrpitName:"+scrpitName)
    return new Promise((resolve, reject) => {
        // 启动 CloudflareST
        const child = spawn('./'+scrpitName, param,{
            cwd: workdir,  // 工作目录指定
            stdio: 'ignore'  // 标准输出
        });
        // 捕获进程结束
        child.on('close', async (code) => {
            log(`CloudflareST 退出，退出码：${code}`);
            log('测速完成,保留数量');
            resolve()
        });
    })
}
async function update2ikuai(ip4,type){
    if (DOMAIN_SET==null||DOMAIN_SET.length==0||ROUTER_IP==null||ROUTER_PASSWORD==null||ROUTER_USERNAME==null) return
    if (!['ipv4','ipv6'].includes(type)) return
    log("ROUTER_IP:"+ROUTER_IP)
    log("DOMAIN_SET:"+DOMAIN_SET)
    log("ROUTER_PORT:"+ROUTER_PORT)
    log("ROUTER_USERNAME:"+ROUTER_USERNAME)
    log("ROUTER_PASSWORD:"+ROUTER_PASSWORD)

    const myRouter = new ikuai(ROUTER_IP, ROUTER_PORT)
    try {
        const token = await myRouter.login(ROUTER_USERNAME, ROUTER_PASSWORD)
        log("token:"+token)
    }catch (e){
        log("登陆失败请检查，IP，端口，用户名与密码是否正确")
    }
    for (let i = 0; i < DOMAIN_SET.length; i++) {
        let {Data:{data:result}} = await myRouter.exec("dns", "show", {
            "TYPE": "dns_proxy_total,dns_proxy",
            "FINDS": "domain,dns_addr,src_addr,comment",
            "FILTER1": "domain,=,"+DOMAIN_SET[i],
            "FILTER2": "parse_type,=,"+type,
            "limit": "0,100"
        })
        log(JSON.stringify(result))
        if (result!=null&&result.length>0){
            for (let j = 0; j < result.length; j++) {
                let dnsEntity=JSON.parse(JSON.stringify(result[j]))
                dnsEntity['dns_addr']=ip4.join(',')
                let {ErrMsg} = await myRouter.exec("dns", "edit", dnsEntity)
                log("修改："+ErrMsg)
            }
        }else {
            log("不存在。新建")
            let dnsEntity=JSON.parse(JSON.stringify({
                "dns_addr": ip4.join(','),
                "domain": DOMAIN_SET[i],
                "enabled": "yes",
                "parse_type": type
            }))
            try {
                log("添加："+JSON.stringify(dnsEntity) )
                await myRouter.exec("dns", "add", dnsEntity)
            }catch (e) {

            }

        }
    }
}


async function task(workdir,script){
    const file='result.csv'
    const  file6='result6.csv'
    const option=[]
    if (DN!=null&&!isNaN(Number(DN))&&DN>0){
        option.push('-dn',DN)
    }
    if (TL!=null&&!isNaN(Number(TL))&&TL>0){
        option.push('-tl',TL)
    }
    if (TLL!=null&&!isNaN(Number(TLL))&&TLL>0){
        option.push('-tll',TLL)
    }
    if (TLR!=null&&!isNaN(Number(TLR))&&TLR>0){
        option.push('-tlr',TLR)
    }
    if (SL!=null&&!isNaN(Number(SL))&&SL>0){
        option.push('-sl',SL)
    }


    log("V4测速......")
    await speedtest(script,workdir,['-o', file,...option]);
    let ip=await getIp(workdir,file)
    log("V4---->:"+ip)
    await update2ikuai(ip,'ipv4')



    if (ENABLE_V6){
        log("V6测速......")
        await speedtest(script,workdir,['-o', file6,'-f','ipv6.txt',...option]);
        let ip6=await getIp(workdir,file6)
        log("V6---->:"+ip6)
        update2ikuai(ip6,'ipv6')
    }
    log('测速结束')

    log("程序结束")

}
async function main(){
    let script=''
    if (process.platform === 'win32') {
        log('Running on Windows');
        script='CloudflareST.exe'
        // 针对 Windows 的处理
    } else if (process.platform === 'linux') {
        log('Running on Linux');
        script='CloudflareST'
        // 针对 Linux 的处理
    }
    if (script==null||script==''){
        log("系统不支持，请使用win32或者linux")
        return
    }
    // 解决 __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // 拼接工作目录
    const workdir = path.join(__dirname, 'assets');
    await task(workdir,script)

    cron.schedule(CRON,()=>{
        log("开始定时任务，更新CF优选----")
        task(workdir,script)
    }).start()



}

main();
