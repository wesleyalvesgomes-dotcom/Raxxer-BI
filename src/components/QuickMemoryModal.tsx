import React, { useState } from 'react';
import { X, Brain, Plus } from 'lucide-react';
import { CATEGORY_DETAILS, MemoryCategory, MemoryImportance, MemoryItem } from '../types';
import { Button } from './common/DesignSystem';

interface QuickMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'data'>) => void;
}

export const QuickMemoryModal: React.FC<QuickMemoryModalProps> = ({ isOpen, onClose, onAddMemory }) => {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [categoria, setCategoria] = useState<MemoryCategory>('identidade');
  const [importancia, setImportancia] = useState<MemoryImportance>('alta');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !conteudo.trim()) return;

    onAddMemory({
      categoria,
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      importancia,
      origin: 'manual',
    });

    setTitulo('');
    setConteudo('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn font-sans">
      <div className="bg-[#070D1E] border border-blue-900/60 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4 text-slate-100">
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-tight">
            <Brain className="w-4 h-4 text-cyan-400" />
            Adicionar Memória Rápida
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Meta Comercial INC 2026"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-500 font-light"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Categoria (9 Áreas)</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as MemoryCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs focus:outline-none capitalize font-light"
              >
                {Object.keys(CATEGORY_DETAILS).map((catKey) => (
                  <option key={catKey} value={catKey} className="bg-[#081126] text-white">
                    {CATEGORY_DETAILS[catKey as MemoryCategory].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Importância</label>
              <select
                value={importancia}
                onChange={(e) => setImportancia(e.target.value as MemoryImportance)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs focus:outline-none font-light"
              >
                <option value="alta" className="bg-[#081126] text-white">Alta</option>
                <option value="media" className="bg-[#081126] text-white">Média</option>
                <option value="baixa" className="bg-[#081126] text-white">Baixa</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Conteúdo</label>
            <textarea
              rows={3}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Ex: Detalhar aprendizado ou diretriz..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs focus:outline-none focus:border-blue-500 resize-none placeholder:text-slate-500 font-light"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              size="md"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Plus}
            >
              Salvar Memória
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
