FROM nginx:1.12.2-alpine

# Copy Config
COPY ./nginx.conf /etc/nginx/nginx.conf
#COPY ./gisid.cdg.co.th.crt /etc/nginx/ssl/
#COPY ./gisid.cdg.co.th.rsa /etc/nginx/ssl/
COPY ./dev-cdg-co-th.crt /etc/nginx/ssl/
COPY ./dev-cdg-co-th.key /etc/nginx/ssl/

EXPOSE 80