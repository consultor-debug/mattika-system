FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY project/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
