import React, { useState } from 'react';
import {
  Brain,
  Search,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Calendar,
  Layers,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';
import { CATEGORY_DETAILS, MemoryCategory, MemoryImportance, MemoryItem } from '../types';
import { Panel, SectionHeader, StatusBadge, Button } from './common/DesignSystem';

interface MemoryBrainViewProps {
  memories: MemoryItem[];
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'data'>) => void;
  onDeleteMemory: (id: string) => void;
}

export const MemoryBrainView: React.FC<MemoryBrainViewProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Manual Form State
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [categoria, setCategoria] = useState<MemoryCategory>('identidade');
  const [importancia, setImportancia] = useState<MemoryImportance>('alta');

  // AI Automatic Memory Extraction Bar State
  const [aiExtractInput, setAiExtractInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionFeedback, setExtractionFeedback] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
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
    setIsAdding(false);
  };

  const handleAiExtractMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiExtractInput.trim()) return;

    setIsExtracting(true);
    setExtractionFeedback(null);

    try {
      const response = await fetch('/api/ai/extract-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputStatement: aiExtractInput.trim() }),
      });

      if (!response.ok) throw new Error('Falha no servidor');

      const extracted = await response.json();

      onAddMemory({
        categoria: (extracted.categoria as MemoryCategory) || 'identidade',
        titulo: extracted.titulo || 'Memória Registrada',
        conteudo: extracted.conteudo || aiExtractInput.trim(),
        importancia: (extracted.importancia as MemoryImportance) || 'media',
        origin: 'auto_extracted',
      });

      setExtractionFeedback(`Memória salva na categoria "${extracted.categoria || 'geral'}"!`);
      setAiExtractInput('');
    } catch (err: any) {
      console.error(err);
      onAddMemory({
        categoria: 'identidade',
        titulo: 'Memória Registrada',
        conteudo: aiExtractInput.trim(),
        importancia: 'alta',
        origin: 'auto_extracted',
      });
      setExtractionFeedback('Memória registrada!');
      setAiExtractInput('');
    } finally {
      setIsExtracting(false);
    }
  };

  const filteredMemories = memories.filter((mem) => {
    const matchesCategory = selectedCategory === 'todas' || mem.categoria === selectedCategory;
    const matchesSearch =
      mem.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.conteudo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-100">
      {/* Top Header */}
      <div className="relative rounded-2xl overflow-hidden border border-blue-900/40 bg-gradient-to-r from-[#091530] via-[#0D1C44] to-[#112356] p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Memória Viva ({memories.length} Registros)
            </h2>
            <p className="text-xs text-slate-300 font-light">
              Base de conhecimento do Wesley Pessoa, Imobiliária INC e diretrizes estratégicas.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsAdding(!isAdding)}
          variant="primary"
          size="md"
          icon={Plus}
        >
          {isAdding ? 'Fechar Formulário' : 'Criar Memória'}
        </Button>
      </div>

      {/* AI Automatic Memory Extraction Section */}
      <Panel variant="highlight" className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Extração Automática com IA (Memória Viva)</span>
        </div>
        <p className="text-xs text-slate-300 font-light">
          Digite qualquer aprendizado, preferência ou diretriz comercial. A IA categorizará e salvará no cérebro do RAXXER.
        </p>

        <form onSubmit={handleAiExtractMemory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={aiExtractInput}
            onChange={(e) => setAiExtractInput(e.target.value)}
            placeholder='Ex: "Preferência: Reuniões comerciais de apresentação de imóveis devem ocorrer à tarde."'
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          <Button
            type="submit"
            disabled={isExtracting || !aiExtractInput.trim()}
            variant="primary"
            size="md"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" />
                <span>Processando...</span>
              </>
            ) : (
              <span>Salvar com IA</span>
            )}
          </Button>
        </form>

        {extractionFeedback && (
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 pt-1 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {extractionFeedback}
          </p>
        )}
      </Panel>

      {/* Manual Memory Form Collapsible */}
      {isAdding && (
        <Panel variant="default" className="p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
            <h3 className="text-sm font-bold text-white">Adicionar Memória Manual</h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Título</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Padrão de Contato Comercial da INC"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Categoria (9 Áreas)</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as MemoryCategory)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs focus:outline-none focus:border-blue-500 capitalize"
                >
                  {Object.keys(CATEGORY_DETAILS).map((catKey) => (
                    <option key={catKey} value={catKey}>
                      {CATEGORY_DETAILS[catKey as MemoryCategory].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-300">Conteúdo da Memória</label>
                <textarea
                  rows={3}
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Ex: Detalhes importantes, processos, preferências..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Importância</label>
                <select
                  value={importancia}
                  onChange={(e) => setImportancia(e.target.value as MemoryImportance)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-blue-900/40">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Salvar Memória
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === 'todas'
                ? 'bg-blue-950/80 text-cyan-300 border-blue-500/50 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                : 'bg-[#0A122A] text-slate-400 hover:text-white border-blue-900/40'
            }`}
          >
            Todas ({memories.length})
          </button>

          {Object.keys(CATEGORY_DETAILS).map((catKey) => {
            const cat = CATEGORY_DETAILS[catKey as MemoryCategory];
            const count = memories.filter((m) => m.categoria === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey as MemoryCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  selectedCategory === catKey
                    ? 'bg-blue-950/80 text-cyan-300 border-blue-500/50 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                    : 'bg-[#0A122A] text-slate-400 hover:text-white border-blue-900/40'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar nas memórias..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMemories.map((mem) => {
          const catDetail = CATEGORY_DETAILS[mem.categoria] || CATEGORY_DETAILS.identidade;
          return (
            <Panel
              key={mem.id}
              variant="default"
              className="p-5 space-y-3 flex flex-col justify-between hover:border-blue-700/50 transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-blue-950/70 text-cyan-300 border-blue-500/40">
                    {catDetail.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border font-mono ${
                        mem.importancia === 'alta'
                          ? 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                          : mem.importancia === 'media'
                          ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-700/50'
                      }`}
                    >
                      {mem.importancia}
                    </span>
                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Excluir Memória"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {mem.titulo}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {mem.conteudo}
                </p>
              </div>

              <div className="pt-3 border-t border-blue-900/30 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {new Date(mem.data).toLocaleDateString('pt-BR')}
                </span>
                {mem.origin && (
                  <span className="capitalize font-semibold text-cyan-400">
                    {mem.origin === 'interview'
                      ? 'Entrevista'
                      : mem.origin === 'auto_extracted'
                      ? 'Extração IA'
                      : 'Manual'}
                  </span>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
};
