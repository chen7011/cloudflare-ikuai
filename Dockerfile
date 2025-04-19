FROM node:20.19.0-alpine
WORKDIR /app
COPY dist /app/dist
ENTRYPOINT ["node", "dist/index.js"]
