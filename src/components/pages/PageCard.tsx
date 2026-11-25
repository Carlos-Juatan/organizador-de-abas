"use client";

import React, { useState } from "react";
import { PageItem, Group } from "@/types";
import {
  ExternalLink,
  Star,
  MoreVertical,
  Trash2,
  Edit3,
  Copy,
  Check,
  FolderInput,
  FileText,
} from "lucide-react";
import { cn, getFaviconUrl, formatRelativeDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface PageCardProps {
  page: PageItem;
  groups: Group[];
  onToggleFavorite: (page: PageItem) => void;
  onUpdatePage: (id: string, updates: { title?: string; notes?: string; groupId?: string | null }) => void;
  onDeletePage: (page: PageItem) => void;
  onSelectGroupView?: (groupId: string | null) => void;
}

export function PageCard({
  page,
  groups,
  onToggleFavorite,
  onUpdatePage,
  onDeletePage,
  onSelectGroupView,
}: PageCardProps) {
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(page.notes || "");
  const [isCopied, setIsCopied] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const currentGroup = groups.find((g) => g.id === page.groupId);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(page.url);
    setIsCopied(true);
    toast({
      type: "success",
      title: "Link copiado!",
      description: page.url,
      duration: 2500,
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveNote = () => {
    setIsEditingNote(false);
    if (noteText !== page.notes) {
      onUpdatePage(page.id, { notes: noteText });
      toast({
        type: "success",
        title: "Nota atualizada",
        duration: 2000,
      });
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", page.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-active)] hover:bg-[var(--bg-card-hover)] p-4 transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5",
        isDragging && "opacity-40 scale-95 border-[#c86446]"
      )}
    >
      {/* Topo do Cartão: Favicon + Domínio + Favorito + Menu */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-[var(--bg-input)] flex items-center justify-center overflow-hidden shrink-0 border border-[var(--border-subtle)]">
            {!faviconError ? (
              <img
                src={getFaviconUrl(page.domain, page.favicon)}
                alt=""
                className="w-3.5 h-3.5 object-contain"
                onError={() => setFaviconError(true)}
                loading="lazy"
              />
            ) : (
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                {page.domain.charAt(0)}
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)] truncate max-w-[140px]">
            {page.domain}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Botão de Favorito */}
          <button
            onClick={() => onToggleFavorite(page)}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              page.isFavorite
                ? "text-amber-400 hover:text-amber-300"
                : "text-[var(--text-muted)] hover:text-amber-400 hover:bg-[var(--border-subtle)]"
            )}
            title={page.isFavorite ? "Remover dos favoritos" : "Favoritar página"}
          >
            <Star
              className={cn("w-4 h-4", page.isFavorite && "fill-amber-400")}
            />
          </button>

          {/* Menu de Ações */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
              title="Mais opções"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-50 w-44 rounded-xl bg-[var(--bg-dropdown)] border border-[var(--border-muted)] py-1.5 shadow-2xl text-xs backdrop-blur-md">
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card-hover)]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir em nova aba
                  </a>

                  <button
                    onClick={(e) => {
                      setMenuOpen(false);
                      handleCopyUrl(e);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card-hover)]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar URL
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setIsEditingNote(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card-hover)]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar anotação
                  </button>

                  {/* Seletor rápido de mover para grupo */}
                  <div className="px-3 py-1 border-t border-[var(--border-subtle)] mt-1">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase block mb-1">
                      Mover para grupo:
                    </span>
                    <select
                      value={page.groupId || ""}
                      onChange={(e) => {
                        const targetId = e.target.value === "" ? null : e.target.value;
                        onUpdatePage(page.id, { groupId: targetId });
                        setMenuOpen(false);
                        toast({
                          type: "success",
                          title: "Página movida",
                          duration: 2000,
                        });
                      }}
                      className="w-full bg-[var(--bg-input)] text-xs text-[var(--text-primary)] rounded px-1.5 py-1 border border-[var(--border-subtle)] focus:outline-none"
                    >
                      <option value="">📥 Sem grupo (Inbox)</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.emoji} {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-[var(--border-subtle)] mt-1 pt-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDeletePage(page);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir link
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Título do Link */}
      <div className="mb-3">
        <a
          href={page.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[var(--text-primary)] hover:text-[#c86446] transition-colors line-clamp-2 leading-snug flex items-start gap-1"
          title={page.title}
        >
          <span>{page.title}</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-[var(--text-muted)]" />
        </a>
      </div>

      {/* Área de Anotações */}
      <div className="mb-4">
        {isEditingNote ? (
          <div className="space-y-1.5">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Adicionar nota (ex: 'Revisar arquitetura para o projeto')..."
              className="w-full text-xs p-2 rounded-lg bg-[var(--bg-input)] border border-[#c86446] text-[var(--text-primary)] focus:outline-none resize-none h-16"
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => {
                  setNoteText(page.notes || "");
                  setIsEditingNote(false);
                }}
                className="px-2 py-0.5 rounded text-[11px] text-[var(--text-muted)] hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                className="px-2.5 py-0.5 rounded text-[11px] bg-[#c86446] text-black font-semibold hover:bg-[#d4a373]"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingNote(true)}
            className={cn(
              "text-xs rounded-lg p-2 transition-all cursor-pointer",
              page.notes
                ? "bg-[var(--bg-input)]/80 text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-muted)] line-clamp-2"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-input)]/50 border border-dashed border-transparent hover:border-[var(--border-subtle)]"
            )}
            title="Clique para editar nota"
          >
            {page.notes ? (
              <span className="flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#d4a373] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{page.notes}</span>
              </span>
            ) : (
              <span className="italic text-[11px]">+ Adicionar nota...</span>
            )}
          </div>
        )}
      </div>

      {/* Rodapé do Cartão */}
      <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
        {/* Badge do Grupo */}
        {currentGroup ? (
          <button
            onClick={() => onSelectGroupView && onSelectGroupView(currentGroup.id)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--bg-input)] hover:bg-[var(--border-subtle)] transition-colors border border-[var(--border-subtle)] text-[var(--text-secondary)] cursor-pointer"
            title={`Filtrar por grupo: ${currentGroup.name}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: currentGroup.color }}
            />
            <span>{currentGroup.emoji}</span>
            <span className="truncate max-w-[90px]">{currentGroup.name}</span>
          </button>
        ) : (
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            Sem grupo
          </span>
        )}

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-muted)]">
            {formatRelativeDate(page.createdAt)}
          </span>
          <button
            onClick={handleCopyUrl}
            className="text-[var(--text-muted)] hover:text-white transition-colors p-1"
            title="Copiar URL"
          >
            {isCopied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
