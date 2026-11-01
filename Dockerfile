# ==============================================================================
# Stage 1: Build y verificación de integridad sintáctica
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia de recursos estáticos de la aplicación
COPY index.html style.css index.js ./

# Verificación de sintaxis de JavaScript antes del empaquetado final
RUN node --check index.js

# ==============================================================================
# Stage 2: Servidor web ligero en producción (Nginx Alpine)
# ==============================================================================
FROM nginx:alpine

# Limpieza de archivos estáticos por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Configura Nginx para escuchar en puerto 8080 y ajusta rutas/permisos para usuario sin privilegios
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's|/var/run/nginx.pid|/tmp/nginx.pid|g' /etc/nginx/nginx.conf && \
    touch /tmp/nginx.pid && \
    chown -R nginx:nginx /tmp/nginx.pid /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Copia de activos estáticos validados desde el builder stage con propiedad de nginx
COPY --from=builder --chown=nginx:nginx /app/index.html /app/index.js /app/style.css /usr/share/nginx/html/

# Cambio explícito al usuario no privilegiado (Principio de Menor Privilegio)
USER nginx

# Exposición del puerto HTTP no privilegiado
EXPOSE 8080

# Healthcheck nativo para validar disponibilidad del servicio
HEALTHCHECK --interval=30s --timeout=3s --retries=3 --start-period=5s \
  CMD wget -q -O /dev/null http://localhost:8080/ || exit 1

# Ejecución de Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
