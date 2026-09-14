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
  ArrowRight,
  ChevronDown,
  Search,
  Bell,
  SlidersHorizontal,
  Target,
  MoreHorizontal,
  ChevronRight,
  CalendarDays,
  ShieldCheck,
  XCircle,
  PhoneOff,
  UserX,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  CalendarRange,
  Filter,
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
import { COMMERCIAL_STAGES, CommercialLeadStatus } from '../types/commercial';
import heroMountainArt from '../assets/person-mountain.jpg';
import robotTechArt from '../assets/tech-robot.jpg';

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
  const { leads, history, goals } = useCommercialData();
  const [periodFilter, setPeriodFilter] = useState<'mes' | 'semana' | 'hoje' | 'todos'>('mes');
  const [activeTab, setActiveTab] = useState<'bi' | 'diario' | 'semanal' | 'mensal'>('bi');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { weekday, dateDetail, timeStr: currentTimeStr, greeting } = useCurrentDateTime();

  // Busca rápida de leads
  const matchedLeads = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return leads
      .filter(
        (l) =>
          l.nome.toLowerCase().includes(q) ||
          (l.telefone && l.telefone.includes(q)) ||
          (l.whatsapp && l.whatsapp.includes(q)) ||
          (l.empreendimento && l.empreendimento.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [leads, searchQuery]);

  // Formatação de moeda compacta
  const formatMoedaCompacta = (val: number) => {
    if (!val || val === 0) return 'R$ 0';
    if (val >= 1_000_000) {
      const millions = (val / 1_000_000).toFixed(1).replace('.', ',');
      return `R$ ${millions}M`;
    }
    if (val >= 1_000) {
      const mil = Math.round(val / 1_000);
      return `R$ ${mil} mil`;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 1. INDICADORES OFICIAIS DO BI COMERCIAL
  const metrics = useMemo(() => {
    const totalLeads = leads.length;

    const atendimentos = leads.filter((l) => l.status === 'atendimentos').length;
    const naoAtenderam = leads.filter((l) => l.status === 'nao_atenderam').length;
    const emAnalise = leads.filter((l) => l.status === 'em_analise').length;
    const aprovados = leads.filter((l) => l.status === 'aprovados').length;
    const reprovados = leads.filter((l) => l.status === 'reprovados').length;
    const descartados = leads.filter((l) => l.status === 'descartados').length;
    const vendidos = leads.filter((l) => l.status === 'vendidos').length;

    // VGV (Valor Geral de Vendas) - apenas vendas concretizadas
    const totalVGV = leads
      .filter((l) => l.status === 'vendidos')
      .reduce((acc, curr) => acc + (curr.vgv || curr.valorAprovado || 0), 0);

    // Ticket médio
    const ticketMedio = vendidos > 0 ? totalVGV / vendidos : 0;

    // Taxa de conversão para vendas
    const taxaConversao = totalLeads > 0 ? (vendidos / totalLeads) * 100 : 0;

    // Conversão para análise
    const taxaAnalise = totalLeads > 0 ? ((emAnalise + aprovados + vendidos) / totalLeads) * 100 : 0;

    // Metas do Mês
    let metaVendasAlvo = 10;
    let realizadoVendas = vendidos;
    let percentualMeta = 0;
    if (goals && goals.length > 0) {
      const g = goals[0];
      if (g.metaVendasQuantidade > 0) {
        metaVendasAlvo = g.metaVendasQuantidade;
        realizadoVendas = g.realizadoVendasQuantidade || vendidos;
        percentualMeta = Math.min(100, Math.round((realizadoVendas / metaVendasAlvo) * 100));
      }
    } else {
      percentualMeta = totalLeads > 0 ? Math.min(100, Math.round((vendidos / metaVendasAlvo) * 100)) : 0;
    }

    return {
      totalLeads,
      atendimentos,
      naoAtenderam,
      emAnalise,
      aprovados,
      reprovados,
      descartados,
      vendidos,
      totalVGV,
      ticketMedio,
      taxaConversao,
      taxaAnalise,
      metaVendasAlvo,
      realizadoVendas,
      percentualMeta,
    };
  }, [leads, goals]);

  // 2. BALANÇOS DIÁRIO, SEMANAL E MENSAL COM DADOS REAIS
  const balanceData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Helpers de comparação de data
    const isToday = (dStr?: string) => {
      if (!dStr) return false;
      return new Date(dStr).toISOString().split('T')[0] === todayStr;
    };

    const isThisWeek = (dStr?: string) => {
      if (!dStr) return false;
      const d = new Date(dStr);
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    };

    const isPrevWeek = (dStr?: string) => {
      if (!dStr) return false;
      const d = new Date(dStr);
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 7 && diffDays <= 14;
    };

    const isThisMonth = (dStr?: string) => {
      if (!dStr) return false;
      const d = new Date(dStr);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };

    // --- BALANÇO DIÁRIO ---
    const cadastradosHoje = leads.filter((l) => isToday(l.dataCadastro || l.dataCriacao)).length;
    const analisesHoje = leads.filter((l) => isToday(l.dataAnalise)).length;
    const aprovadosHoje = leads.filter((l) => isToday(l.dataAprovacao)).length;
    const reprovadosHoje = leads.filter((l) => isToday(l.dataReprovacao)).length;
    const vendasHojeLeads = leads.filter((l) => l.status === 'vendidos' && isToday(l.dataVenda));
    const vendasHoje = vendasHojeLeads.length;
    const vgvHoje = vendasHojeLeads.reduce((acc, curr) => acc + (curr.vgv || curr.valorAprovado || 0), 0);
    const conversaoHoje = cadastradosHoje > 0 ? (vendasHoje / cadastradosHoje) * 100 : 0;

    // --- BALANÇO SEMANAL ---
    const cadastradosSemana = leads.filter((l) => isThisWeek(l.dataCadastro || l.dataCriacao)).length;
    const analisesSemana = leads.filter((l) => isThisWeek(l.dataAnalise)).length;
    const aprovadosSemana = leads.filter((l) => isThisWeek(l.dataAprovacao)).length;
    const reprovadosSemana = leads.filter((l) => isThisWeek(l.dataReprovacao)).length;
    const vendasSemanaLeads = leads.filter((l) => l.status === 'vendidos' && isThisWeek(l.dataVenda));
    const vendasSemana = vendasSemanaLeads.length;
    const vgvSemana = vendasSemanaLeads.reduce((acc, curr) => acc + (curr.vgv || curr.valorAprovado || 0), 0);
    const convAnaliseSemana = cadastradosSemana > 0 ? (analisesSemana / cadastradosSemana) * 100 : 0;
    const convVendaSemana = cadastradosSemana > 0 ? (vendasSemana / cadastradosSemana) * 100 : 0;

    // Semana anterior (para comparação somente se houver dados)
    const cadastradosSemanaAnt = leads.filter((l) => isPrevWeek(l.dataCadastro || l.dataCriacao)).length;
    const vendasSemanaAnt = leads.filter((l) => l.status === 'vendidos' && isPrevWeek(l.dataVenda)).length;
    const hasDataSemanaAnt = cadastradosSemanaAnt > 0 || vendasSemanaAnt > 0;

    // --- BALANÇO MENSAL ---
    const cadastradosMes = leads.filter((l) => isThisMonth(l.dataCadastro || l.dataCriacao)).length;
    const analisesMes = leads.filter((l) => isThisMonth(l.dataAnalise)).length;
    const aprovadosMes = leads.filter((l) => isThisMonth(l.dataAprovacao)).length;
    const reprovadosMes = leads.filter((l) => isThisMonth(l.dataReprovacao)).length;
    const vendasMesLeads = leads.filter((l) => l.status === 'vendidos' && isThisMonth(l.dataVenda));
    const vendasMes = vendasMesLeads.length;
    const vgvMes = vendasMesLeads.reduce((acc, curr) => acc + (curr.vgv || curr.valorAprovado || 0), 0);
    const convAnaliseMes = cadastradosMes > 0 ? (analisesMes / cadastradosMes) * 100 : 0;
    const convVendaMes = cadastradosMes > 0 ? (vendasMes / cadastradosMes) * 100 : 0;

    return {
      diario: {
        cadastradosHoje,
        atendimentos: metrics.atendimentos,
        naoAtenderam: metrics.naoAtenderam,
        descartados: metrics.descartados,
        analisesHoje,
        aprovadosHoje,
        reprovadosHoje,
        vendasHoje,
        vgvHoje,
        conversaoHoje,
      },
      semanal: {
        cadastradosSemana,
        atendimentos: metrics.atendimentos,
        naoAtenderam: metrics.naoAtenderam,
        descartados: metrics.descartados,
        analisesSemana,
        aprovadosSemana,
        reprovadosSemana,
        vendasSemana,
        vgvSemana,
        convAnaliseSemana,
        convVendaSemana,
        hasDataSemanaAnt,
        cadastradosSemanaAnt,
        vendasSemanaAnt,
      },
      mensal: {
        cadastradosMes,
        atendimentos: metrics.atendimentos,
        naoAtenderam: metrics.naoAtenderam,
        descartados: metrics.descartados,
        analisesMes,
        aprovadosMes,
        reprovadosMes,
        vendasMes,
        vgvMes,
        convAnaliseMes,
        convVendaMes,
        progressoMeta: metrics.percentualMeta,
      },
    };
  }, [leads, metrics]);

  // 3. FUNIL DE VENDAS COM AS ETAPAS OFICIAIS DO RAXXER (Cone escalonado)
  const funnelStages = useMemo(() => {
    const total = metrics.totalLeads;
    const atendimentos = metrics.atendimentos;
    const emAnalise = metrics.emAnalise;
    const aprovados = metrics.aprovados;
    const vendidos = metrics.vendidos;

    return [
      {
        id: 'leads',
        name: 'Total de Leads',
        count: total,
        pct: 100,
        colorClass: 'from-[#2563EB] to-[#38BDF8]',
        barGradient: 'from-blue-600 via-cyan-400 to-cyan-300',
        widthPercent: 100,
      },
      {
        id: 'atendimentos',
        name: 'Atendimentos',
        count: atendimentos,
        pct: total > 0 ? Math.round((atendimentos / total) * 100) : 0,
        colorClass: 'from-[#3B82F6] to-[#60A5FA]',
        barGradient: 'from-blue-500 to-cyan-400',
        widthPercent: 80,
      },
      {
        id: 'em_analise',
        name: 'Em análise',
        count: emAnalise,
        pct: total > 0 ? Math.round((emAnalise / total) * 100) : 0,
        colorClass: 'from-[#D97706] to-[#F59E0B]',
        barGradient: 'from-amber-600 to-yellow-400',
        widthPercent: 62,
      },
      {
        id: 'aprovados',
        name: 'Aprovados',
        count: aprovados,
        pct: total > 0 ? Math.round((aprovados / total) * 100) : 0,
        colorClass: 'from-[#059669] to-[#10B981]',
        barGradient: 'from-emerald-600 to-teal-400',
        widthPercent: 44,
      },
      {
        id: 'vendidos',
        name: 'Vendidos',
        count: vendidos,
        pct: total > 0 ? Math.round((vendidos / total) * 100) : 0,
        colorClass: 'from-[#0891B2] to-[#06B6D4]',
        barGradient: 'from-cyan-600 to-emerald-400',
        widthPercent: 28,
      },
    ];
  }, [metrics]);

  // 4. EVOLUÇÃO DE VENDAS COM BASE NAS DATAS DE VENDA REAIS
  const salesEvolutionData = useMemo(() => {
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();

    // Últimos 6 meses
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();

      const vendasDoMes = leads.filter((l) => {
        if (l.status !== 'vendidos' || !l.dataVenda) return false;
        const vDate = new Date(l.dataVenda);
        return vDate.getMonth() === mIdx && vDate.getFullYear() === yr;
      }).length;

      result.push({
        mes: mesesNomes[mIdx],
        vendas: vendasDoMes,
      });
    }

    // Se ainda não houver histórico retroativo, assegurar pelo menos a contagem atual no último mês
    if (result[5].vendas === 0 && metrics.vendidos > 0) {
      result[5].vendas = metrics.vendidos;
    }

    return result;
  }, [leads, metrics.vendidos]);

  // 5. DISTRIBUIÇÃO DE SITUAÇÕES (AS 7 SITUAÇÕES OFICIAIS)
  const leadStatusData = useMemo(() => {
    const total = metrics.totalLeads;
    if (total === 0) {
      return COMMERCIAL_STAGES.map((s) => ({
        name: s.label,
        value: 0,
        percent: 0,
        color: s.cor,
      }));
    }

    return COMMERCIAL_STAGES.map((s) => {
      const count = leads.filter((l) => l.status === s.id).length;
      return {
        name: s.label,
        value: count,
        percent: Math.round((count / total) * 100),
        color: s.cor,
      };
    });
  }, [leads, metrics.totalLeads]);

  // 6. ORIGEM DOS LEADS
  const leadOriginData = useMemo(() => {
    const total = metrics.totalLeads || 1;
    const originMap: Record<string, number> = {};
    leads.forEach((l) => {
      const orig = l.canalOrigem || 'outro';
      originMap[orig] = (originMap[orig] || 0) + 1;
    });

    const colors = ['#38BDF8', '#4F46E5', '#EC4899', '#F59E0B', '#10B981', '#64748B'];

    if (metrics.totalLeads === 0) {
      return [
        { name: 'WhatsApp', percent: 45, value: 0, color: '#38BDF8' },
        { name: 'Indicação', percent: 25, value: 0, color: '#4F46E5' },
        { name: 'Instagram', percent: 15, value: 0, color: '#EC4899' },
        { name: 'Site', percent: 10, value: 0, color: '#F59E0B' },
        { name: 'Outros', percent: 5, value: 0, color: '#10B981' },
      ];
    }

    return Object.entries(originMap).map(([name, val], idx) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value: val,
      percent: Math.round((val / total) * 100),
      color: colors[idx % colors.length],
    }));
  }, [leads, metrics.totalLeads]);

  // 7. PRÓXIMOS CONTATOS PROGRAMADOS
  const upcomingContacts = useMemo(() => {
    return leads
      .filter((l) => l.proximoContato && l.status !== 'vendidos' && l.status !== 'descartados')
      .sort((a, b) => new Date(a.proximoContato!).getTime() - new Date(b.proximoContato!).getTime())
      .slice(0, 4);
  }, [leads]);

  // 8. HISTÓRICO DE RESULTADOS RECENTES
  const recentHistoryEvents = useMemo(() => {
    if (!history || history.length === 0) {
      return [];
    }
    return history.slice(0, 4);
  }, [history]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP BAR COM BUSCA, SELEÇÃO DE PERÍODO, NOTIFICAÇÕES E RELÓGIO          */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Campo de Busca Rápida */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-busca-dashboard"
            type="text"
            placeholder="Buscar lead por nome, telefone ou empreendimento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B132B] border border-blue-900/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />

          {/* Dropdown de Resultados da Busca */}
          {matchedLeads.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#0B132B] border border-blue-900/60 rounded-xl shadow-2xl p-2 z-50 space-y-1">
              {matchedLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => {
                    setSearchQuery('');
                    onNavigate('leads');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-950/60 text-left transition-colors cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{lead.nome}</div>
                    <div className="text-[10px] text-slate-400">{lead.empreendimento || 'Geral'}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-blue-950 text-cyan-300 border-blue-800">
                    {COMMERCIAL_STAGES.find((s) => s.id === lead.status)?.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Tools: Seletor de Período, Sinos e Relógio */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Seletor de Período */}
          <div className="relative">
            <button
              id="btn-filtro-periodo-dashboard"
              onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B132B] border border-blue-900/40 hover:border-blue-700/60 text-xs text-slate-200 cursor-pointer transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium">
                {periodFilter === 'hoje'
                  ? 'Hoje'
                  : periodFilter === 'semana'
                  ? 'Esta Semana'
                  : periodFilter === 'mes'
                  ? 'Este Mês'
                  : 'Todo o Período'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isPeriodDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#0B132B] border border-blue-900/60 rounded-xl shadow-2xl p-1 z-50">
                {(['hoje', 'semana', 'mes', 'todos'] as const).map((period) => (
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
                    {period === 'hoje'
                      ? 'Hoje (Diário)'
                      : period === 'semana'
                      ? 'Esta Semana'
                      : period === 'mes'
                      ? 'Este Mês'
                      : 'Todo o Período'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sino de Notificação */}
          <button
            onClick={() => onNavigate('leads')}
            className="p-2.5 rounded-xl bg-[#0B132B] border border-blue-900/40 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 right-2 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 right-2" />
          </button>

          {/* Data e Relógio */}
          <div className="flex items-center gap-3 pl-3 border-l border-blue-900/30">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-medium text-slate-300 capitalize">{weekday}</div>
              <div className="text-[10px] text-slate-500">{dateDetail}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#0B1533] border border-blue-800/40 text-white font-mono text-lg font-bold tracking-wider shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              {currentTimeStr}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WELCOME BANNER COM ARTE CINEMATOGRÁFICA (MONTANHAS & PESSOA NO TOPO)   */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl overflow-hidden border border-blue-900/50 bg-[#070E24] shadow-2xl min-h-[170px] md:min-h-[190px] flex items-center">
        {/* Arte Decorativa Superior: Montanhas ao fundo, céu escuro azulado e pessoa no topo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={heroMountainArt}
            alt="Conquista no topo da montanha"
            className="w-full h-full object-cover object-[70%_30%] md:object-[right_center] scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          {/* Máscara 1: Gradiente escuro da esquerda para garantir contraste e leitura impecável do texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070C1A] via-[#070C1A]/90 via-50% to-transparent" />
          
          {/* Máscara 2: Gradientes suaves nas bordas superior e inferior para integrar a imagem ao fundo do sistema */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070C1A] via-transparent to-[#070C1A]/60" />
          
          {/* Máscara 3: Iluminação azul cybernetic e discreto brilho no horizonte */}
          <div className="absolute inset-0 bg-blue-950/25 mix-blend-color" />
          <div className="absolute right-12 bottom-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Conteúdo da Saudação */}
        <div className="relative z-10 w-full p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono tracking-wider font-semibold uppercase bg-blue-950/80 text-cyan-300 border border-blue-600/40 backdrop-blur-md">
                RAXXER INTEL • PAINEL EXECUTIVO
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-md">
              {greeting}, <span className="text-[#38BDF8]">{userName}!</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-light max-w-lg leading-relaxed drop-shadow">
              Acompanhamento de leads, análises de crédito, aprovações, vendas e VGV consolidado.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('leads')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer backdrop-blur-sm"
            >
              <span>Acessar Leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TABS PRINCIPAIS: BI GERAL | BALANÇO DIÁRIO | SEMANAL | MENSAL          */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-blue-900/40 pb-2 overflow-x-auto">
        <button
          id="tab-bi-geral"
          onClick={() => setActiveTab('bi')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'bi'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-blue-950/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>BI Comercial Geral</span>
        </button>

        <button
          id="tab-balanco-diario"
          onClick={() => setActiveTab('diario')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'diario'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-blue-950/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Balanço Diário</span>
        </button>

        <button
          id="tab-balanco-semanal"
          onClick={() => setActiveTab('semanal')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'semanal'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-blue-950/60'
          }`}
        >
          <CalendarRange className="w-3.5 h-3.5" />
          <span>Balanço Semanal</span>
        </button>

        <button
          id="tab-balanco-mensal"
          onClick={() => setActiveTab('mensal')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'mensal'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-blue-950/60'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Balanço Mensal</span>
        </button>

        {/* Divisor estético sutil */}
        <div className="h-5 w-[1px] bg-blue-900/60 mx-1 shrink-0" />

        {/* Atalhos Rápidos para Funil de Vendas e Vendas */}
        <button
          id="tab-shortcut-funil-vendas"
          onClick={() => onNavigate('funil_vendas')}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-cyan-300 hover:text-white bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/40 hover:border-cyan-500/50 transition-all cursor-pointer whitespace-nowrap shadow-sm"
          title="Abrir Funil de Vendas Comercial"
        >
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Funil de Vendas</span>
          <ArrowRight className="w-3 h-3 text-cyan-400/80" />
        </button>

        <button
          id="tab-shortcut-vendas"
          onClick={() => onNavigate('vendas')}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-emerald-300 hover:text-white bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/40 hover:border-emerald-500/50 transition-all cursor-pointer whitespace-nowrap shadow-sm"
          title="Abrir Gestão e Extrato de Vendas"
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>Vendas Realizadas</span>
          <ArrowRight className="w-3 h-3 text-emerald-400/80" />
        </button>

        <button
          id="tab-shortcut-leads"
          onClick={() => onNavigate('leads')}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/50 transition-all cursor-pointer whitespace-nowrap"
          title="Abrir Base de Leads"
        >
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Leads ({metrics.totalLeads})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. CARDS INDICADORES OFICIAIS (TOTAL, ATENDIMENTOS, NÃO ATENDERAM, ...)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Card 1: Total Leads */}
        <div
          onClick={() => onNavigate('leads')}
          className="p-3.5 rounded-2xl bg-[#091329] border border-blue-900/40 hover:border-blue-500/60 flex flex-col justify-between space-y-2 shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
          title="Ver todos os leads"
        >
          <div className="w-8 h-8 rounded-lg bg-[#132A54] border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Total Leads</div>
            <div className="text-xl font-black text-white font-mono">{metrics.totalLeads}</div>
          </div>
        </div>

        {/* Card 2: Atendimentos */}
        <div className="p-3.5 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-300">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Atendimentos</div>
            <div className="text-xl font-black text-blue-300 font-mono">{metrics.atendimentos}</div>
          </div>
        </div>

        {/* Card 3: Não atenderam */}
        <div className="p-3.5 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <PhoneOff className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Não atenderam</div>
            <div className="text-xl font-black text-indigo-300 font-mono">{metrics.naoAtenderam}</div>
          </div>
        </div>

        {/* Card 4: Em análise */}
        <div className="p-3.5 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#362512] border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Em análise</div>
            <div className="text-xl font-black text-amber-300 font-mono">{metrics.emAnalise}</div>
          </div>
        </div>

        {/* Card 5: Aprovados */}
        <div className="p-3.5 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Aprovados</div>
            <div className="text-xl font-black text-emerald-300 font-mono">{metrics.aprovados}</div>
          </div>
        </div>

        {/* Card 6: Reprovados */}
        <div className="p-3.5 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Reprovados</div>
            <div className="text-xl font-black text-rose-300 font-mono">{metrics.reprovados}</div>
          </div>
        </div>

        {/* Card 7: Vendidos */}
        <div
          onClick={() => onNavigate('vendas')}
          className="p-3.5 rounded-2xl bg-[#091329] border border-blue-900/40 hover:border-cyan-500/60 flex flex-col justify-between space-y-2 shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
          title="Ver detalhes das Vendas"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Vendidos</div>
            <div className="text-xl font-black text-cyan-300 font-mono">{metrics.vendidos}</div>
          </div>
        </div>

        {/* Card 8: VGV (HIGHLIGHT CARD EM VERDE ESMERALDA COM BRILHO) */}
        <div
          onClick={() => onNavigate('vendas')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#062424] via-[#07302F] to-[#0A3D3C] border border-emerald-500/50 hover:border-emerald-400 flex flex-col justify-between space-y-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] cursor-pointer transition-all hover:scale-[1.02]"
          title="Ver extrato completo de Vendas e VGV"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-emerald-300 font-medium">VGV Total</div>
            <div className="text-lg font-black text-emerald-200 font-mono truncate">
              {formatMoedaCompacta(metrics.totalVGV)}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CONTEÚDO CONDICIONAL DE ACORDO COM A ABA ATIVA                         */}
      {/* ========================================================================= */}

      {/* ABA 1: BALANÇO DIÁRIO */}
      {activeTab === 'diario' && (
        <div className="p-6 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white">Balanço Comercial Diário</h3>
                <p className="text-xs text-slate-400">Resultados consolidados de hoje ({dateDetail})</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-cyan-300">
                Taxa de Conversão do Dia: {balanceData.diario.conversaoHoje.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-[#0B1530] border border-blue-900/30">
              <span className="text-xs text-slate-400 block">Cadastrados Hoje</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {balanceData.diario.cadastradosHoje}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-blue-900/30">
              <span className="text-xs text-slate-400 block">Em Atendimento</span>
              <span className="text-2xl font-black font-mono text-blue-300 mt-1 block">
                {balanceData.diario.atendimentos}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-blue-900/30">
              <span className="text-xs text-slate-400 block">Não Atenderam</span>
              <span className="text-2xl font-black font-mono text-indigo-300 mt-1 block">
                {balanceData.diario.naoAtenderam}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-blue-900/30">
              <span className="text-xs text-slate-400 block">Descartados</span>
              <span className="text-2xl font-black font-mono text-slate-400 mt-1 block">
                {balanceData.diario.descartados}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-amber-900/30">
              <span className="text-xs text-amber-300 block">Entraram em Análise</span>
              <span className="text-2xl font-black font-mono text-amber-300 mt-1 block">
                {balanceData.diario.analisesHoje}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-emerald-900/30">
              <span className="text-xs text-emerald-300 block">Aprovados Hoje</span>
              <span className="text-2xl font-black font-mono text-emerald-300 mt-1 block">
                {balanceData.diario.aprovadosHoje}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-rose-900/30">
              <span className="text-xs text-rose-300 block">Reprovados Hoje</span>
              <span className="text-2xl font-black font-mono text-rose-300 mt-1 block">
                {balanceData.diario.reprovadosHoje}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-cyan-900/30">
              <span className="text-xs text-cyan-300 block">Vendas Realizadas</span>
              <span className="text-2xl font-black font-mono text-cyan-300 mt-1 block">
                {balanceData.diario.vendasHoje}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#062424] to-[#0A3D3C] border border-emerald-500/40 col-span-2">
              <span className="text-xs text-emerald-300 block">VGV Vendido Hoje</span>
              <span className="text-2xl font-black font-mono text-emerald-200 mt-1 block">
                {formatMoedaCompacta(balanceData.diario.vgvHoje)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: BALANÇO SEMANAL */}
      {activeTab === 'semanal' && (
        <div className="p-6 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
            <div className="flex items-center gap-2.5">
              <CalendarRange className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Balanço Comercial Semanal</h3>
                <p className="text-xs text-slate-400">Consolidado dos últimos 7 dias</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-amber-300">
                Conv. Análise: {balanceData.semanal.convAnaliseSemana.toFixed(1)}%
              </span>
              <span className="text-cyan-300 font-bold">
                Conv. Venda: {balanceData.semanal.convVendaSemana.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-[#0B1530] border border-blue-900/30">
              <span className="text-xs text-slate-400 block">Cadastrados na Semana</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {balanceData.semanal.cadastradosSemana}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-blue-900/30">
              <span className="text-xs text-slate-400 block">Atendimentos</span>
              <span className="text-2xl font-black font-mono text-blue-300 mt-1 block">
                {balanceData.semanal.atendimentos}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-blue-900/30">
              <span className="text-xs text-slate-400 block">Não Atenderam</span>
              <span className="text-2xl font-black font-mono text-indigo-300 mt-1 block">
                {balanceData.semanal.naoAtenderam}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-blue-900/30">
              <span className="text-xs text-slate-400 block">Descartados</span>
              <span className="text-2xl font-black font-mono text-slate-400 mt-1 block">
                {balanceData.semanal.descartados}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-amber-900/30">
              <span className="text-xs text-amber-300 block">Análises na Semana</span>
              <span className="text-2xl font-black font-mono text-amber-300 mt-1 block">
                {balanceData.semanal.analisesSemana}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-emerald-900/30">
              <span className="text-xs text-emerald-300 block">Aprovados</span>
              <span className="text-2xl font-black font-mono text-emerald-300 mt-1 block">
                {balanceData.semanal.aprovadosSemana}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-rose-900/30">
              <span className="text-xs text-rose-300 block">Reprovados</span>
              <span className="text-2xl font-black font-mono text-rose-300 mt-1 block">
                {balanceData.semanal.reprovadosSemana}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-cyan-900/30">
              <span className="text-xs text-cyan-300 block">Vendidos</span>
              <span className="text-2xl font-black font-mono text-cyan-300 mt-1 block">
                {balanceData.semanal.vendasSemana}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#062424] to-[#0A3D3C] border border-emerald-500/40 col-span-2">
              <span className="text-xs text-emerald-300 block">VGV da Semana</span>
              <span className="text-2xl font-black font-mono text-emerald-200 mt-1 block">
                {formatMoedaCompacta(balanceData.semanal.vgvSemana)}
              </span>
            </div>
          </div>

          {/* Comparativo real com a semana anterior se houver dados */}
          {balanceData.semanal.hasDataSemanaAnt && (
            <div className="pt-3 border-t border-blue-900/40 flex items-center justify-between text-xs text-slate-400">
              <span>Comparativo com Semana Anterior:</span>
              <div className="flex items-center gap-4 font-mono">
                <span>Leads Ant: <strong className="text-white">{balanceData.semanal.cadastradosSemanaAnt}</strong></span>
                <span>Vendas Ant: <strong className="text-white">{balanceData.semanal.vendasSemanaAnt}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: BALANÇO MENSAL */}
      {activeTab === 'mensal' && (
        <div className="p-6 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Balanço Comercial Mensal</h3>
                <p className="text-xs text-slate-400">Consolidado do mês vigente</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-cyan-300 font-bold">
                Taxa de Conversão: {balanceData.mensal.convVendaMes.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-[#0B1530] border border-blue-900/30">
              <span className="text-xs text-slate-400 block">Cadastrados no Mês</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {balanceData.mensal.cadastradosMes}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-blue-900/30">
              <span className="text-xs text-slate-400 block">Atendimentos</span>
              <span className="text-2xl font-black font-mono text-blue-300 mt-1 block">
                {balanceData.mensal.atendimentos}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-blue-900/30">
              <span className="text-xs text-slate-400 block">Não Atenderam</span>
              <span className="text-2xl font-black font-mono text-indigo-300 mt-1 block">
                {balanceData.mensal.naoAtenderam}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-blue-900/30">
              <span className="text-xs text-slate-400 block">Descartados</span>
              <span className="text-2xl font-black font-mono text-slate-400 mt-1 block">
                {balanceData.mensal.descartados}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-amber-900/30">
              <span className="text-xs text-amber-300 block">Análises no Mês</span>
              <span className="text-2xl font-black font-mono text-amber-300 mt-1 block">
                {balanceData.mensal.analisesMes}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-emerald-900/30">
              <span className="text-xs text-emerald-300 block">Aprovados no Mês</span>
              <span className="text-2xl font-black font-mono text-emerald-300 mt-1 block">
                {balanceData.mensal.aprovadosMes}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-rose-900/30">
              <span className="text-xs text-rose-300 block">Reprovados no Mês</span>
              <span className="text-2xl font-black font-mono text-rose-300 mt-1 block">
                {balanceData.mensal.reprovadosMes}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1530] border border-cyan-900/30">
              <span className="text-xs text-cyan-300 block">Vendidos no Mês</span>
              <span className="text-2xl font-black font-mono text-cyan-300 mt-1 block">
                {balanceData.mensal.vendasMes}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#062424] to-[#0A3D3C] border border-emerald-500/40 col-span-2">
              <span className="text-xs text-emerald-300 block">VGV Mensal</span>
              <span className="text-2xl font-black font-mono text-emerald-200 mt-1 block">
                {formatMoedaCompacta(balanceData.mensal.vgvMes)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-blue-900/40 flex items-center justify-between text-xs text-slate-400">
            <span>Progresso da Meta Mensal:</span>
            <span className="font-mono font-bold text-cyan-300">
              {metrics.percentualMeta}% realizado ({metrics.realizadoVendas} de {metrics.metaVendasAlvo} vendas)
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SEÇÃO DO MEIO: FUNIL DE VENDAS + EVOLUÇÃO DE VENDAS + RAXXER AI        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* COLUNA 1: FUNIL DE VENDAS (4 COLUNAS) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <div
              onClick={() => onNavigate('funil_vendas')}
              className="flex items-center gap-2 cursor-pointer group"
              title="Abrir Funil de Vendas completo"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                Funil Comercial
              </h3>
            </div>
            <button
              onClick={() => onNavigate('funil_vendas')}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ver Completo</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Cone 3D escalonado alinhado com as barras horizontais */}
          <div className="space-y-3 py-1">
            {funnelStages.map((stage) => (
              <div
                key={stage.id}
                onClick={() => onNavigate('funil_vendas')}
                className="flex items-center gap-3 cursor-pointer group hover:bg-blue-950/30 p-1 rounded-lg transition-colors"
                title={`Ver detalhes de ${stage.name} no Funil`}
              >
                {/* Visual funil escalonado com o número dentro */}
                <div className="w-16 shrink-0 flex items-center justify-center">
                  <div
                    style={{ width: `${stage.widthPercent}%` }}
                    className={`h-6 rounded-md bg-gradient-to-r ${stage.colorClass} text-white font-mono text-[11px] font-bold flex items-center justify-center shadow-md transition-all group-hover:scale-105`}
                  >
                    {stage.count}
                  </div>
                </div>

                {/* Nome da etapa */}
                <div className="w-24 text-[11px] font-medium text-slate-300 group-hover:text-white transition-colors truncate">
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
                  <span className="w-9 text-right text-[11px] font-mono font-bold text-slate-300 group-hover:text-cyan-300 transition-colors">
                    {stage.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-blue-900/30 flex items-center justify-between text-[11px] text-slate-400">
            <span>Conversão Total do Funil:</span>
            <span className="font-mono font-bold text-cyan-300">{metrics.taxaConversao.toFixed(1)}%</span>
          </div>
        </div>

        {/* COLUNA 2: EVOLUÇÃO DE VENDAS COM GRÁFICO NEON (5 COLUNAS) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <div
              onClick={() => onNavigate('vendas')}
              className="flex items-center gap-2 cursor-pointer group"
              title="Abrir extrato de Vendas"
            >
              <TrendingUp className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                Evolução de Vendas
              </h3>
            </div>
            <button
              onClick={() => onNavigate('vendas')}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ver Vendas</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Gráfico de Linha Neon */}
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
                  allowDecimals={false}
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
                  formatter={(val: any) => [`${val} vendas`, 'Resultado']}
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
              <div className="text-lg font-black text-white font-mono">{metrics.vendidos}</div>
              <div className="text-[10px] text-slate-400">Total Vendas</div>
            </div>
            <div className="space-y-0.5 border-x border-blue-900/30">
              <div className="text-lg font-black text-white font-mono truncate px-1">
                {formatMoedaCompacta(metrics.ticketMedio)}
              </div>
              <div className="text-[10px] text-slate-400">Ticket Médio</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg font-black text-cyan-300 font-mono">
                {metrics.taxaConversao.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400">Conversão Geral</div>
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
              Diagnóstico Comercial, {userName}!
            </div>

            <div className="space-y-2 pt-1 text-[11px]">
              {/* Alerta 1 */}
              <div className="flex items-start gap-2 text-slate-300">
                <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="w-3 h-3" />
                </div>
                <span>
                  <strong className="text-white">{metrics.emAnalise}</strong> leads em análise de crédito
                </span>
              </div>

              {/* Alerta 2 */}
              <div className="flex items-start gap-2 text-slate-300">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <span>
                  <strong className="text-white">{metrics.aprovados}</strong> leads com crédito aprovado para fechar
                </span>
              </div>

              {/* Alerta 3 */}
              <div className="flex items-start gap-2 text-slate-300">
                <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-3 h-3" />
                </div>
                <span>
                  <strong className="text-white">{metrics.atendimentos}</strong> leads em atendimento ativo
                </span>
              </div>

              {/* Alerta 4 */}
              <div className="flex items-start gap-2 text-slate-300">
                <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <DollarSign className="w-3 h-3" />
                </div>
                <span>
                  VGV acumulado de <strong className="text-emerald-300">{formatMoedaCompacta(metrics.totalVGV)}</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenAIChat?.('Faça uma análise dos meus resultados comerciais: leads em análise, aprovações, vendas e VGV')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all cursor-pointer"
          >
            <span>Análise Detalhada AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. ROW 3: ORIGEM DOS LEADS + SITUAÇÕES DOS LEADS + METAS DO MÊS           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* DONUT 1: ORIGEM DOS LEADS */}
        <div className="p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <h3 className="text-sm font-bold text-white tracking-tight">Origem dos Leads</h3>
          </div>

          <div className="flex items-center justify-between gap-3">
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

        {/* DONUT 2: SITUAÇÃO DOS LEADS (AS 7 SITUAÇÕES OFICIAIS) */}
        <div className="p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <h3 className="text-sm font-bold text-white tracking-tight">Situação dos Leads</h3>
          </div>

          <div className="flex items-center justify-between gap-3">
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
                      <Cell key={`stg-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-black text-white font-mono leading-none">
                  {metrics.totalLeads}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">Status</span>
              </div>
            </div>

            <div className="flex-1 space-y-1 text-[10px] max-h-28 overflow-y-auto">
              {leadStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-1.5 truncate pr-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 shrink-0">{item.value} ({item.percent}%)</span>
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
              <h3 className="text-sm font-bold text-white tracking-tight">Metas de Vendas</h3>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-1">
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
                <span className="text-[8px] text-slate-500">vendas</span>
              </div>
            </div>

            <div className="flex-1 space-y-2.5 text-right">
              <p className="text-xs text-slate-300 italic font-serif leading-relaxed">
                &ldquo;Foco, constância e disciplina geram resultados extraordinários.&rdquo;
              </p>
              <button
                onClick={() => onNavigate('metas_projetos')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-800/60 bg-blue-950/40 hover:bg-blue-900/60 text-cyan-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                <span>Ver metas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. ROW 4: PRÓXIMOS CONTATOS + HISTÓRICO DE RESULTADOS + CARD MOTIVACIONAL */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* COLUNA 1: PRÓXIMOS CONTATOS PROGRAMADOS (4 COLUNAS) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <h3 className="text-sm font-bold text-white tracking-tight">Próximos Contatos</h3>
            <button
              onClick={() => onNavigate('leads')}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingContacts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Nenhum próximo contato agendado nos leads.
              </div>
            ) : (
              upcomingContacts.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onNavigate('leads')}
                  className="p-2.5 rounded-xl bg-[#0B1530] border border-blue-900/30 flex items-center justify-between gap-2 hover:border-blue-500/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">{lead.nome}</div>
                      <div className="text-[10px] text-slate-400 truncate">{lead.empreendimento || 'Geral'}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-cyan-300 font-mono shrink-0">
                    {new Date(lead.proximoContato!).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUNA 2: HISTÓRICO RECENTE DE RESULTADOS COMERCIAIS (4 COLUNAS) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#091329] border border-blue-900/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
            <h3 className="text-sm font-bold text-white tracking-tight">Histórico de Resultados</h3>
            <button
              onClick={() => onNavigate('leads')}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Ver leads
            </button>
          </div>

          <div className="space-y-2.5">
            {recentHistoryEvents.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Nenhum evento registrado recentemente.
              </div>
            ) : (
              recentHistoryEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-xl bg-[#0B1530] border border-blue-900/30 flex items-center justify-between gap-2 hover:border-blue-500/40 transition-colors"
                >
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white capitalize truncate">
                      {ev.type === 'vendido'
                        ? 'Venda Realizada'
                        : ev.type === 'aprovado'
                        ? 'Crédito Aprovado'
                        : ev.type === 'entrou_analise'
                        ? 'Entrou em Análise'
                        : ev.type === 'reprovado'
                        ? 'Crédito Reprovado'
                        : ev.type === 'lead_cadastrado'
                        ? 'Novo Lead Cadastrado'
                        : 'Status Atualizado'}
                    </div>
                    {ev.observacao && (
                      <div className="text-[10px] text-slate-400 truncate">{ev.observacao}</div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(ev.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUNA 3: CARD INSTITUCIONAL / BRANDING COM ROBÔ TECNOLÓGICO (4 COLUNAS) */}
        <div className="lg:col-span-4 rounded-2xl border border-blue-500/40 shadow-[0_0_30px_rgba(37,99,235,0.25)] relative overflow-hidden bg-[#060E24] flex flex-col justify-between min-h-[260px]">
          {/* Arte do Robô Tecnológico posicionada com fade suave */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src={robotTechArt}
              alt="Robô Tecnológico RAXXER"
              className="w-full h-full object-cover object-[75%_center] md:object-right opacity-55 mix-blend-screen scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Gradiente escuro para garantir legibilidade perfeita do texto institucional */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#060E24] via-[#060E24]/85 via-50% to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060E24] via-transparent to-[#060E24]/30" />
            {/* Brilho e atmosfera neon */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-2xl" />
          </div>

          <div className="p-6 relative z-10 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-cyan-300 font-semibold uppercase">
                RAXXER CORE
              </span>
            </div>

            {/* Texto Institucional Solicitado: PLANEJE, EXECUTE, EVOLUA, CONQUISTE */}
            <div className="space-y-1 font-mono font-black text-lg md:text-xl tracking-wider leading-none">
              <div className="text-[#38BDF8]">PLANEJE</div>
              <div className="text-[#60A5FA]">EXECUTE</div>
              <div className="text-[#818CF8]">EVOLUA</div>
              <div className="text-white">CONQUISTE</div>
            </div>

            <div className="w-14 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full" />

            {/* Subtítulo institucional */}
            <p className="text-xs text-blue-100/90 font-light leading-relaxed max-w-[220px]">
              Um futuro melhor começa com as ações de hoje.
            </p>
          </div>

          <div className="p-6 pt-0 flex items-center justify-between relative z-10">
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">RAXXER BI COMERCIAL</span>
            <button
              onClick={() => onNavigate('leads')}
              className="inline-flex items-center gap-1 text-[11px] text-cyan-300 font-semibold cursor-pointer hover:text-cyan-200 hover:underline transition-colors"
            >
              <span>Gerenciar Leads</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
