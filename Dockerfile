# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Instalação de dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 2. Compilação da aplicação
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_STORAGE_MODE=demo
ENV NEXT_PUBLIC_STORAGE_MODE=$NEXT_PUBLIC_STORAGE_MODE
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# 3. Imagem final de execução em produção
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos estáticos e diretório público
COPY --from=builder /app/public ./public

# Criar pasta .next com permissões adequadas
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar o build standalone gerado pelo Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3003

CMD ["node", "server.js"]
