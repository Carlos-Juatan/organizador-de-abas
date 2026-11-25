import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { extractDomain } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Parâmetro 'url' obrigatório" }, { status: 400 });
  }

  const domain = extractDomain(targetUrl);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({
        domain,
        title: domain,
        favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text().trim() ||
      $('meta[name="twitter:title"]').attr("content") ||
      domain;

    let favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href");

    // Converter favicon relativo em absoluto
    if (favicon && !favicon.startsWith("http")) {
      try {
        const base = new URL(targetUrl);
        favicon = new URL(favicon, base.origin).toString();
      } catch {
        favicon = undefined;
      }
    }

    if (!favicon) {
      favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    }

    return NextResponse.json({
      title: title.slice(0, 150),
      domain,
      favicon,
    });
  } catch {
    return NextResponse.json({
      domain,
      title: domain,
      favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
    });
  }
}
