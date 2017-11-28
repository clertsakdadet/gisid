FROM nginx:1.12.2-alpine

# Copy Config
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./cert.crt /etc/nginx/ssl/
COPY ./cert.rsa /etc/nginx/ssl/

EXPOSE 80