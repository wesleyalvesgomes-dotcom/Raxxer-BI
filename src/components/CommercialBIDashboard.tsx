import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  Users,
  MessageSquare,
  FileCheck,
  DollarSign,
  Calendar,
  Clock,
  Bot,
  Flame,
  ArrowRight,
  ChevronDown,
  Search,
  Bell,
  SlidersHorizontal,
  FileText,
  Target,
  MoreHorizontal,
  ChevronRight,
  Heart,
  CalendarDays,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useCommercialData } from '../hooks/useCommercialData';
import { useCurrentDateTime } from '../hooks/useCurrentDateTime';

interface CommercialBIDashboardProps {
  userName?: string;
  onNavigate: (tab: string) => void;
  onOpenAIChat?: (prompt?: string) => void;
}

export const CommercialBIDashboard: React.FC<CommercialBIDashboardProps> = ({
  userName = 'Wesley',
  onNavigate,
  onOpenAIChat,
}) => {
  const { leads, visits, proposals, sales, goals } = useCommercialData();
  const [periodFilter, setPeriodFilter] = useState<'mes' | 'trimestre' | 'ano'>('mes');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const matchedLeads = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return leads
      .filter(
        (l) =>
          l.nome.toLowerCase().includes(q) ||
          (l.telefone && l.telefone.includes(q)) ||
          (l.empreendimentoInteresse && l.empreendimentoInteresse.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [leads, searchQuery]);

  // 1. DADOS E INDICADORES REAIS
  const metrics = useMemo(() => {
    const totalLeads = leads.length;

    // Em atendimento: leads em tratativas e atendimento
    const emAtendimento = leads.filter((l) =>
      ['atendimento', 'primeira_tratativa', 'segunda_tratativa', 'terceira_tratativa'].includes(l.etapa)
    ).length;

    // Documentação: etapa de documentação
    const emDocumentacao = leads.filter((l) => l.etapa === 'documentacao').length;

    // Vendas
    const vendasCount =
      sales.filter((s) => s.status === 'fechada' || s.status === 'faturada').length +
      leads.filter((l) => l.etapa === 'venda').length;

    // VGV (Valor Geral de Vendas)
    const vgvVendas = sales
      .filter((s) => s.status === 'fechada' || s.status === 'faturada')
      .reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);
    const vgvLeadsVenda = leads
      .filter((l) => l.etapa === 'venda' && typeof l.valorEstimado === 'number')
      .reduce((acc, curr) => acc + (curr.valorEstimado || 0), 0);
    const totalVGV = vgvVendas > 0 ? vgvVendas : vgvLeadsVenda;

    // Ticket médio
    const ticketMedio = vendasCount > 0 ? totalVGV / vendasCount : 0;

    // Taxa de conversão
    const taxaConversao = totalLeads > 0 ? (vendasCount / totalLeads) * 100 : 0;

    // Metas do Mês
    let metaVendasAlvo = 10;
    let realizadoVendas = vendasCount;
    let percentualMeta = 0;
    if (goals && goals.length > 0) {
      const g = goals[0];
      if (g.metaVendasQuantidade > 0) {
        metaVendasAlvo = g.metaVendasQuantidade;
        realizadoVendas = g.realizadoVendasQuantidade || vendasCount;
        percentualMeta = Math.min(100, Math.round((realizadoVendas / metaVendasAlvo) * 100));
      }
    } else {
      percentualMeta = totalLeads > 0 ? Math.min(100, Math.round((vendasCount / metaVendasAlvo) * 100)) : 0;
    }

    // Leads parados
    const agora = Date.now();
    const seteDiasMs = 7 * 24 * 60 * 60 * 1000;
    const leadsParados = leads.filter((l) => {
      if (l.etapa === 'venda' || l.etapa === 'perdido') return false;
      if (!l.dataUltimoContato) {
        const criadoEm = new Date(l.dataCriacao).getTime();
        return agora - criadoEm > 3 * 24 * 60 * 60 * 1000;
      }
      const ultimo = new Date(l.dataUltimoContato).getTime();
      return agora - ultimo > seteDiasMs;
    }).length;

    // Leads quentes
    const leadsQuentes = leads.filter((l) => l.temperatura === 'quente').length;

    // Visitas agendadas
    const visitasAgendadas =
      visits.filter((v) => v.status === 'agendada').length +
      leads.filter((l) => l.etapa === 'visita_agendada').length;

    // Propostas pendentes
    const propostasPendentes =
      proposals.filter((p) => p.status === 'em_analise' || p.status === 'enviada').length +
      leads.filter((l) => l.etapa === 'proposta').length;

    return {
      totalLeads,
      emAtendimento,
      emDocumentacao,
      vendasCount,
      totalVGV,
      ticketMedio,
      taxaConversao,
      metaVendasAlvo,
      realizadoVendas,
      percentualMeta,
      leadsParados,
      leadsQuentes,
      visitasAgendadas,
      propostasPendentes,
    };
  }, [leads, visits, proposals, sales, goals]);

  // Formatação de moeda compacta
  const formatMoedaCompacta = (val: number) => {
    if (val === 0) return 'R$ 0';
    if (val >= 1_000_000) {
      const millions = (val / 1_000_000).toFixed(1).replace('.', ',');
      return `R$ ${millions}M`;
    }
    if (val >= 1_000) {
      const mil = Math.round(val / 1_000);
      return `R$ ${mil} mil`;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  // 2. FUNIL DE VENDAS COM FORMATO 3D REAL (CONE ESCALONADO) E BARRAS
  const funnelStages = useMemo(() => {
    const total = metrics.totalLeads;
    const countByStage: Record<string, number> = {};
    leads.forEach((l) => {
      countByStage[l.etapa] = (countByStage[l.etapa] || 0) + 1;
    });

    const stages = [
      {
        id: 'leads',
        name: 'Leads',
        count: total,
        pct: 100,
        colorClass: 'from-[#2563EB] to-[#38BDF8]',
        barGradient: 'from-blue-600 via-cyan-400 to-cyan-300',
        widthPercent: 100,
        height: 'h-7',
      },
      {
        id: 'primeira_tratativa',
        name: '1ª Tratativa',
        count: countByStage['primeira_tratativa'] || 0,
        pct: total > 0 ? Math.round(((countByStage['primeira_tratativa'] || 0) / total) * 100) : 0,
        colorClass: 'from-[#4F46E5] to-[#6366F1]',
        barGradient: 'from-indigo-600 to-blue-500',
        widthPercent: 84,
        height: 'h-6',
      },
      {
        id: 'segunda_tratativa',
        name: '2ª Tratativa',
        count: countByStage['segunda_tratativa'] || 0,
        pct: total > 0 ? Math.round(((countByStage['segunda_tratativa'] || 0) / total) * 100) : 0,
        colorClass: 'from-[#7C3AED] to-[#A855F7]',
        barGradient: 'from-purple-600 to-pink-500',
        widthPercent: 70,
        height: 'h-6',
      },
      {
        id: 'atendimentos',
        name: 'Atendimentos',
        count: (countByStage['atendimento'] || 0) + (countByStage['terceira_tratativa'] || 0),
        pct: total > 0 ? Math.round((((countByStage['atendimento'] || 0) + (countByStage['terceira_tratativa'] || 0)) / total) * 100) : 0,
        colorClass: 'from-[#DB2777] to-[#F43F5E]',
        barGradient: 'from-pink-600 to-rose-400',
        widthPercent: 56,
        height: 'h-6',
      },
      {
        id: 'documentacao',
        name: 'Documentação',
        count: (countByStage['documentacao'] || 0) + (countByStage['visita_agendada'] || 0) + (countByStage['proposta'] || 0),
        pct: total > 0 ? Math.round((((countByStage['documentacao'] || 0) + (countByStage['visita_agendada'] || 0) + (countByStage['proposta'] || 0)) / total) * 100) : 0,
        colorClass: 'from-[#D97706] to-[#F59E0B]',
        barGradient: 'from-amber-600 to-yellow-400',
        widthPercent: 42,
        height: 'h-6',
      },
      {
        id: 'vendas',
        name: 'Vendas',
        count: metrics.vendasCount,
        pct: total > 0 ? Math.round((metrics.vendasCount / total) * 100) : 0,
        colorClass: 'from-[#059669] to-[#10B981]',
        barGradient: 'from-emerald-600 to-teal-400',
        widthPercent: 28,
        height: 'h-6',
      },
    ];

    return stages;
  }, [leads, metrics.totalLeads, metrics.vendasCount]);

  // 3. EVOLUÇÃO DE VENDAS
  const salesEvolutionData = useMemo(() => {
    const meses = ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'];
    return meses.map((mes, idx) => {
      let vendas = 0;
      if (idx === 5) {
        vendas = metrics.vendasCount;
      }
      return {
        mes,
        vendas,
      };
    });
  }, [metrics.vendasCount]);

  // 4. DONUTS COM CORES EXATAS DA REFERÊNCIA
  const leadOriginData = useMemo(() => {
    const total = metrics.totalLeads || 1;
    const originMap: Record<string, number> = {};
    leads.forEach((l) => {
      const orig = l.canalOrigem || 'Outros';
      originMap[orig] = (originMap[orig] || 0) + 1;
    });

    const defaultList = [
      { name: 'Site', pct: 38, color: '#38BDF8' },
      { name: 'Indicação', pct: 28, color: '#4F46E5' },
      { name: 'Redes Sociais', pct: 18, color: '#EC4899' },
      { name: 'Plantão', pct: 10, color: '#F59E0B' },
      { name: 'Outros', pct: 6, color: '#10B981' },
    ];

    if (metrics.totalLeads === 0) {
      return defaultList.map((d) => ({
        name: d.name,
        value: 0,
        percent: d.pct,
        color: d.color,
      }));
    }

    return Object.entries(originMap).map(([name, val], idx) => {
      const colors = ['#38BDF8', '#4F46E5', '#EC4899', '#F59E0B', '#10B981'];
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value: val,
        percent: Math.round((val / total) * 100),
        color: colors[idx % colors.length],
      };
    });
  }, [leads, metrics.totalLeads]);

  const leadStatusData = useMemo(() => {
    const total = metrics.totalLeads;
    if (total === 0) {
      return [
        { name: 'Novos', percent: 32, value: 0, color: '#38BDF8' },
        { name: 'Em contato', percent: 28, value: 0, color: '#6366F1' },
        { name: 'Sem retorno', percent: 18, value: 0, color: '#F43F5E' },
        { name: 'Em negociação', percent: 14, value: 0, color: '#F59E0B' },
        { name: 'Perdidos', percent: 8, value: 0, color: '#64748B' },
      ];
    }

    const novos = leads.filter((l) => l.etapa === 'novo_lead').length;
    const emContato = leads.filter((l) => ['primeira_tratativa', 'segunda_tratativa'].includes(l.etapa)).length;
    const semRetorno = metrics.leadsParados;
    const emNegociacao = leads.filter((l) => ['atendimento', 'documentacao', 'visita_agendada', 'proposta'].includes(l.etapa)).length;
    const perdidos = leads.filter((l) => l.etapa === 'perdido' || l.status === 'arquivado').length;

    return [
      { name: 'Novos', value: novos, percent: Math.round((novos / total) * 100), color: '#38BDF8' },
      { name: 'Em contato', value: emContato, percent: Math.round((emContato / total) * 100), color: '#6366F1' },
      { name: 'Sem retorno', value: semRetorno, percent: Math.round((semRetorno / total) * 100), color: '#F43F5E' },
      { name: 'Em negociação', value: emNegociacao, percent: Math.round((emNegociacao / total) * 100), color: '#F59E0B' },
      { name: 'Perdidos', value: perdidos, percent: Math.round((perdidos / total) * 100), color: '#64748B' },
    ];
  }, [leads, metrics.totalLeads, metrics.leadsParados]);

  // 5. TAREFAS OPERACIONAIS
  const taskItems = useMemo(() => {
    return [
      {
        id: 't1',
        title: 'Retornar para João Silva',
        time: 'Hoje - 10:00',
        badge: 'Ligação',
        badgeColor: 'bg-[#0E2F56] text-[#38BDF8] border border-blue-500/30',
      },
      {
        id: 't2',
        title: 'Enviar proposta para cliente',
        time: 'Hoje - 14:00',
        badge: 'Proposta',
        badgeColor: 'bg-[#1E1B4B] text-[#818CF8] border border-indigo-500/30',
      },
      {
        id: 't3',
        title: 'Confirmar visita',
        time: 'Hoje - 16:00',
        badge: 'Visita',
        badgeColor: 'bg-[#083344] text-[#22D3EE] border border-cyan-500/30',
      },
      {
        id: 't4',
        title: 'Atualizar CRM',
        time: 'Hoje - 17:00',
        badge: 'Sistema',
        badgeColor: 'bg-[#0B2545] text-[#60A5FA] border border-blue-400/30',
      },
    ];
  }, []);

  // 6. ÚLTIMAS ATIVIDADES
  const activityItems = useMemo(() => {
    return [
      {
        id: 'a1',
        title: 'Novo lead recebido',
        sub: 'Carlos Mendes - Site',
        time: 'Hoje - 09:12',
        icon: Users,
        iconBg: 'bg-blue-600/30 text-blue-400 border border-blue-500/40',
      },
      {
        id: 'a2',
        title: 'Proposta enviada',
        sub: 'Ana Paula - E-mail',
        time: 'Hoje - 08:45',
        icon: FileText,
        iconBg: 'bg-purple-600/30 text-purple-400 border border-purple-500/40',
      },
      {
        id: 'a3',
        title: 'Visita realizada',
        sub: 'Ricardo Lima',
        time: 'Ontem - 17:30',
        icon: Heart,
        iconBg: 'bg-rose-600/30 text-rose-400 border border-rose-500/40',
      },
      {
        id: 'a4',
        title: 'Venda registrada',
        sub: 'Mariana Costa',
        time: 'Ontem - 16:20',
        icon: TrendingUp,
        iconBg: 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40',
      },
    ];
  }, []);

  // Data, relógio digital futurista e saudação dinâmica calculados em tempo real
  const { greeting, timeStr: currentTimeStr, weekday, dateDetail } = useCurrentDateTime(userName);

  return (
    <div className="w-full bg-[#070C1A] text-slate-100 p-5 lg:p-7 space-y-6 font-sans select-none min-h-screen">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR: BUSCA, PERÍODO, NOTIFICAÇÕES & DIGITAL CLOCK           */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input with ⌘ K */}
        <div className="w-full md:w-[420px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar leads, clientes, tarefas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-14 py-2.5 bg-[#0B132B] border border-blue-900/40 focus:border-blue-500/70 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800/40 text-[10px] text-slate-400 font-mono">
            ⌘ K
          </div>

          {/* Quick Search Results Dropdown */}
          {searchQuery.trim() !== '' && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#0B132B] border border-blue-900/60 rounded-xl shadow-2xl p-2 z-50 space-y-1">
              {matchedLeads.length > 0 ? (
                <>
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Leads Encontrados ({matchedLeads.length})
                  </div>
                  {matchedLeads.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setSearchQuery('');
                        onNavigate('leads');
                      }}
                      className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-blue-950/60 transition-colors text-xs text-slate-200 cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-white">{l.nome}</div>
                        <div className="text-[10px] text-slate-400">{l.telefone || l.email || 'Sem contato'} • {l.empreendimentoInteresse || 'Geral'}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/50 text-cyan-300 capitalize">
                        {l.etapa.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      onNavigate('leads');
                    }}
                    className="w-full text-center py-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium border-t border-blue-900/40 mt-1 cursor-pointer"
                  >
                    Ver todos no módulo Leads →
                  </button>
                </>
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  Nenhum resultado encontrado para &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right tools: Seletor de Período, Sinos, Data e Relógio 08:24 */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Seletor "Este mês" */}
          <div className="relative">
            <button
              onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B132B] border border-blue-900/40 hover:border-blue-700/60 text-xs text-slate-200 cursor-pointer transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-medium">
                {periodFilter === 'mes' ? 'Este mês' : periodFilter === 'trimestre' ? 'Este trimestre' : 'Este ano'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isPeriodDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-[#0B132B] border border-blue-900/60 rounded-xl shadow-2xl p-1 z-50">
                {(['mes', 'trimestre', 'ano'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setPeriodFilter(period);
                      setIsPeriodDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      periodFilter === period
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-blue-950/60'
                    }`}
                  >
                    {period === 'mes' ? 'Este mês' : period === 'trimestre' ? 'Este trimestre' : 'Este ano'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sinos de Notificação */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('leads')}
              className="p-2.5 rounded-xl bg-[#0B132B] border border-blue-900/40 text-slate-300 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('leads')}
              className="p-2.5 rounded-xl bg-[#0B132B] border border-blue-900/40 text-slate-300 hover:text-blue-400 transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 right-2 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 right-2" />
            </button>
          </div>

          {/* Data e Relógio Digital */}
          <div className="flex items-center gap-3 pl-3 border-l border-blue-900/30">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-medium text-slate-300 capitalize">
                {weekday}
              </div>
              <div className="text-[10px] text-slate-500">
                {dateDetail}
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-[#0B1533] border border-blue-800/40 text-white font-mono text-xl font-bold tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              {currentTimeStr}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WELCOME BANNER WITH MOUNTAINS / EXPLORER ATMOSPHERE & QUOTE             */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl overflow-hidden border border-blue-900/40 bg-gradient-to-r from-[#091530] via-[#0D1C44] to-[#112356] p-6 shadow-xl">
        {/* Mountain explorer artwork atmosphere using layered SVG */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 pointer-events-none overflow-hidden opacity-40">
          <svg className="w-full h-full object-cover" viewBox="0 0 500 200" preserveAspectRatio="none">
            <defs>
              <radialGradient id="nebulaGlow" cx="70%" cy="30%" r="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#818CF8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="500" height="200" fill="url(#nebulaGlow)" />
            {/* Mountain silhouette */}
            <path
              d="M180,200 L260,110 L310,140 L370,80 L440,160 L500,120 L500,200 Z"
              fill="#060B18"
              opacity="0.9"
            />
            {/* Foreground small silhouette */}
            <circle cx="370" cy="74" r="5" fill="#38BDF8" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {greeting}, <span className="text-[#38BDF8]">{userName}!</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-light">
              Foco, execução e resultados. Você está no controle.
            </p>
          </div>

          <div className="text-right max-w-sm hidden md:block">
            <p className="text-xs text-blue-200/90 italic font-serif leading-relaxed">
              &ldquo;Grandes resultados são a soma de pequenas ações bem executadas.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ROW DE 5 CARDS INDICADORES: LEADS, ATENDIMENTO, DOCS, VENDAS, VGV       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Leads */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-blue-900/40 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-full bg-[#132A54] border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400 font-mono">
              ↑ 12%
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Leads</div>
            <div className="text-2xl font-black text-white font-mono tracking-tight mt-0.5">
              {metrics.totalLeads}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Novos no período</div>
          </div>
        </div>

        {/* Card 2: Em atendimento */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-blue-900/40 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-full bg-[#241B4B] border border-purple-500/30 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400 font-mono">
              ↑ 8%
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Em atendimento</div>
            <div className="text-2xl font-black text-white font-mono tracking-tight mt-0.5">
              {metrics.emAtendimento}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Leads em andamento</div>
          </div>
        </div>

        {/* Card 3: Documentação */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-blue-900/40 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-full bg-[#362512] border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400 font-mono">
              ↑ 20%
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Documentação</div>
            <div className="text-2xl font-black text-white font-mono tracking-tight mt-0.5">
              {metrics.emDocumentacao}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Em análise</div>
          </div>
        </div>

        {/* Card 4: Vendas */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-blue-900/40 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-full bg-[#0D2F38] border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400 font-mono">
              ↑ 25%
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Vendas</div>
            <div className="text-2xl font-black text-white font-mono tracking-tight mt-0.5">
              {metrics.vendasCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Fechadas no período</div>
          </div>
        </div>

        {/* Card 5: VGV (HIGHLIGHT CARD EM VERDE ESMERALDA COM BRILHO) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#062424] via-[#07302F] to-[#0A3D3C] border border-emerald-500/50 hover:border-emerald-400/80 transition-all flex flex-col justify-between space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.18)] col-span-2 sm:col-span-1">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-300 font-mono">
              ↑ 32%
            </span>
          </div>
          <div>
            <div className="text-xs text-emerald-300 font-medium">VGV</div>
            <div className="text-2xl font-black text-emerald-200 font-mono tracking-tight mt-0.5 truncate">
              {formatMoedaCompacta(metrics.totalVGV)}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1">Volume geral de vendas</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SEÇÃO DO MEIO (3 COLUNAS): FUNIL + EVOLUÇÃO DE VENDAS + RAXXER AI        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* COLUNA 1: FUNIL DE VENDAS (4 COLUNAS) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Funil de Vendas</h3>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-800/30">
              <span>Este mês</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>
          </div>

          {/* Cone 3D escalonado alinhado com as barras horizontais */}
          <div className="space-y-3 py-1">
            {funnelStages.map((stage) => (
              <div key={stage.id} className="flex items-center gap-3">
                {/* Visual funil escalonado com o número dentro */}
                <div className="w-20 shrink-0 flex items-center justify-center">
                  <div
                    style={{ width: `${stage.widthPercent}%` }}
                    className={`h-6 rounded-md bg-gradient-to-r ${stage.colorClass} text-white font-mono text-[11px] font-bold flex items-center justify-center shadow-md transition-all`}
                  >
                    {stage.count}
                  </div>
                </div>

                {/* Nome da etapa */}
                <div className="w-24 text-[11px] font-medium text-slate-300 truncate">
                  {stage.name}
                </div>

                {/* Barra de progresso horizontal e percentual */}
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-[#050B17] rounded-full h-2.5 overflow-hidden border border-blue-950">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${stage.barGradient} transition-all duration-500`}
                      style={{ width: `${Math.max(4, stage.pct)}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[11px] font-mono font-bold text-slate-300">
                    {stage.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-blue-900/30 flex items-center justify-between text-[11px] text-slate-400">
            <span>Conversão total no funil:</span>
            <span className="font-mono font-bold text-cyan-300">{metrics.taxaConversao.toFixed(1)}%</span>
          </div>
        </div>

        {/* COLUNA 2: EVOLUÇÃO DE VENDAS COM GRÁFICO NEON (5 COLUNAS) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Evolução de Vendas</h3>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-800/30">
              <span>Últimos 6 meses</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>
          </div>

          {/* Gráfico de Linha Neon Fluido */}
          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesEvolutionData} margin={{ top: 15, right: 15, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="neonCyanArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="mes"
                  stroke="#334155"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#334155"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#091329',
                    borderColor: '#38BDF8',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '11px',
                    boxShadow: '0 0 15px rgba(56,189,248,0.3)',
                  }}
                  formatter={(val: any) => [`${val} vendas`, 'Set/2025']}
                />
                <Area
                  type="monotone"
                  dataKey="vendas"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  fill="url(#neonCyanArea)"
                  dot={{ r: 4, fill: '#38BDF8', stroke: '#070C1A', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#67E8F9', stroke: '#0284C7', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 3 Métricas no Rodapé */}
          <div className="pt-3 border-t border-blue-900/30 grid grid-cols-3 gap-2 text-center">
            <div className="space-y-0.5">
              <div className="text-lg font-black text-white font-mono">
                {metrics.vendasCount}
              </div>
              <div className="text-[10px] text-slate-400">Vendas no mês</div>
            </div>
            <div className="space-y-0.5 border-x border-blue-900/30">
              <div className="text-lg font-black text-white font-mono truncate px-1">
                {formatMoedaCompacta(metrics.ticketMedio)}
              </div>
              <div className="text-[10px] text-slate-400">Ticket médio</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg font-black text-cyan-300 font-mono">
                {metrics.taxaConversao.toFixed(0)}%
              </div>
              <div className="text-[10px] text-slate-400">Taxa de conversão</div>
            </div>
          </div>
        </div>

        {/* COLUNA 3: RAXXER AI CARD (3 COLUNAS) */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-gradient-to-b from-[#0B1736] to-[#0A1633] border border-blue-600/40 shadow-[0_0_30px_rgba(37,99,235,0.2)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-800/40">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">RAXXER AI</h3>
            </div>
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-200">
              Olá, {userName}!
            </div>
            <p className="text-[11px] text-slate-400">
              Aqui está o resumo de hoje:
            </p>

            <div className="space-y-2.5 pt-1 text-[11px]">
              {/* Alerta 1 */}
              <div className="flex items-start gap-2.5 text-slate-300">
                <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Heart className="w-3 h-3" />
                </div>
                <span>
                  <strong className="text-white">{metrics.leadsParados}</strong> leads aguardando seu retorno
                </span>
              </div>

              {/* Alerta 2 */}
              <div className="flex items-start gap-2.5 text-slate-300">
                <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-3 h-3" />
                </div>
                <span>
                  <strong className="text-white">{metrics.propostasPendentes}</strong> clientes para enviar proposta
                </span>
              </div>

              {/* Alerta 3 */}
              <div className="flex items-start gap-2.5 text-slate-300">
                <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-3 h-3" />
                </div>
                <span>
                  <strong className="text-white">{metrics.visitasAgendadas}</strong> visita agendada hoje às 16:00
                </span>
              </div>

              {/* Alerta 4 */}
              <div className="flex items-start gap-2.5 text-slate-300">
                <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3 h-3" />
                </div>
                <span>
                  Boa oportunidade de fechar <strong className="text-white">2 vendas</strong> esta semana
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenAIChat?.('Faça uma análise completa do meu funil comercial e próximas ações prioritárias')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all cursor-pointer"
          >
            <span>Ver análise completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ROW 3: ORIGEM DOS LEADS + STATUS DOS LEADS + METAS DO MÊS              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* DONUT 1: ORIGEM DOS LEADS */}
        <div className="p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <h3 className="text-sm font-bold text-white tracking-tight">Origem dos Leads</h3>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Donut Chart */}
            <div className="w-28 h-28 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadOriginData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {leadOriginData.map((entry, index) => (
                      <Cell key={`orig-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-black text-white font-mono leading-none">
                  {metrics.totalLeads}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">Leads</span>
              </div>
            </div>

            {/* Legenda com percentuais */}
            <div className="flex-1 space-y-1.5 text-[11px]">
              {leadOriginData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2 truncate pr-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 shrink-0">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DONUT 2: STATUS DOS LEADS */}
        <div className="p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <h3 className="text-sm font-bold text-white tracking-tight">Status dos Leads</h3>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Donut Chart */}
            <div className="w-28 h-28 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {leadStatusData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-black text-white font-mono leading-none">
                  {metrics.totalLeads}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">Leads</span>
              </div>
            </div>

            {/* Legenda com percentuais */}
            <div className="flex-1 space-y-1.5 text-[11px]">
              {leadStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2 truncate pr-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 shrink-0">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 3: METAS DO MÊS (RADIAL GAUGE) */}
        <div className="p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Metas do Mês</h3>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-1">
            {/* Radial Gauge */}
            <div className="w-28 h-28 relative shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#172554"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="url(#radialCyanGradient)"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - metrics.percentualMeta / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="radialCyanGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-white font-mono">
                  {metrics.percentualMeta}%
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  {metrics.realizadoVendas} de {metrics.metaVendasAlvo}
                </span>
                <span className="text-[8px] text-slate-500">vendas realizadas</span>
              </div>
            </div>

            <div className="flex-1 space-y-2.5 text-right">
              <p className="text-xs text-slate-300 italic font-serif leading-relaxed">
                &ldquo;Disciplina é o que te leva mais longe.&rdquo;
              </p>
              <button
                onClick={() => onNavigate('metas_projetos')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-800/60 bg-blue-950/40 hover:bg-blue-900/60 text-cyan-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                <span>Ver detalhes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. ROW 4: PRÓXIMAS TAREFAS + ÚLTIMAS ATIVIDADES + CARD MOTIVACIONAL        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* COLUNA 1: PRÓXIMAS TAREFAS (4 COLUNAS) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <h3 className="text-sm font-bold text-white tracking-tight">Próximas Tarefas</h3>
            <button
              onClick={() => onNavigate('leads')}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-2.5">
            {taskItems.map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded-xl bg-[#0B1530] border border-blue-900/30 flex items-center justify-between gap-2 hover:border-blue-500/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-4 h-4 rounded-full border border-slate-600 hover:border-cyan-400 transition-colors shrink-0 cursor-pointer" />
                  <span className="text-xs text-slate-200 font-medium truncate">{t.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-amber-400/90 font-mono">{t.time}</span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold ${t.badgeColor}`}>
                    {t.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA 2: ÚLTIMAS ATIVIDADES (4 COLUNAS) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <h3 className="text-sm font-bold text-white tracking-tight">Últimas Atividades</h3>
            <button
              onClick={() => onNavigate('leads')}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-2.5">
            {activityItems.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  className="p-2.5 rounded-xl bg-[#0B1530] border border-blue-900/30 flex items-center justify-between gap-2 hover:border-blue-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${act.iconBg}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 truncate">{act.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{act.sub}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-blue-400/80 font-mono shrink-0">{act.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA 3: CARD MOTIVACIONAL CYBERNETIC (4 COLUNAS) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-gradient-to-br from-[#07132B] via-[#091B3E] to-[#0E285C] border border-blue-600/40 shadow-[0_0_30px_rgba(37,99,235,0.2)] flex flex-col justify-between relative overflow-hidden">
          {/* Cybernetic silhouette backdrop on the right */}
          <div className="absolute right-0 top-0 bottom-0 w-36 opacity-30 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="70" cy="50" r="30" fill="#38BDF8" filter="blur(15px)" />
            </svg>
          </div>

          <div className="space-y-3 relative z-10">
            <div className="space-y-1 font-mono font-black text-sm tracking-wider">
              <div className="text-[#38BDF8]">PLANEJE</div>
              <div className="text-[#60A5FA]">EXECUTE</div>
              <div className="text-[#818CF8]">EVOLUA</div>
              <div className="text-white">CONQUISTE</div>
            </div>

            <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />

            <p className="text-xs text-blue-200 font-light leading-relaxed">
              O futuro pertence a quem faz hoje.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between relative z-10">
            <span className="text-[10px] text-slate-500 font-mono">RAXXER INTELLIGENCE</span>
            <button
              onClick={() => onNavigate('leads')}
              className="inline-flex items-center gap-1 text-[11px] text-cyan-300 font-semibold cursor-pointer hover:underline"
            >
              <span>Acessar Leads</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
