FROM node:20.19.0-alpine

RUN apk add --no-cache tzdata

WORKDIR /app
COPY dist/index.js /app/index.js
COPY configs /app/configs
COPY assets /app/assets
VOLUME ['/app/configs']
ENTRYPOINT ["node", "index.js"]
