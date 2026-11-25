"use client";

import React, { useState, useEffect } from "react";
import { Group, CreateGroupInput, UpdateGroupInput } from "@/types";
import { X, Folder, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupToEdit?: Group | null;
  onSave: (data: CreateGroupInput | UpdateGroupInput) => Promise<void>;
}

const EARTHY_COLORS = [
  { name: "Terracotta", value: "#c86446" },
  { name: "Areia", value: "#d4a373" },
  { name: "Oliva", value: "#6b8e23" },
  { name: "Argila", value: "#bc6c25" },
  { name: "Sálvia", value: "#819875" },
  { name: "Ardósia", value: "#5b7082" },
  { name: "Vinho", value: "#9c4a5c" },
  { name: "Ocre", value: "#d97706" },
];

const PRESET_EMOJIS = ["☁️", "💻", "📚", "⚡", "🛠️", "💡", "🎬", "📊", "🎨", "📝", "🛒", "🔬", "🚀", "🏷️", "🔒", "⭐"];

export function GroupModal({
  isOpen,
  onClose,
  groupToEdit,
  onSave,
}: GroupModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [color, setColor] = useState("#c86446");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name);
      setEmoji(groupToEdit.emoji);
      setColor(groupToEdit.color);
    } else {
      setName("");
      setEmoji("📁");
      setColor("#c86446");
    }
  }, [groupToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        emoji: emoji || "📁",
        color,
      });

      toast({
        type: "success",
        title: groupToEdit ? "Grupo atualizado" : "Grupo criado",
        description: `${emoji} ${name}`,
      });
      onClose();
    } catch {
      toast({
        type: "error",
        title: "Erro ao salvar grupo",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[var(--bg-modal)] border border-[var(--border-muted)] p-6 shadow-2xl text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md text-base"
              style={{ backgroundColor: color }}
            >
              {emoji}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">
                {groupToEdit ? "Editar Grupo" : "Novo Grupo"}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Personalize com um emoji e cor em tom terroso
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

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Nome do Grupo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: DevOps & Cloud"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[#c86446] focus:outline-none text-[var(--text-primary)]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Escolha um Emoji
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className="w-12 text-center text-lg py-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none"
              />
              <span className="text-[11px] text-[var(--text-muted)]">
                Ou selecione um dos atalhos abaixo:
              </span>
            </div>
            <div className="grid grid-cols-8 gap-1.5 p-2 rounded-xl bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
              {PRESET_EMOJIS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setEmoji(em)}
                  className={`p-1.5 text-base rounded-lg hover:bg-[var(--bg-card-hover)] transition-transform hover:scale-110 cursor-pointer ${
                    emoji === em ? "bg-[var(--bg-card-hover)] ring-1 ring-[#c86446]" : ""
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Cor do Grupo (Tons Terrosos)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EARTHY_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                    color === c.value
                      ? "border-white/50 bg-[var(--bg-card-hover)] shadow-sm font-semibold"
                      : "border-[var(--border-subtle)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:border-[var(--border-muted)]"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: c.value }}
                  />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
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
              disabled={!name.trim() || isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c86446] hover:bg-[#d4a373] text-[#08080a] text-xs font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              {isSubmitting ? "Salvando..." : groupToEdit ? "Salvar Alterações" : "Criar Grupo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
