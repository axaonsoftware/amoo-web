FROM nginx:alpine
# Install wget for the healthcheck (the base image is minimal and lacks it).
RUN apk add --no-cache wget
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1