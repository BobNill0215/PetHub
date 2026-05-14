FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY . .
RUN echo "DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy" > .env && npx prisma generate && npm run build

FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 8080
CMD if [ -z "$DATABASE_URL" ]; then export DATABASE_URL="postgresql://${PGUSER:-pethub}:${PGPASSWORD:-pethub123}@${PGHOST:-localhost}:${PGPORT:-5432}/${PGDATABASE:-pethub}?schema=public"; fi && node dist/main.js
