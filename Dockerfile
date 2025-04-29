FROM node:20.19.0-alpine

RUN apk add --no-cache tzdata

WORKDIR /app
COPY dist/index.js /app/index.js
COPY dist/startup.sh /app/startup.sh
COPY dist/configs /app/configs
COPY dist/assets /app/assets
COPY dist/configs /app/defaults
ENTRYPOINT ["./startup.sh"]
