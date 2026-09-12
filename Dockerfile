# Dockerfile for Enterprise AI Disaster Resource Mapper
FROM nginx:alpine

# Copy static assets to Nginx web root
COPY . /usr/share/nginx/html

# Expose HTTP Port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
