# Deploy VPS Docker

## 1) Variaveis backend
Arquivo `apps/backend/.env`:
```env
PORT=3333
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/os_medtech?schema=public
JWT_SECRET=troque-isto
```

## 2) Subir stack
```bash
docker compose up -d
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm --filter @os-medtech/backend build
pnpm --filter @os-medtech/backend start
```

## 3) HTTPS
- Recomenda-se Nginx/Caddy com TLS em frente ao backend e web.

## 4) Backup Postgres
```bash
docker exec -t <container_postgres> pg_dump -U postgres os_medtech > backup.sql
```
