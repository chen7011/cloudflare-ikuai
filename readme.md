#           chen7011/cloudflare-ikuai

国外一些网站会用cloudflare的CDN，国内用户访问cloudflare不是很友好。于是有了这个软件。他会对cloudflare公开的CDN节点IP测速并且找出速度快的，将IP和域名做绑定。更新到ikuai路由器中去。

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
npm run release
```

打包后程序会生成到dist文件。将dist文件拷贝到设备上,使用下面命令即可运行

```
 node dist/index.js
```



## docker部署

- dockerhub仓库提供docker镜像：

- docker-compose

- ```
  cloudflare-ikuai:
      image: chen7011/cloudflare-ikuai:latest
      container_name: cloudflare-ikuai
      restart: unless-stopped
      environment:
        - TZ=Asia/Shanghai
        - DOMAIN_SET=*.ptzone.xyz,*.raingfh.top,*.xingyunge.top,*.cspt.top,*.ptchina.org,*.ptfans.cc,*.ptlover.cc,*.pandapt.net,*.zmpt.cc,*.ptzone.xyz  #需要绑定优选IP的域名，逗号分隔
        - ROUTER_USERNAME=ikuai  #ikuai账号，建议单独搞个账号。只提供DNS查询修改权限
        - ROUTER_PASSWORD=123456 #ikuai密码
        - ROUTER_IP=192.168.1.1  #ikuai地址
        - DOWNLOAD_NUM=10    #单次测速的下载数量
        - TIME_LIMIT=200   #节点延迟上限
        - TIME_LOWER_LIMIT=1  #节点延迟下限
        - LOSS_RATE=0.2  #丢包率上限
        - SPEED_LIMIT=10 #测速的速度下线
        - SELECT_NUM=3  #更新到ikuai上的IP数量
        - CRON=0 0 0 * * *  #任务执行频率
        - ENABLE_V6=false  #是否开启V6测速，需要机器网络支持V6
      mem_limit: 512m
  ```

- docker cli

- ```
  docker run -d \
    --name cloudflare-ikuai \
    --restart unless-stopped \
    --memory=512m \
    -e TZ=Asia/Shanghai \
    -e DOMAIN_SET="*.ptzone.xyz,*.raingfh.top,*.xingyunge.top,*.cspt.top,*.ptchina.org,*.ptfans.cc,*.ptlover.cc,*.pandapt.net,*.zmpt.cc,*.ptzone.xyz" \
    -e ROUTER_USERNAME=ikuai \
    -e ROUTER_PASSWORD=123456 \
    -e ROUTER_IP=192.168.1.1 \
    -e DOWNLOAD_NUM=10 \
    -e TIME_LIMIT=200 \
    -e TIME_LOWER_LIMIT=1 \
    -e LOSS_RATE=0.2 \
    -e SPEED_LIMIT=10 \
    -e SELECT_NUM=3 \
    -e CRON="0 0 0 * * *" \
    -e ENABLE_V6=false \
    chen7011/cloudflare-ikuai:latest
  ```
参考项目：

[XIU2/CloudflareSpeedTest: 🌩「自选优选 IP」测试 Cloudflare CDN 延迟和速度，获取最快 IP ！当然也支持其他 CDN / 网站 IP ~](https://github.com/XIU2/CloudflareSpeedTest)

[yuxiaolejs/ikuai: 爱快路由系统的API](https://github.com/yuxiaolejs/ikuai)

