# Manual Rapido

1. Suba banco:
```bash
docker compose up -d
```

2. Instale deps e migre:
```bash
pnpm install
pnpm db:migrate
pnpm db:seed
```

3. Rode apps:
```bash
pnpm dev:backend
pnpm dev:web
pnpm dev:mobile
pnpm dev:desktop
```

4. Login web:
- `admin@demo.com`
- `senha123`
