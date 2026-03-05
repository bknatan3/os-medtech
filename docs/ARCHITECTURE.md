# Arquitetura

## Visao geral

- Multi-tenant por `orgId` em todas as entidades.
- Backend central expoe auth, CRUD administrativo, work-orders e sync.
- Mobile offline-first usa SQLite (`outbox`) e sincroniza com `POST /sync`.
- Web e Desktop compartilham a mesma UI (Next export + Electron).

## Decisoes chave

- IDs de OS sao UUID no cliente para permitir criacao offline.
- `numeroOs` e atribuido no servidor apos sincronizacao.
- Controle de conflito via `revision` e retorno `409`.
- Auditoria para mudanca de status e operacoes criticas.
