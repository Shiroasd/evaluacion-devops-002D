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
# Stage 2: Servidor web ligero en producción (Nginx Alpine sin privilegios)
# ==============================================================================
FROM nginxinc/nginx-unprivileged:alpine

# Limpieza de archivos estáticos por defecto y copia de los activos validados
USER root
RUN rm -rf /usr/share/nginx/html/* && \
    chown -R nginx:nginx /usr/share/nginx/html
USER nginx

# Copia de activos estáticos validados con propiedad de nginx (UID 101)
COPY --from=builder --chown=nginx:nginx /app/index.html /app/index.js /app/style.css /usr/share/nginx/html/

# Asegurar explícitamente el usuario no privilegiado (Principio de Menor Privilegio)
USER nginx

# Exposición del puerto HTTP no privilegiado por defecto en la imagen (8080)
EXPOSE 8080

# Healthcheck nativo para validar disponibilidad del servicio
HEALTHCHECK --interval=30s --timeout=3s --retries=3 --start-period=5s \
  CMD wget -q -O /dev/null http://localhost:8080/ || exit 1

# Ejecución de Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
