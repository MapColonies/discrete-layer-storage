FROM node:12.18.3 as build
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:12.18.3-slim as node-base
RUN apt-get update && apt-get -y install wget
RUN mkdir /confd
RUN wget -O '/confd/confd' 'https://github.com/kelseyhightower/confd/releases/download/v0.15.0/confd-0.15.0-linux-amd64'


FROM node-base as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV SERVER_PORT=80
WORKDIR /usr/app
COPY ./run.sh ./run.sh
RUN chmod +x run.sh
COPY ./package*.json ./
RUN npm install --only=production
COPY ./docs ./docs
COPY ./confd ./confd

COPY --from=build /usr/src/app/dist .
COPY --from=build /usr/src/app/node_modules ./node_modules

HEALTHCHECK CMD wget http://127.0.0.1:${SERVER_PORT}/liveness -O /dev/null || exit 1

CMD ["./run.sh"]
