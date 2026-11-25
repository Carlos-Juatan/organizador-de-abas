"use client";

import React, { useState, useMemo } from "react";
import { Group, CreatePageInput } from "@/types";
import { parseBulkUrls, extractDomain } from "@/lib/utils";
import { X, Upload, Link2, Check, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  defaultGroupId: string | null;
  onImport: (pages: CreatePageInput[]) => Promise<void>;
}

export function BulkImportDialog({
  isOpen,
  onClose,
  groups,
  defaultGroupId,
  onImport,
}: BulkImportDialogProps) {
  const { toast } = useToast();
  const [rawText, setRawText] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(defaultGroupId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parser em tempo real
  const parsedLinks = useMemo(() => {
    return parseBulkUrls(rawText);
  }, [rawText]);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (parsedLinks.length === 0) return;

    setIsSubmitting(true);
    try {
      const itemsToCreate: CreatePageInput[] = parsedLinks.map((p) => ({
        url: p.url,
        title: p.title,
        groupId: selectedGroupId,
      }));

      await onImport(itemsToCreate);
      toast({
        type: "success",
        title: `${parsedLinks.length} ${parsedLinks.length === 1 ? "aba importada" : "abas importadas"} com sucesso!`,
        description: selectedGroupId
          ? `Adicionadas ao grupo ${groups.find((g) => g.id === selectedGroupId)?.name}`
          : "Adicionadas a 'Sem grupo (Inbox)'",
      });
      setRawText("");
      onClose();
    } catch {
      toast({
        type: "error",
        title: "Erro ao importar",
        description: "Não foi possível gravar as páginas no backend.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl rounded-2xl bg-[var(--bg-modal)] border border-[var(--border-muted)] p-6 shadow-2xl text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c86446]/20 border border-[#c86446]/40 flex items-center justify-center text-[#c86446]">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">Importar Links em Lote</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Cole URLs linha por linha ou formato Markdown (ex: extensões &apos;Copy All URLs&apos;)
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

        {/* Corpo */}
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Cole os links abaixo:
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`https://github.com/trending\nhttps://news.ycombinator.com\n[Documentação Next.js](https://nextjs.org/docs)`}
              className="w-full h-44 p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[#c86446] focus:outline-none text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none"
              autoFocus
            />
          </div>

          {/* Destino do Grupo */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Salvar no grupo:
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

            {/* Contador de Links Identificados */}
            <div className="text-right self-end pb-1">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Identificados:{" "}
                <span className="text-emerald-400 font-mono text-sm font-bold">
                  {parsedLinks.length}
                </span>
              </span>
            </div>
          </div>

          {/* Prévia dos domínios extraídos */}
          {parsedLinks.length > 0 && (
            <div className="p-3 rounded-xl bg-[var(--bg-input)]/60 border border-[var(--border-subtle)] max-h-24 overflow-y-auto space-y-1">
              <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase block mb-1">
                Pré-visualização dos links:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {parsedLinks.slice(0, 10).map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] truncate max-w-[180px]"
                    title={p.url}
                  >
                    <Link2 className="w-2.5 h-2.5 text-[#c86446] shrink-0" />
                    <span className="truncate">{p.title || p.domain}</span>
                  </span>
                ))}
                {parsedLinks.length > 10 && (
                  <span className="text-[11px] text-[var(--text-muted)] self-center pl-1 font-mono">
                    +{parsedLinks.length - 10} mais...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={parsedLinks.length === 0 || isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c86446] hover:bg-[#d4a373] text-[#08080a] text-xs font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            {isSubmitting
              ? "Importando..."
              : `Importar ${parsedLinks.length} ${parsedLinks.length === 1 ? "aba" : "abas"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
