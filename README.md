# OS MedTech SaaS (MVP)

Monorepo com backend, web, mobile e desktop para ordem de servico de manutencao de equipamentos medicos.

## Estrutura

- `apps/backend`: Fastify + Prisma + PostgreSQL
- `apps/web`: Next.js
- `apps/mobile`: Expo + SQLite offline/outbox
- `apps/desktop`: Electron wrapper do build web
- `packages/shared`: schemas compartilhados

## Setup rapido

```bash
docker compose up -d
pnpm install
cp apps/backend/.env.example apps/backend/.env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Credencial demo

- Email: `admin@demo.com`
- Senha: `senha123`

## Endpoints principais

- Backend: `http://localhost:3333`
- Swagger: `http://localhost:3333/api`
- Web: `http://localhost:3000`

## Build de distribuicao

- APK: `pnpm build:apk`
- EXE: `pnpm build:exe`
- Instalador unico Windows: `powershell -ExecutionPolicy Bypass -File scripts/build-single-installer.ps1`
- Completo: `bash scripts/build-all.sh` ou `powershell -File scripts/build-all.ps1`

## API publica (gratis para comecar)

- Guia rapido: `DEPLOY_PUBLIC_API_FREE.md`
- Blueprint pronto: `render.yaml`
