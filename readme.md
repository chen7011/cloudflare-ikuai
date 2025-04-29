#           cloudflare-ikuai

国外一些网站会用cloudflare的CDN，国内用户访问cloudflare不是很友好。Cloudflare 公开了所有 IP 段，可以通过测速选取速度快的CDN节点，IP寻找到以后需要手动添加到ikuai路由器的DNS代理列表中，如果维护域名数量庞大，工作量相当大。于是有了这个软件。他会对cloudflare公开的CDN节点IP测速并且找出速度快延迟低的IP，将IP和域名做绑定。更新到ikuai路由器DNS反向代理列表中。默认每天0点会执行一次，可以环境变量调整频率。

程序依赖包安装：

```
npm install
```

程序运行：

```
npm run start
```

程序打包：

```
npm run build
```

打包后程序会生成到dist文件。将dist文件拷贝到设备上,使用下面命令即可运行

```
 # Linux系统：
  ./startup.sh
 # win系统
  ./startup.bat
```



## docker部署

- dockerhub仓库提供docker镜像：

- docker-compose

- ```  
  cloudflare-ikuai:
    image: chen7011/cloudflare-ikuai:latest
    container_name: cloudflare-ikuai
    restart: unless-stopped
    network_mode: "host"
    environment:
      - TZ=Asia/Shanghai
    volumes:
      - ./cloudflare-ikuai/configs:/app/configs
    mem_limit: 512m
  ```

- docker cli

- ```
    docker run -d \
    --name cloudflare-ikuai \
    --restart unless-stopped \
    --network host \
    -e TZ=Asia/Shanghai \
    -v ./cloudflare-ikuai/configs:/app/configs \
    --memory=512m \
    chen7011/cloudflare-ikuai:latest

  ```
- 配置文件
  - configs目录下为配置文件存放目录
    - domain.txt： 
       - 需要和测速IP绑定并且更到ikuai中的域名，一行一个。
    - service.env
       - 运行环境和测速环境参数，具体可看配置文件注释
    - ip.txt
       - 需要测速的IPV4
    - ipv6.txt 
      - 需要测速的IPV6,需要在service.env配置文件里面打开V6
  
- 参考项目：

[XIU2/CloudflareSpeedTest: 🌩「自选优选 IP」测试 Cloudflare CDN 延迟和速度，获取最快 IP ！当然也支持其他 CDN / 网站 IP ~](https://github.com/XIU2/CloudflareSpeedTest)

[yuxiaolejs/ikuai: 爱快路由系统的API](https://github.com/yuxiaolejs/ikuai)

