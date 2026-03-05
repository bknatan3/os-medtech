export {};

declare global {
  interface Window {
    osMedtechDesktop?: {
      getSettings: () => Promise<{ apiBaseUrl: string }>;
      setApiBaseUrl: (url: string) => Promise<boolean>;
    };
  }
}
