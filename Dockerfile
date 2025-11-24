# Stage 1: Install dependencies and build
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --progress=false

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Allow passing DATABASE_URL at build time so Prisma generation and any build-time
# steps that need the DB url can run. Use --build-arg DATABASE_URL="..." when building.
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Ensure Prisma client is generated before building so imports succeed during build
RUN npx prisma generate || true
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts and production deps
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
