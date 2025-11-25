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
# Allow passing DATABASE_URL or POSTGRES_PRISMA_URL at build time.
ARG DATABASE_URL
ARG POSTGRES_PRISMA_URL
ENV DATABASE_URL=${DATABASE_URL}
ENV POSTGRES_PRISMA_URL=${POSTGRES_PRISMA_URL}

# Ensure Prisma client is generated before building. If DATABASE_URL is not set,
# fall back to POSTGRES_PRISMA_URL for the build step. Use a shell so the fallback
# value is available to both prisma generate and next build.
RUN sh -c '\
	export DATABASE_URL=${DATABASE_URL:-$POSTGRES_PRISMA_URL}; \
	echo "Using DATABASE_URL=${DATABASE_URL:0:10}..."; \
	npx prisma generate || true; \
	npm run build\
'

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
