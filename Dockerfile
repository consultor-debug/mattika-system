# Único servicio "mattika-app": Express sirve el FRONTEND estático + la API /api/.
# Vive en la RAÍZ del repo (donde EasyPanel busca el Dockerfile por defecto) y el
# build context es también la raíz, para copiar tanto backend/ como el frontend
# (index.html, *.jsx, styles.css, assets).
FROM node:20-alpine
WORKDIR /app

# Dependencias del backend primero (mejor cacheo de capas)
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Código del servidor + frontend servido tal cual (sin build)
COPY . .

WORKDIR /app/backend
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -qO- http://localhost:3001/health || exit 1
CMD ["node", "src/index.js"]
