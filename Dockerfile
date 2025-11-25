# ---------- STAGE 1: BUILD ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Copiamos package.json y lock
COPY package*.json ./

# Instalamos dependencias en modo clean
RUN npm ci --legacy-peer-deps

# Copiamos el resto del proyecto
COPY . .

# Build de Next.js
RUN npm run build



# ---------- STAGE 2: RUN ----------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiamos lo necesario desde build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./next.config.js

# Instalamos dependencias de producción
RUN npm ci --production --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "run", "start"]