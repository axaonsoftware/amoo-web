#!/bin/sh
# Generate a self-signed certificate if real ones are not mounted. The
# docker-compose volume mount (./certs:/etc/nginx/certs:ro) shadows the
# build-time certs, so we must generate at runtime when the directory is
# empty. In production, real certificates should be placed in ./certs/.
mkdir -p /etc/nginx/certs
if [ ! -f /etc/nginx/certs/fullchain.pem ]; then
  echo "[nginx] No TLS certificate found — generating a self-signed one for dev/testing."
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/privkey.pem \
    -out /etc/nginx/certs/fullchain.pem \
    -subj "/CN=localhost/O=Dev/C=US" 2>/dev/null
fi

exec "$@"
