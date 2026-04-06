FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.base.json ./
COPY apps/web ./apps/web
COPY packages ./packages

RUN npm install


RUN npx turbo run build --filter=web

FROM node:20-alpine AS runner
WORKDIR /app

# Install a lightweight static file server
RUN npm install -g serve

COPY --from=builder /app/apps/web/dist ./dist

EXPOSE 5001
CMD ["serve", "-s", "dist", "-l", "5001"]