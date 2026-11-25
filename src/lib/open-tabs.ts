/**
 * Abre múltiplas URLs em abas separadas do navegador
 * Detecta e avisa caso o navegador bloqueie popups múltiplos
 */
export function openMultipleTabs(urls: string[]): { opened: number; blocked: boolean } {
  if (!urls || urls.length === 0) {
    return { opened: 0, blocked: false };
  }

  let opened = 0;
  let blocked = false;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win || win.closed || typeof win.closed === "undefined") {
        blocked = true;
      } else {
        opened++;
      }
    } catch {
      blocked = true;
    }
  }

  return { opened, blocked };
}
