FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY ../db/schema.prisma ./schema.prisma
RUN npm ci
RUN npx prisma generate --schema ./schema.prisma
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/server.js"]
