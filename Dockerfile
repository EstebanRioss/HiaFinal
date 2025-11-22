FROM node:18 AS builder
WORKDIR /app
ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runner (imagen ligera de producción) ----------
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]