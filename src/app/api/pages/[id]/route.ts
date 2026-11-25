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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const res = await fetch(`${N8N_BASE_URL}/organizador-patch-page/pages/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Erro ao atualizar página no n8n: ${res.status}` },
        { status: res.status }
      );
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro ao atualizar página" },
      { status: 502 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch(`${N8N_BASE_URL}/organizador-delete-page/pages/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Erro ao excluir página no n8n: ${res.status}` },
        { status: res.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro ao excluir página" },
      { status: 502 }
    );
  }
}
