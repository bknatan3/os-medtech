# Tutorial do Zero

## 1) Instalar no Windows
- Git
- Node.js LTS
- pnpm (`corepack enable && corepack prepare pnpm@10.8.0 --activate`)
- Docker Desktop

## 2) Rodar projeto
```bash
docker compose up -d
pnpm install
cp apps/backend/.env.example apps/backend/.env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## 3) Primeiro acesso
- Web: `http://localhost:3000`
- Backend: `http://localhost:3333`
- Swagger: `http://localhost:3333/api`
- Credencial: `admin@demo.com / senha123`

## 4) Offline no mobile
- Abra app Expo no celular.
- Crie OS offline.
- Toque "Sincronizar agora" ao voltar internet.

## 5) Troubleshooting
- Porta em uso: troque portas em `apps/backend/.env` e scripts.
- Sem banco: valide `docker compose ps`.
- Prisma erro: rode `pnpm --filter @os-medtech/backend db:generate`.
