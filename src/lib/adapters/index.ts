import { IStorageService } from "./storage-interface";
import { LocalStorageAdapter } from "./local-storage";
import { N8nApiAdapter } from "./n8n-adapter";

// Singleton dos adaptadores
const localStorageAdapter = new LocalStorageAdapter();
const n8nAdapter = new N8nApiAdapter();

export function getStorageService(): IStorageService {
  const mode = process.env.NEXT_PUBLIC_STORAGE_MODE;
  if (mode === "n8n") {
    return n8nAdapter;
  }
  return localStorageAdapter;
}

export const storageService = getStorageService();
