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

# Argumento de build para inyectar trazabilidad del commit SHA
ARG COMMIT_SHA=unknown

# Metadatos OCI para trazabilidad de la imagen
LABEL org.opencontainers.image.title="Lista de perros" \
      org.opencontainers.image.description="Aplicación web interactiva para clasificar perritos - Evaluación DevOps" \
      org.opencontainers.image.source="https://github.com/Shiroasd/evaluacion-devops-002D" \
      org.opencontainers.image.revision="${COMMIT_SHA}" \
      org.opencontainers.image.vendor="Shiroasd"

# Actualización de parches de seguridad del SO Alpine y preparación de directorios
USER root
RUN apk update && apk upgrade --no-cache && \
    rm -rf /usr/share/nginx/html/* && \
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
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

# Ejecución de Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
