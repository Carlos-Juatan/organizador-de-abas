import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storageService } from "@/lib/adapters";
import { Group, PageItem, CreateGroupInput, UpdateGroupInput, CreatePageInput, UpdatePageInput } from "@/types";

export const QUERY_KEYS = {
  groups: ["groups"] as const,
  pages: ["pages"] as const,
};

// --- GRUPOS ---
export function useGroups() {
  return useQuery({
    queryKey: QUERY_KEYS.groups,
    queryFn: () => storageService.getGroups(),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupInput) => storageService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupInput }) =>
      storageService.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storageService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pages });
    },
  });
}

// --- PÁGINAS ---
export function usePages() {
  return useQuery({
    queryKey: QUERY_KEYS.pages,
    queryFn: () => storageService.getPages(),
  });
}

export function useCreatePages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePageInput[]) => storageService.createPages(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pages });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageInput }) =>
      storageService.updatePage(id, data),
    // Atualização otimista
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.pages });
      const previousPages = queryClient.getQueryData<PageItem[]>(QUERY_KEYS.pages);

      if (previousPages) {
        queryClient.setQueryData<PageItem[]>(
          QUERY_KEYS.pages,
          previousPages.map((page) => (page.id === id ? { ...page, ...data } : page))
        );
      }

      return { previousPages };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPages) {
        queryClient.setQueryData(QUERY_KEYS.pages, context.previousPages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pages });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storageService.deletePage(id),
    // Exclusão otimista
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.pages });
      const previousPages = queryClient.getQueryData<PageItem[]>(QUERY_KEYS.pages);

      if (previousPages) {
        queryClient.setQueryData<PageItem[]>(
          QUERY_KEYS.pages,
          previousPages.filter((page) => page.id !== id)
        );
      }

      return { previousPages };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPages) {
        queryClient.setQueryData(QUERY_KEYS.pages, context.previousPages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pages });
    },
  });
}
