import React from "react";
import { FolderOpen, Plus, Upload, SearchX } from "lucide-react";

interface EmptyStateProps {
  type: "no-links" | "no-search-results";
  searchQuery?: string;
  onOpenBulkImport: () => void;
  onOpenAddSingle: () => void;
  onClearSearch?: () => void;
}

export function EmptyState({
  type,
  searchQuery,
  onOpenBulkImport,
  onOpenAddSingle,
  onClearSearch,
}: EmptyStateProps) {
  if (type === "no-search-results") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
          Nenhuma aba encontrada
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1 mb-4 leading-relaxed">
          Nenhum resultado corresponde à busca &quot;{searchQuery}&quot;. Tente outros termos ou limpe o filtro.
        </p>
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="px-4 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
          >
            Limpar busca
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#181822] to-[#121218] border border-[var(--border-muted)] flex items-center justify-center text-[#c86446] mb-5 shadow-xl">
        <FolderOpen className="w-8 h-8" />
      </div>
      <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
        Nenhuma aba nesta visualização
      </h3>
      <p className="text-xs text-[var(--text-muted)] max-w-md mt-1.5 mb-6 leading-relaxed">
        Cole várias URLs de uma só vez ou adicione um link individual para começar a esvaziar a sobrecarga de abas do seu navegador.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenBulkImport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c86446] hover:bg-[#d4a373] text-[#08080a] text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Colar links em lote
        </button>
        <button
          onClick={onOpenAddSingle}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Adicionar individual
        </button>
      </div>
    </div>
  );
}
