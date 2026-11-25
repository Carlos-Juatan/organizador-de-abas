"use client";

import React from "react";
import { PageItem, Group } from "@/types";
import { PageCard } from "./PageCard";
import { EmptyState } from "./EmptyState";

interface PageGridProps {
  pages: PageItem[];
  groups: Group[];
  searchQuery: string;
  onToggleFavorite: (page: PageItem) => void;
  onUpdatePage: (id: string, updates: { title?: string; notes?: string; groupId?: string | null }) => void;
  onDeletePage: (page: PageItem) => void;
  onSelectGroupView?: (groupId: string | null) => void;
  onOpenBulkImport: () => void;
  onOpenAddSingle: () => void;
  onClearSearch: () => void;
}

export function PageGrid({
  pages,
  groups,
  searchQuery,
  onToggleFavorite,
  onUpdatePage,
  onDeletePage,
  onSelectGroupView,
  onOpenBulkImport,
  onOpenAddSingle,
  onClearSearch,
}: PageGridProps) {
  if (pages.length === 0) {
    return (
      <EmptyState
        type={searchQuery.trim().length > 0 ? "no-search-results" : "no-links"}
        searchQuery={searchQuery}
        onOpenBulkImport={onOpenBulkImport}
        onOpenAddSingle={onOpenAddSingle}
        onClearSearch={onClearSearch}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-16">
      {pages.map((page) => (
        <PageCard
          key={page.id}
          page={page}
          groups={groups}
          onToggleFavorite={onToggleFavorite}
          onUpdatePage={onUpdatePage}
          onDeletePage={onDeletePage}
          onSelectGroupView={onSelectGroupView}
        />
      ))}
    </div>
  );
}
