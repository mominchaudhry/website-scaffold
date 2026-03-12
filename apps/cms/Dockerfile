FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/cms/package.json apps/cms/package.json
COPY packages/contracts/package.json packages/contracts/package.json

RUN pnpm install --filter @scaffold/cms... --frozen-lockfile=false

COPY . .
RUN pnpm --filter @scaffold/cms build

EXPOSE 1337
CMD ["pnpm", "--filter", "@scaffold/cms", "start"]
