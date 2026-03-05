# Build APK Android

## Caminho A (EAS cloud)

1. Login Expo:
```bash
pnpm --filter @os-medtech/mobile exec eas login
```

2. Build:
```bash
pnpm build:apk
```

3. Listar e baixar artefato:
```bash
pnpm --filter @os-medtech/mobile exec eas build:list --platform android --limit 1
```

## Como saber que funcionou
- Build aparece como `finished`.
- APK disponivel para download no link do EAS.
