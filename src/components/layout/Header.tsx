"use client";

import React, { useRef, useEffect } from "react";
import { Group, SortOption } from "@/types";
import {
  Search,
  ExternalLink,
  SlidersHorizontal,
  X,
  Edit2,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  activeGroup: Group | null | "all" | "favorites";
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalFilteredCount: number;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenAllTabs: () => void;
  onEditActiveGroup?: (group: Group) => void;
}

export function Header({
  activeGroup,
  searchQuery,
  onSearchChange,
  totalFilteredCount,
  sortOption,
  onSortChange,
  onOpenAllTabs,
  onEditActiveGroup,
}: HeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Atalho de teclado para busca (tecla "/" ou Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key === "k")) &&
        document.activeElement !== searchInputRef.current &&
        !(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getTitleInfo = () => {
    if (activeGroup === "all") {
      return {
        title: "Todas as Páginas",
        emoji: "📚",
        color: "#c86446",
        description: "Catálogo completo de links organizados",
      };
    }
    if (activeGroup === "favorites") {
      return {
        title: "Favoritos",
        emoji: "⭐",
        color: "#eab308",
        description: "Seus links prioritários e mais consultados",
      };
    }
    if (activeGroup === null) {
      return {
        title: "Sem grupo (Inbox)",
        emoji: "📥",
        color: "#d4a373",
        description: "Links recém-importados aguardando organização",
      };
    }
    return {
      title: activeGroup.name,
      emoji: activeGroup.emoji,
      color: activeGroup.color,
      description: "Grupo personalizado",
    };
  };

  const titleInfo = getTitleInfo();
  const isCustomGroup = typeof activeGroup === "object" && activeGroup !== null;

  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/90 backdrop-blur-md sticky top-0 z-30 px-8 py-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Título e Metadados do Grupo Ativo */}
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none">{titleInfo.emoji}</span>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {titleInfo.title}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--border-subtle)] text-[var(--text-secondary)] font-mono">
              {totalFilteredCount} {totalFilteredCount === 1 ? "aba" : "abas"}
            </span>

            {isCustomGroup && onEditActiveGroup && (
              <button
                onClick={() => onEditActiveGroup(activeGroup)}
                className="p-1 rounded hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-white transition-colors"
                title="Editar este grupo"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">{titleInfo.description}</p>
        </div>

        {/* Barra de Ações: Busca, Ordenação e Abertura em Lote */}
        <div className="flex items-center gap-3">
          {/* Campo de Busca Instantânea */}
          <div className="relative min-w-[240px] md:min-w-[280px]">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por título, link ou nota..."
              className="w-full pl-9 pr-14 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[#c86446] focus:outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--border-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] select-none">
                /
              </span>
            )}
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text-secondary)]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer pr-1"
            >
              <option value="recent" className="bg-[#121217]">Mais recentes</option>
              <option value="oldest" className="bg-[#121217]">Mais antigas</option>
              <option value="az" className="bg-[#121217]">A - Z</option>
              <option value="favorites" className="bg-[#121217]">Favoritos primeiro</option>
            </select>
          </div>

          {/* Botão para Abrir Grupo Inteiro */}
          <button
            onClick={onOpenAllTabs}
            disabled={totalFilteredCount === 0}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
              totalFilteredCount > 0
                ? "bg-[#c86446] hover:bg-[#d4a373] text-[#09090b] border-[#c86446] shadow-sm hover:shadow"
                : "bg-[var(--border-subtle)] text-[var(--text-muted)] border-transparent cursor-not-allowed opacity-50"
            )}
            title="Abre todos os links visíveis deste grupo em novas abas do navegador"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Abrir todas as abas</span>
          </button>
        </div>
      </div>
    </header>
  );
}
