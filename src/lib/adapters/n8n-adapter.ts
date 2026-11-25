import { Group, PageItem, CreateGroupInput, UpdateGroupInput, CreatePageInput, UpdatePageInput } from "@/types";
import { IStorageService } from "./storage-interface";

export class N8nApiAdapter implements IStorageService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Erro desconhecido");
      throw new Error(`Falha na requisição (${res.status}): ${errorText}`);
    }

    // Se for 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // Grupos
  async getGroups(): Promise<Group[]> {
    return this.request<Group[]>("/api/groups");
  }

  async createGroup(data: CreateGroupInput): Promise<Group> {
    return this.request<Group>("/api/groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateGroup(id: string, data: UpdateGroupInput): Promise<Group> {
    return this.request<Group>(`/api/groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(id: string): Promise<void> {
    await this.request<void>(`/api/groups/${id}`, {
      method: "DELETE",
    });
  }

  // Páginas
  async getPages(): Promise<PageItem[]> {
    return this.request<PageItem[]>("/api/pages");
  }

  async createPages(data: CreatePageInput[]): Promise<PageItem[]> {
    return this.request<PageItem[]>("/api/pages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePage(id: string, data: UpdatePageInput): Promise<PageItem> {
    return this.request<PageItem>(`/api/pages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deletePage(id: string): Promise<void> {
    await this.request<void>(`/api/pages/${id}`, {
      method: "DELETE",
    });
  }
}
