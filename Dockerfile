# ---------- STAGE 1: BUILD ----------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build


# ---------- STAGE 2: RUN ----------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./next.config.js

RUN npm ci --production --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "run", "start"]