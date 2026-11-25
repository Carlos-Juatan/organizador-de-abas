"use client";

import React, { useState } from "react";
import { Group, CreatePageInput } from "@/types";
import { extractDomain } from "@/lib/utils";
import { X, Plus, Link2, FileText, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface AddPageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  defaultGroupId: string | null;
  onAdd: (page: CreatePageInput) => Promise<void>;
}

export function AddPageDialog({
  isOpen,
  onClose,
  groups,
  defaultGroupId,
  onAdd,
}: AddPageDialogProps) {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(defaultGroupId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleUrlChange = (value: string) => {
    setUrl(value);
    // Sugerir título com base no domínio se o usuário não tiver digitado título ainda
    if (!title && value.trim()) {
      const domain = extractDomain(value);
      if (domain) {
        setTitle(domain);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        url: finalUrl,
        title: title.trim() || extractDomain(finalUrl),
        groupId: selectedGroupId,
        notes: notes.trim(),
      });

      toast({
        type: "success",
        title: "Link adicionado!",
        description: title.trim() || extractDomain(finalUrl),
      });

      setUrl("");
      setTitle("");
      setNotes("");
      onClose();
    } catch {
      toast({
        type: "error",
        title: "Erro ao adicionar",
        description: "Verifique a URL e tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-modal)] border border-[var(--border-muted)] p-6 shadow-2xl text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c86446]/20 border border-[#c86446]/40 flex items-center justify-center text-[#c86446]">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">Adicionar Link</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Guarde uma página para consulta posterior
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              URL da página *
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://exemplo.com/artigo"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[#c86446] focus:outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Título da página (opcional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Guia de Docker e Kubernetes"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[#c86446] focus:outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Grupo de destino
            </label>
            <select
              value={selectedGroupId || ""}
              onChange={(e) => setSelectedGroupId(e.target.value === "" ? null : e.target.value)}
              className="w-full bg-[var(--bg-input)] text-xs text-[var(--text-primary)] rounded-xl px-3 py-2 border border-[var(--border-subtle)] focus:outline-none focus:border-[#c86446]"
            >
              <option value="">📥 Sem grupo (Inbox)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.emoji} {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Anotações / Lembrete (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Usar este modelo de configuração no projeto..."
              className="w-full h-20 p-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[#c86446] focus:outline-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!url.trim() || isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c86446] hover:bg-[#d4a373] text-[#08080a] text-xs font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              {isSubmitting ? "Salvando..." : "Salvar Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
