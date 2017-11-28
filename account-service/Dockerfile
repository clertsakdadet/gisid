# Use Node v4 as the base image.
FROM node:8.9.1-alpine

# Set Proxy
#ENV http_proxy http://10.254.7.89:8080
#ENV https_proxy http://10.254.7.89:8080

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

# Expose our server port.
EXPOSE 3000

# Run our app.
#CMD [ "npm", "start" ]

RUN ["chmod", "+x", "wait-for"]