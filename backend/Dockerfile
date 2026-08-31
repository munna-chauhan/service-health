FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY backend/package*.json ./
COPY db/schema.prisma ./schema.prisma
RUN npm ci
RUN npx prisma generate --schema ./schema.prisma
COPY backend/tsconfig.json ./
COPY backend/src/ ./src/
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/schema.prisma ./schema.prisma
COPY backend/package.json ./
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));p.prisma={schema:'./schema.prisma'};fs.writeFileSync('package.json',JSON.stringify(p,null,2))"
COPY backend/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
EXPOSE 3000
CMD ["./docker-entrypoint.sh"]
