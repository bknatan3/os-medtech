# API Publica Gratis (inicio)

## Opcao recomendada
- Render (API + Postgres) usando o blueprint em `render.yaml`.

## Publicar em 1 fluxo
1. Crie conta no Render.
2. Clique em **New +** -> **Blueprint**.
3. Conecte este repositorio.
4. O Render vai ler `render.yaml` e criar:
   - `os-medtech-api` (web service)
   - `os-medtech-db` (postgres)
5. Apos deploy, copie a URL publica da API (exemplo):
   - `https://os-medtech-api.onrender.com`
6. Rode seed uma vez (Shell do Render):
```bash
corepack enable
corepack prepare pnpm@10.8.0 --activate
pnpm --filter @os-medtech/backend db:seed
```

## Trocar API no app desktop (jeito facil)

### Dentro do app
- Na tela de login, altere `URL da API` e clique em **Salvar API**.

### Via script (Windows)
```powershell
powershell -ExecutionPolicy Bypass -File scripts/set-desktop-api-url.ps1 -ApiBaseUrl "https://os-medtech-api.onrender.com"
```

## Onde fica salvo
- `%APPDATA%\OS MedTech\settings.json`

## Observacoes
- O plano gratis e bom para inicio/teste, com limites de uso e possivel hibernacao.
- Em producao comercial, migre para plano pago para estabilidade/SLA.
