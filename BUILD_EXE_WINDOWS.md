# Instalador Unico Windows

## Gerar instalador em 1 comando
```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-single-installer.ps1
```

## Saida
- `release/OS MedTech Setup *.exe`

## Como funciona em outra maquina
1. Instale o `.exe` no Windows cliente.
2. Abra o app.
3. O app salva configuracao em:
`%APPDATA%\\OS MedTech\\settings.json`
4. Defina `apiBaseUrl` para a API publica (exemplo):
`https://api.suaempresa.com`

## Conexao fora da rede local
- Para clientes externos, a API precisa estar publicada na internet com HTTPS.
- O desktop redireciona chamadas internas de `http://localhost:3333` para a `apiBaseUrl` configurada.
