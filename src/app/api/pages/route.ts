import { NextRequest, NextResponse } from "next/server";

const N8N_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL || "http://n8n:5678/webhook";
const N8N_AUTH_TOKEN = process.env.N8N_WEBHOOK_AUTH_TOKEN;

function getHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (N8N_AUTH_TOKEN) {
    headers["Authorization"] = `Bearer ${N8N_AUTH_TOKEN}`;
  }
  return headers;
}

export async function GET() {
  try {
    const res = await fetch(`${N8N_BASE_URL}/pages`, {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Erro no backend n8n: ${res.status}` },
        { status: res.status }
      );
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : [];
    return NextResponse.json(Array.isArray(data) ? data : (data ? [data] : []));
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro ao conectar com n8n" },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${N8N_BASE_URL}/pages`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Erro ao criar página no n8n: ${res.status}` },
        { status: res.status }
      );
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : [];
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro ao criar páginas" },
      { status: 502 }
    );
  }
}
