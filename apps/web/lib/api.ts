const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

function normalizeApiBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export async function getApiBaseUrl(): Promise<string> {
  if (typeof window !== "undefined") {
    const localOverride = window.localStorage.getItem("os_medtech_api_base_url");
    if (localOverride) return normalizeApiBaseUrl(localOverride);

    if (window.osMedtechDesktop?.getSettings) {
      const settings = await window.osMedtechDesktop.getSettings();
      if (settings?.apiBaseUrl) return normalizeApiBaseUrl(settings.apiBaseUrl);
    }
  }
  return normalizeApiBaseUrl(DEFAULT_API_BASE_URL);
}

export async function setApiBaseUrl(nextUrl: string): Promise<void> {
  const normalized = normalizeApiBaseUrl(nextUrl);
  if (typeof window !== "undefined") {
    window.localStorage.setItem("os_medtech_api_base_url", normalized);
    if (window.osMedtechDesktop?.setApiBaseUrl) {
      await window.osMedtechDesktop.setApiBaseUrl(normalized);
    }
  }
}

export async function login(email: string, senha: string) {
  const apiBaseUrl = await getApiBaseUrl();
  const res = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });
  if (!res.ok) throw new Error("Falha no login");
  return res.json();
}

export async function listWorkOrders(token: string) {
  const apiBaseUrl = await getApiBaseUrl();
  const res = await fetch(`${apiBaseUrl}/work-orders`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Falha ao listar OS");
  return res.json();
}
