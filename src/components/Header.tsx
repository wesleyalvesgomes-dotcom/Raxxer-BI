import React from 'react';
import {
  Zap,
  LayoutDashboard,
  CalendarCheck,
  Target,
  Users,
  Filter,
  DollarSign,
  BookMarked,
  BarChart3,
  TrendingUp,
  Bot,
  UserCheck,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { useCurrentDateTime } from '../hooks/useCurrentDateTime';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
  onOpenQuickMemoryModal: () => void;
  onOpenAIChat: () => void;
  onStartInterview: () => void;
  memoriesCount: number;
  leadsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userName = 'Wesley',
  onOpenQuickMemoryModal,
  onOpenAIChat,
  onStartInterview,
  memoriesCount,
  leadsCount = 0,
}) => {
  const safeUserName = (userName && userName.trim()) || 'Wesley';
  const { fullDate: formattedDate } = useCurrentDateTime(safeUserName);

  return (
    <header className="sticky top-0 z-40 px-4 lg:px-8 py-3 bg-[#050914]/95 backdrop-blur-md border-b border-blue-900/40 text-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logo & Status */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('bi_comercial')}
          >
            <div className="flex items-center tracking-wider text-xl font-black">
              <span className="text-white">RAX</span>
              <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">XER</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-emerald-950/60 text-emerald-400 border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ativo
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400">
                Secretário Pessoal Inteligente <span className="text-slate-600">|</span>{' '}
                <span className="text-slate-300">{formattedDate}</span>
              </p>
            </div>
          </div>

          {/* Mobile AI button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAIChat}
              className="p-2 rounded-xl border bg-blue-950/60 text-cyan-300 border-blue-800/50 hover:bg-blue-900/60 transition-colors"
              title="Abrir Copiloto RAXXER"
            >
              <Bot className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            id="nav-tab-bi-comercial"
            onClick={() => setActiveTab('bi_comercial')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'bi_comercial'
                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_0_18px_rgba(37,99,235,0.45)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            BI Comercial
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_0_18px_rgba(37,99,235,0.45)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard Pessoal
          </button>

          <button
            onClick={() => setActiveTab('meu_dia')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'meu_dia'
                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_0_18px_rgba(37,99,235,0.45)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Meu Dia
          </button>

          <button
            onClick={() => setActiveTab('metas_projetos')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'metas_projetos'
                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_0_18px_rgba(37,99,235,0.45)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Target className="w-4 h-4" />
            Metas & Projetos
          </button>

          <button
            id="nav-tab-leads"
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_0_18px_rgba(37,99,235,0.45)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Users className="w-4 h-4" />
            Leads
            {leadsCount > 0 && (
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'leads'
                    ? 'bg-white text-blue-900'
                    : 'bg-blue-950 text-blue-300 border border-blue-800/40'
                }`}
              >
                {leadsCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-funil-vendas"
            onClick={() => setActiveTab('funil_vendas')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'funil_vendas'
                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_0_18px_rgba(37,99,235,0.45)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Filter className="w-4 h-4" />
            Funil de Vendas
          </button>

          <button
            id="nav-tab-vendas"
            onClick={() => setActiveTab('vendas')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'vendas'
                ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-[0_0_18px_rgba(6,182,212,0.45)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Vendas
          </button>

          <button
            onClick={() => setActiveTab('memoria_viva')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'memoria_viva'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-[0_0_18px_rgba(147,51,234,0.45)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <BookMarked className="w-4 h-4 text-purple-400" />
            Memória Viva
            <span
              className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'memoria_viva'
                  ? 'bg-white text-purple-900'
                  : 'bg-purple-950 text-purple-300 border border-purple-800/40'
              }`}
            >
              {memoriesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('evolucao')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'evolucao'
                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_0_18px_rgba(37,99,235,0.45)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Evolução
          </button>

          <button
            onClick={() => setActiveTab('revisao_semanal')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'revisao_semanal'
                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_0_18px_rgba(37,99,235,0.45)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Revisão Semanal
          </button>
        </nav>

        {/* Header Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={onOpenQuickMemoryModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border bg-[#0B1428] text-slate-300 border-blue-900/50 hover:bg-blue-900/40 hover:text-white transition-all cursor-pointer"
            title="Adicionar memória rápida"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Memória</span>
          </button>

          <button
            onClick={onStartInterview}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border bg-purple-950/40 text-purple-300 border-purple-800/40 hover:bg-purple-900/40 hover:text-white transition-all cursor-pointer"
            title="Refazer Entrevista Inicial"
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Entrevista</span>
          </button>

          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(56,189,248,0.35)] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Secretário RAXXER</span>
          </button>
        </div>
      </div>
    </header>
  );
};
