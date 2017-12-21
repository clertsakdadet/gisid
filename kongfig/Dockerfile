FROM node:9.3.0-alpine

WORKDIR /setup

# Bundle app source
COPY ./config.yml /setup

RUN npm install -g kongfig

RUN kongfig apply --path config.yml --host kong:8001

CMD [ "echo", "Finish Setup Config API-Gateway." ]