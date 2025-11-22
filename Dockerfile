# ---------- Builder ----------
FROM node:18 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runner ----------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache libc6-compat

# Copia el build standalone generado por Next
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copia package.json solo para que Next arranque
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "server.js"]
