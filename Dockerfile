# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# ---------- deps ----------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ---------- builder ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Declare build-time args
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
ENV NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=${NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
ARG NEXT_PUBLIC_MINIO_ENDPOINT
ENV NEXT_PUBLIC_MINIO_ENDPOINT=${NEXT_PUBLIC_MINIO_ENDPOINT}
ARG NEXT_PUBLIC_MINIO_BUCKET
ENV NEXT_PUBLIC_MINIO_BUCKET=${NEXT_PUBLIC_MINIO_BUCKET}
ARG PRISMA_URL
ENV PRISMA_URL=${PRISMA_URL}

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ---------- runner ----------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by Next.js standalone output
CMD ["node", "server.js"]
