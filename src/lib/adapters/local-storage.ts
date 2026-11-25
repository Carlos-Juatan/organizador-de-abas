import { Group, PageItem, CreateGroupInput, UpdateGroupInput, CreatePageInput, UpdatePageInput } from "@/types";
import { IStorageService } from "./storage-interface";
import { extractDomain } from "@/lib/utils";

const GROUPS_KEY = "tab_organizer_groups_v1";
const PAGES_KEY = "tab_organizer_pages_v1";

const INITIAL_GROUPS: Group[] = [
  {
    id: "grp_devops",
    name: "DevOps & Cloud",
    emoji: "☁️",
    color: "#5b7082",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "grp_dev",
    name: "Desenvolvimento",
    emoji: "💻",
    color: "#c86446",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "grp_leitura",
    name: "Leituras & Artigos",
    emoji: "📚",
    color: "#d4a373",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "grp_tools",
    name: "Ferramentas & IA",
    emoji: "⚡",
    color: "#819875",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const INITIAL_PAGES: PageItem[] = [
  {
    id: "pg_1",
    url: "https://docs.docker.com/get-started/",
    title: "Docker Get Started & Container Architecture",
    domain: "docs.docker.com",
    groupId: "grp_devops",
    notes: "Documentação base para padronizar Dockerfiles e compose.",
    isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "pg_2",
    url: "https://kubernetes.io/docs/concepts/overview/",
    title: "Kubernetes Concepts Overview",
    domain: "kubernetes.io",
    groupId: "grp_devops",
    notes: "Consultar especificações de Pods e Services.",
    isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "pg_3",
    url: "https://nextjs.org/docs",
    title: "Next.js App Router Documentation",
    domain: "nextjs.org",
    groupId: "grp_dev",
    notes: "Novas convenções de rotas dinâmicas e Server Actions.",
    isFavorite: true,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "pg_4",
    url: "https://tanstack.com/query/latest/docs/framework/react/overview",
    title: "TanStack Query Overview & Optimistic Updates",
    domain: "tanstack.com",
    groupId: "grp_dev",
    notes: "Exemplos práticos de mutações com rollback.",
    isFavorite: false,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "pg_5",
    url: "https://n8n.io/workflows/",
    title: "n8n Workflow Automation Templates",
    domain: "n8n.io",
    groupId: "grp_tools",
    notes: "Modelos de webhooks prontos para integração com MongoDB.",
    isFavorite: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "pg_6",
    url: "https://martinfowler.com/articles/microservices.html",
    title: "Microservices Guide by Martin Fowler",
    domain: "martinfowler.com",
    groupId: "grp_leitura",
    notes: "Artigo clássico sobre fronteiras de contexto e desacoplamento.",
    isFavorite: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "pg_7",
    url: "https://github.com/trending",
    title: "Trending repositories on GitHub today",
    domain: "github.com",
    groupId: null, // Sem grupo (Inbox)
    notes: "Revisar bibliotecas de frontend interessantes.",
    isFavorite: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

export class LocalStorageAdapter implements IStorageService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private getStoredGroups(): Group[] {
    if (!this.isClient()) return INITIAL_GROUPS;
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) {
      localStorage.setItem(GROUPS_KEY, JSON.stringify(INITIAL_GROUPS));
      return INITIAL_GROUPS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_GROUPS;
    }
  }

  private saveGroups(groups: Group[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  }

  private getStoredPages(): PageItem[] {
    if (!this.isClient()) return INITIAL_PAGES;
    const raw = localStorage.getItem(PAGES_KEY);
    if (!raw) {
      localStorage.setItem(PAGES_KEY, JSON.stringify(INITIAL_PAGES));
      return INITIAL_PAGES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PAGES;
    }
  }

  private savePages(pages: PageItem[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
  }

  async getGroups(): Promise<Group[]> {
    return this.getStoredGroups();
  }

  async createGroup(data: CreateGroupInput): Promise<Group> {
    const groups = this.getStoredGroups();
    const newGroup: Group = {
      id: "grp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: data.name,
      emoji: data.emoji || "📁",
      color: data.color || "#c86446",
      createdAt: new Date().toISOString(),
    };
    groups.push(newGroup);
    this.saveGroups(groups);
    return newGroup;
  }

  async updateGroup(id: string, data: UpdateGroupInput): Promise<Group> {
    const groups = this.getStoredGroups();
    const index = groups.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Grupo não encontrado");

    const updated = {
      ...groups[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    groups[index] = updated;
    this.saveGroups(groups);
    return updated;
  }

  async deleteGroup(id: string): Promise<void> {
    const groups = this.getStoredGroups().filter((g) => g.id !== id);
    this.saveGroups(groups);

    // Mover páginas do grupo excluído para "Sem grupo" (null)
    const pages = this.getStoredPages().map((p) =>
      p.groupId === id ? { ...p, groupId: null } : p
    );
    this.savePages(pages);
  }

  async getPages(): Promise<PageItem[]> {
    return this.getStoredPages();
  }

  async createPages(data: CreatePageInput[]): Promise<PageItem[]> {
    const pages = this.getStoredPages();
    const created: PageItem[] = data.map((item, idx) => {
      const domain = extractDomain(item.url);
      return {
        id: "pg_" + (Date.now() + idx).toString(36) + Math.random().toString(36).slice(2, 6),
        url: item.url,
        title: item.title && item.title.trim().length > 0 ? item.title : domain,
        domain,
        favicon: item.favicon,
        groupId: item.groupId ?? null,
        notes: item.notes || "",
        isFavorite: false,
        createdAt: new Date().toISOString(),
      };
    });

    const updatedPages = [...created, ...pages];
    this.savePages(updatedPages);
    return created;
  }

  async updatePage(id: string, data: UpdatePageInput): Promise<PageItem> {
    const pages = this.getStoredPages();
    const index = pages.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Página não encontrada");

    const updated = {
      ...pages[index],
      ...data,
    };
    pages[index] = updated;
    this.savePages(pages);
    return updated;
  }

  async deletePage(id: string): Promise<void> {
    const pages = this.getStoredPages().filter((p) => p.id !== id);
    this.savePages(pages);
  }
}
