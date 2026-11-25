"use client";

import React, { useState } from "react";
import { Group } from "@/types";
import {
  Layers,
  Star,
  Inbox,
  Plus,
  Upload,
  FolderPlus,
  MoreVertical,
  Edit2,
  Trash2,
  Database,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  groups: Group[];
  activeGroupId: string | null | "all" | "favorites";
  onSelectGroup: (groupId: string | null | "all" | "favorites") => void;
  onOpenBulkImport: () => void;
  onOpenAddSingle: () => void;
  onOpenCreateGroup: () => void;
  onOpenEditGroup: (group: Group) => void;
  onDeleteGroup: (group: Group) => void;
  onDropPageOnGroup: (pageId: string, groupId: string | null) => void;
  pageCounts: {
    all: number;
    favorites: number;
    inbox: number;
    byGroup: Record<string, number>;
  };
}

export function Sidebar({
  groups,
  activeGroupId,
  onSelectGroup,
  onOpenBulkImport,
  onOpenAddSingle,
  onOpenCreateGroup,
  onOpenEditGroup,
  onDeleteGroup,
  onDropPageOnGroup,
  pageCounts,
}: SidebarProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null | "inbox">(null);

  const storageMode = process.env.NEXT_PUBLIC_STORAGE_MODE === "n8n" ? "n8n" : "demo";

  const handleDragOver = (e: React.DragEvent, targetGroupId: string | null | "inbox") => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverGroup(targetGroupId);
  };

  const handleDragLeave = () => {
    setDragOverGroup(null);
  };

  const handleDrop = (e: React.DragEvent, targetGroupId: string | null) => {
    e.preventDefault();
    setDragOverGroup(null);
    const pageId = e.dataTransfer.getData("text/plain");
    if (pageId) {
      onDropPageOnGroup(pageId, targetGroupId);
    }
  };

  return (
    <aside className="w-72 h-screen flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] shrink-0 select-none">
      {/* Topo / Logo */}
      <div className="p-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c86446] to-[#bc6c25] flex items-center justify-center text-white shadow-md font-serif text-lg font-bold">
              A
            </span>
            <div>
              <h1 className="font-serif text-lg font-bold text-[var(--text-primary)] leading-tight tracking-tight">
                Abas
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
                Organizador Pessoal
              </span>
            </div>
          </div>

          <div
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-medium border flex items-center gap-1",
              storageMode === "n8n"
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                : "bg-amber-950/40 text-amber-400 border-amber-800/50"
            )}
            title={storageMode === "n8n" ? "Conectado ao n8n Webhook" : "Modo Demo (LocalStorage)"}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {storageMode === "n8n" ? "n8n" : "Demo"}
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={onOpenAddSingle}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--border-subtle)] hover:bg-[var(--border-muted)] text-[var(--text-primary)] text-xs font-semibold transition-all border border-[var(--border-subtle)] hover:border-[var(--border-active)] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#c86446]" />
            Novo Link
          </button>
          <button
            onClick={onOpenBulkImport}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#c86446]/15 hover:bg-[#c86446]/25 text-[#f4f4f6] text-xs font-semibold transition-all border border-[#c86446]/30 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#c86446]" />
            Em Lote
          </button>
        </div>
      </div>

      {/* Navegação Principal */}
      <div className="p-3 space-y-1 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => onSelectGroup("all")}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
            activeGroupId === "all"
              ? "bg-[var(--bg-card-hover)] text-white font-semibold"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-white"
          )}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#a1a1aa]" />
            <span>Todas as Páginas</span>
          </div>
          <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[var(--border-subtle)] text-[var(--text-muted)]">
            {pageCounts.all}
          </span>
        </button>

        <button
          onClick={() => onSelectGroup("favorites")}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
            activeGroupId === "favorites"
              ? "bg-[var(--bg-card-hover)] text-amber-300 font-semibold"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-white"
          )}
        >
          <div className="flex items-center gap-2.5">
            <Star className="w-4 h-4 text-amber-400" />
            <span>Favoritos</span>
          </div>
          <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[var(--border-subtle)] text-[var(--text-muted)]">
            {pageCounts.favorites}
          </span>
        </button>

        {/* Sem grupo / Inbox (Drop zone) */}
        <button
          onClick={() => onSelectGroup(null)}
          onDragOver={(e) => handleDragOver(e, "inbox")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, null)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
            activeGroupId === null
              ? "bg-[var(--bg-card-hover)] text-white font-semibold"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-white",
            dragOverGroup === "inbox" && "ring-2 ring-[#c86446] bg-[#c86446]/20"
          )}
        >
          <div className="flex items-center gap-2.5">
            <Inbox className="w-4 h-4 text-[#d4a373]" />
            <span>Sem grupo (Inbox)</span>
          </div>
          <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[var(--border-subtle)] text-[var(--text-muted)]">
            {pageCounts.inbox}
          </span>
        </button>
      </div>

      {/* Lista de Grupos */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
            Grupos ({groups.length})
          </span>
          <button
            onClick={onOpenCreateGroup}
            className="p-1 rounded hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            title="Criar novo grupo"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="p-4 text-center rounded-lg border border-dashed border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            Nenhum grupo criado ainda.
            <button
              onClick={onOpenCreateGroup}
              className="mt-2 block mx-auto text-[#c86446] hover:underline"
            >
              Criar o primeiro
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {groups.map((group) => {
              const count = pageCounts.byGroup[group.id] || 0;
              const isActive = activeGroupId === group.id;
              const isDragOver = dragOverGroup === group.id;

              return (
                <div
                  key={group.id}
                  className="relative group"
                  onDragOver={(e) => handleDragOver(e, group.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, group.id)}
                >
                  <button
                    onClick={() => onSelectGroup(group.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer",
                      isActive
                        ? "bg-[var(--bg-card-hover)] text-white font-semibold"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-white",
                      isDragOver && "ring-2 ring-emerald-500 bg-emerald-950/40"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-sm shrink-0">{group.emoji}</span>
                      <span className="truncate">{group.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[var(--border-subtle)] text-[var(--text-muted)]">
                        {count}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === group.id ? null : group.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white transition-opacity"
                        title="Opções do grupo"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </button>

                  {/* Menu do Grupo */}
                  {menuOpenId === group.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-2 top-9 z-50 w-36 rounded-lg bg-[var(--bg-dropdown)] border border-[var(--border-muted)] py-1 shadow-2xl text-xs">
                        <button
                          onClick={() => {
                            setMenuOpenId(null);
                            onOpenEditGroup(group);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card-hover)]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Editar Grupo
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpenId(null);
                            onDeleteGroup(group);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Excluir Grupo
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rodapé da Barra Lateral */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)]">
        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-[#c86446]" />
            {storageMode === "n8n" ? "MongoDB via n8n" : "LocalStorage"}
          </span>
          <span className="text-[10px] text-[#71717a]">v1.0</span>
        </div>
      </div>
    </aside>
  );
}
