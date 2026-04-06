FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY apps/api ./apps/api
COPY packages ./packages

RUN npm install
RUN npx turbo run build --filter=api

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 5000
CMD ["node", "dist/index.js"]