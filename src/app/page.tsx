"use client";

import React, { useState, useMemo } from "react";
import { Group, PageItem, SortOption, CreatePageInput, CreateGroupInput, UpdateGroupInput } from "@/types";
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  usePages,
  useCreatePages,
  useUpdatePage,
  useDeletePage,
} from "@/lib/hooks/use-tabs";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageGrid } from "@/components/pages/PageGrid";
import { BulkImportDialog } from "@/components/dialogs/BulkImportDialog";
import { AddPageDialog } from "@/components/dialogs/AddPageDialog";
import { GroupModal } from "@/components/dialogs/GroupModal";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { openMultipleTabs } from "@/lib/open-tabs";
import { Loader2 } from "lucide-react";

function TabOrganizerApp() {
  const { toast } = useToast();

  // Queries
  const { data: groups = [], isLoading: isLoadingGroups } = useGroups();
  const { data: pages = [], isLoading: isLoadingPages } = usePages();

  // Mutations
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();

  const createPagesMutation = useCreatePages();
  const updatePageMutation = useUpdatePage();
  const deletePageMutation = useDeletePage();

  // UI State
  const [activeGroupId, setActiveGroupId] = useState<string | null | "all" | "favorites">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  // Modais
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);

  // Contagem de páginas para o menu lateral
  const pageCounts = useMemo(() => {
    const counts = {
      all: pages.length,
      favorites: 0,
      inbox: 0,
      byGroup: {} as Record<string, number>,
    };

    for (const page of pages) {
      if (page.isFavorite) counts.favorites++;
      if (page.groupId === null) {
        counts.inbox++;
      } else {
        counts.byGroup[page.groupId] = (counts.byGroup[page.groupId] || 0) + 1;
      }
    }

    return counts;
  }, [pages]);

  // Grupo ativo
  const activeGroup = useMemo(() => {
    if (activeGroupId === "all" || activeGroupId === "favorites" || activeGroupId === null) {
      return activeGroupId;
    }
    return groups.find((g) => g.id === activeGroupId) || "all";
  }, [activeGroupId, groups]);

  // Filtragem e Ordenação
  const filteredPages = useMemo(() => {
    let result = pages;

    // 1. Filtro por grupo
    if (activeGroupId === "favorites") {
      result = result.filter((p) => p.isFavorite);
    } else if (activeGroupId === null) {
      result = result.filter((p) => p.groupId === null);
    } else if (activeGroupId !== "all") {
      result = result.filter((p) => p.groupId === activeGroupId);
    }

    // 2. Filtro por busca
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.url.toLowerCase().includes(q) ||
          p.domain.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q))
        );
      });
    }

    // 3. Ordenação
    return [...result].sort((a, b) => {
      if (sortOption === "az") {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOption === "favorites") {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // "recent" (padrão)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [pages, activeGroupId, searchQuery, sortOption]);

  // Ações
  const handleToggleFavorite = (page: PageItem) => {
    updatePageMutation.mutate({
      id: page.id,
      data: { isFavorite: !page.isFavorite },
    });
  };

  const handleUpdatePage = (
    id: string,
    updates: { title?: string; notes?: string; groupId?: string | null }
  ) => {
    updatePageMutation.mutate({ id, data: updates });
  };

  const handleDeletePage = (page: PageItem) => {
    deletePageMutation.mutate(page.id);

    // Toast com opção de desfazer imediata
    toast({
      type: "info",
      title: "Página removida",
      description: page.title,
      action: {
        label: "Desfazer",
        onClick: () => {
          createPagesMutation.mutate([
            {
              url: page.url,
              title: page.title,
              groupId: page.groupId,
              notes: page.notes,
            },
          ]);
        },
      },
      duration: 5000,
    });
  };

  const handleDropPageOnGroup = (pageId: string, targetGroupId: string | null) => {
    updatePageMutation.mutate({
      id: pageId,
      data: { groupId: targetGroupId },
    });

    const targetName = targetGroupId
      ? groups.find((g) => g.id === targetGroupId)?.name
      : "Sem grupo (Inbox)";

    toast({
      type: "success",
      title: "Página movida",
      description: `Movida para ${targetName}`,
      duration: 2500,
    });
  };

  const handleOpenAllInGroup = () => {
    const urls = filteredPages.map((p) => p.url);
    if (urls.length === 0) return;

    const { opened, blocked } = openMultipleTabs(urls);

    if (blocked) {
      toast({
        type: "warning",
        title: "Bloqueador de Pop-ups detectado",
        description:
          "O navegador bloqueou a abertura simultânea de abas. Permita pop-ups nas configurações da barra de endereços para abrir todas as abas com 1 clique.",
        duration: 7000,
      });
    } else {
      toast({
        type: "success",
        title: `${opened} ${opened === 1 ? "aba aberta" : "abas abertas"} com sucesso!`,
        duration: 3000,
      });
    }
  };

  const handleSaveGroup = async (data: CreateGroupInput | UpdateGroupInput) => {
    if (groupToEdit) {
      await updateGroupMutation.mutateAsync({ id: groupToEdit.id, data });
    } else {
      await createGroupMutation.mutateAsync(data as CreateGroupInput);
    }
  };

  const handleDeleteGroup = (group: Group) => {
    if (confirm(`Deseja excluir o grupo "${group.name}"? As páginas dele serão movidas para "Sem grupo (Inbox)".`)) {
      deleteGroupMutation.mutate(group.id);
      if (activeGroupId === group.id) {
        setActiveGroupId("all");
      }
      toast({
        type: "info",
        title: "Grupo excluído",
        description: `Páginas movidas para Sem grupo`,
      });
    }
  };

  const defaultGroupIdForModal =
    typeof activeGroupId === "string" && activeGroupId !== "all" && activeGroupId !== "favorites"
      ? activeGroupId
      : null;

  return (
    <div className="flex h-screen bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        groups={groups}
        activeGroupId={activeGroupId}
        onSelectGroup={(id) => setActiveGroupId(id)}
        onOpenBulkImport={() => setIsBulkOpen(true)}
        onOpenAddSingle={() => setIsAddOpen(true)}
        onOpenCreateGroup={() => {
          setGroupToEdit(null);
          setIsGroupModalOpen(true);
        }}
        onOpenEditGroup={(group) => {
          setGroupToEdit(group);
          setIsGroupModalOpen(true);
        }}
        onDeleteGroup={handleDeleteGroup}
        onDropPageOnGroup={handleDropPageOnGroup}
        pageCounts={pageCounts}
      />

      {/* Área Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">
        <Header
          activeGroup={activeGroup}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalFilteredCount={filteredPages.length}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onOpenAllTabs={handleOpenAllInGroup}
          onEditActiveGroup={(grp) => {
            setGroupToEdit(grp);
            setIsGroupModalOpen(true);
          }}
        />

        <div className="flex-1 p-8">
          {isLoadingPages || isLoadingGroups ? (
            <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)] gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#c86446]" />
              <p className="text-xs font-mono">Carregando estante de abas...</p>
            </div>
          ) : (
            <PageGrid
              pages={filteredPages}
              groups={groups}
              searchQuery={searchQuery}
              onToggleFavorite={handleToggleFavorite}
              onUpdatePage={handleUpdatePage}
              onDeletePage={handleDeletePage}
              onSelectGroupView={(grpId) => setActiveGroupId(grpId)}
              onOpenBulkImport={() => setIsBulkOpen(true)}
              onOpenAddSingle={() => setIsAddOpen(true)}
              onClearSearch={() => setSearchQuery("")}
            />
          )}
        </div>
      </main>

      {/* Modais */}
      <BulkImportDialog
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        groups={groups}
        defaultGroupId={defaultGroupIdForModal}
        onImport={async (items) => {
          await createPagesMutation.mutateAsync(items);
        }}
      />

      <AddPageDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        groups={groups}
        defaultGroupId={defaultGroupIdForModal}
        onAdd={async (item) => {
          await createPagesMutation.mutateAsync([item]);
        }}
      />

      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => {
          setIsGroupModalOpen(false);
          setGroupToEdit(null);
        }}
        groupToEdit={groupToEdit}
        onSave={handleSaveGroup}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <TabOrganizerApp />
    </ToastProvider>
  );
}
