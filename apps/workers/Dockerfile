FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.base.json ./
COPY apps/workers ./apps/workers
COPY packages ./packages

RUN npm install
RUN npx turbo run build --filter=workers

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/workers/dist ./dist
COPY --from=builder /app/apps/workers/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 5002
CMD ["node", "dist/index.js"]