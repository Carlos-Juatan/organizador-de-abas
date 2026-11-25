import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ParsedUrlItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extrai o domínio legível a partir de uma URL (ex: 'https://docs.docker.com/get-started' -> 'docs.docker.com')
 */
export function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return urlStr;
  }
}

/**
 * Retorna o favicon da página ou o serviço de fallback do Google Favicons
 */
export function getFaviconUrl(domain: string, directFavicon?: string): string {
  if (directFavicon && directFavicon.trim().length > 0) {
    return directFavicon;
  }
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

/**
 * Formata data ISO para formato relativo ou legível em PT-BR
 */
export function formatRelativeDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours} h`;
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `Há ${diffDays} dias`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "Data recente";
  }
}

/**
 * Parser inteligente de múltiplas URLs
 * Suporta:
 * 1. Links em Markdown: [Título](https://exemplo.com)
 * 2. URLs simples por linha: https://exemplo.com
 * 3. Textos misturados com URLs dispersas
 */
export function parseBulkUrls(rawText: string): ParsedUrlItem[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split("\n");
  const results: ParsedUrlItem[] = [];
  const seenUrls = new Set<string>();

  // 1. Procurar links Markdown primeiro: [Título](url)
  const markdownRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

  for (const line of lines) {
    let match: RegExpExecArray | null;
    let lineHasMarkdown = false;

    while ((match = markdownRegex.exec(line)) !== null) {
      lineHasMarkdown = true;
      const title = match[1].trim();
      const url = match[2].trim();
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        results.push({
          url,
          title: title || extractDomain(url),
          domain: extractDomain(url),
        });
      }
    }

    // Se a linha não tiver markdown, procurar URLs isoladas
    if (!lineHasMarkdown) {
      const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`]+)/g;
      let urlMatch: RegExpExecArray | null;
      while ((urlMatch = urlRegex.exec(line)) !== null) {
        const url = urlMatch[1].trim().replace(/[.,;:)]$/, "");
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          const domain = extractDomain(url);
          results.push({
            url,
            title: domain,
            domain,
          });
        }
      }
    }
  }

  return results;
}
