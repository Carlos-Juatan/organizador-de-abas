import { Group, PageItem, CreateGroupInput, UpdateGroupInput, CreatePageInput, UpdatePageInput } from "@/types";

export interface IStorageService {
  // Grupos
  getGroups(): Promise<Group[]>;
  createGroup(data: CreateGroupInput): Promise<Group>;
  updateGroup(id: string, data: UpdateGroupInput): Promise<Group>;
  deleteGroup(id: string): Promise<void>;

  // Páginas
  getPages(): Promise<PageItem[]>;
  createPages(data: CreatePageInput[]): Promise<PageItem[]>;
  updatePage(id: string, data: UpdatePageInput): Promise<PageItem>;
  deletePage(id: string): Promise<void>;
}
