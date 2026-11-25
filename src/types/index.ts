export interface Group {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateGroupInput {
  name: string;
  emoji: string;
  color: string;
}

export interface UpdateGroupInput {
  name?: string;
  emoji?: string;
  color?: string;
}

export interface PageItem {
  id: string;
  url: string;
  title: string;
  domain: string;
  favicon?: string;
  groupId: string | null; // null = "Sem grupo" (Inbox)
  notes?: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface CreatePageInput {
  url: string;
  title?: string;
  groupId?: string | null;
  notes?: string;
  favicon?: string;
}

export interface UpdatePageInput {
  title?: string;
  notes?: string;
  groupId?: string | null;
  isFavorite?: boolean;
}

export type SortOption = "recent" | "oldest" | "az" | "favorites";

export interface ParsedUrlItem {
  url: string;
  title: string;
  domain: string;
}
