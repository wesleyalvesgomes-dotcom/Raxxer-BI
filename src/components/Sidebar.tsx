import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Filter,
  DollarSign,
  CheckSquare,
  Calendar,
  CreditCard,
  BarChart2,
  Bot,
  Settings,
  MoreHorizontal,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName?: string;
  onOpenAIChat?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userName = 'Wesley Alves',
  onOpenAIChat,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: 'bi_comercial',
      label: 'Dashboard',
      icon: LayoutDashboard,
      highlight: true,
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: Users,
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: UserCheck,
      targetTab: 'leads',
    },
    {
      id: 'funil_vendas',
      label: 'Funil de Vendas',
      icon: Filter,
    },
    {
      id: 'vendas',
      label: 'Vendas',
      icon: DollarSign,
    },
    {
      id: 'meu_dia',
      label: 'Tarefas',
      icon: CheckSquare,
    },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: Calendar,
      targetTab: 'meu_dia',
    },
    {
      id: 'metas_projetos',
      label: 'Financeiro',
      icon: CreditCard,
    },
    {
      id: 'revisao_semanal',
      label: 'Relatórios',
      icon: BarChart2,
    },
    {
      id: 'raxxer_ai',
      label: 'RAXXER AI',
      icon: Bot,
      isAI: true,
    },
    {
      id: 'dashboard',
      label: 'Configurações',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`w-64 shrink-0 bg-[#030712] border-r border-blue-950/70 flex flex-col justify-between min-h-screen select-none z-50 font-sans transition-transform duration-300 ${
          isOpenMobile
            ? 'fixed inset-y-0 left-0 shadow-2xl translate-x-0'
            : 'hidden lg:flex'
        }`}
      >
        {/* Top Brand */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div
              onClick={() => {
                setActiveTab('bi_comercial');
                onCloseMobile?.();
              }}
              className="cursor-pointer group flex flex-col items-start"
            >
              <div className="flex items-center tracking-wider text-2xl font-black">
                <span className="text-white">RAX</span>
                <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">XER</span>
              </div>
              <span className="text-[9px] font-bold tracking-[0.22em] text-blue-400/90 uppercase mt-0.5">
                SEU SEGUNDO CÉREBRO
              </span>
            </div>

            {/* Fechar no Mobile */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation items */}
          <nav className="mt-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    if (item.isAI && onOpenAIChat) {
                      onOpenAIChat();
                    } else {
                      setActiveTab(item.targetTab || item.id);
                    }
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_0_18px_rgba(37,99,235,0.45)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

      {/* Bottom Profile & Aesthetic Footer */}
      <div className="p-5 pt-0 space-y-4">
        {/* Subtle mountain backdrop glow */}
        <div className="relative rounded-2xl p-3 bg-gradient-to-b from-blue-950/20 to-[#0B152E]/60 border border-blue-900/30 overflow-hidden">
          {/* Ambient crescent blue light */}
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-500/20 blur-2xl rounded-full pointer-events-none" />

          {/* User profile row */}
          <div className="flex items-center justify-between gap-2.5 relative z-10">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shrink-0 shadow-md">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs uppercase overflow-hidden">
                  {userName.slice(0, 2)}
                </div>
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{userName}</div>
                <div className="text-[10px] text-blue-400 font-medium">Em evolução</div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              title="Perfil"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Motivational quote */}
        <div className="text-center px-1">
          <p className="text-[11px] text-slate-400 italic font-serif leading-relaxed">
            &ldquo;Disciplina hoje, resultados amanhã.&rdquo;
          </p>
        </div>
      </div>
    </aside>
    </>
  );
};
