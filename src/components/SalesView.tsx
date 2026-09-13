import React, { useMemo, useState } from 'react';
import {
  DollarSign,
  Search,
  Filter,
  Calendar,
  Building2,
  MapPin,
  Users,
  CheckCircle2,
  TrendingUp,
  FileText,
  Phone,
  MessageSquare,
  ArrowUpDown,
  Download,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Receipt,
  UserCheck,
} from 'lucide-react';
import { useCommercialData } from '../hooks/useCommercialData';
import { useCurrentDateTime } from '../hooks/useCurrentDateTime';
import { CommercialLeadItem, CommercialSaleItem } from '../types/commercial';
import { Panel, SectionHeader, MetricCard, Button, StatusBadge } from './common/DesignSystem';

interface SalesViewProps {
  onNavigate: (tab: string) => void;
  onOpenAIChat?: (prompt?: string) => void;
}

interface UnifiedSaleItem {
  id: string;
  leadId?: string;
  nome: string;
  telefone?: string;
  whatsapp?: string;
  empreendimento: string;
  dataVenda: string;
  valorAprovado: number;
  vgv: number;
  origem: string;
  cidade?: string;
}

export const SalesView: React.FC<SalesViewProps> = ({
  onNavigate,
  onOpenAIChat,
}) => {
  const { leads, sales } = useCommercialData();
  const { weekday, dateDetail, timeStr: currentTimeStr } = useCurrentDateTime();

  // Estados de Filtros e Busca
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'todos' | 'mes' | 'semana' | 'hoje'>('todos');
  const [empreendimentoFilter, setEmpreendimentoFilter] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'data' | 'vgv' | 'nome'>('data');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Formatação de Moeda
  const formatMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Formatação de Data
  const formatData = (dStr?: string) => {
    if (!dStr) return '—';
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dStr;
    }
  };

  // Consolidação de Vendas Registradas (Usa dados reais dos leads sem duplicar registros)
  const unifiedSales = useMemo<UnifiedSaleItem[]>(() => {
    const list: UnifiedSaleItem[] = [];
    const seenLeadIds = new Set<string>();

    // 1. Vendas originadas diretamente de leads com status 'vendidos'
    leads
      .filter((lead) => lead.status === 'vendidos')
      .forEach((lead) => {
        seenLeadIds.add(lead.id);
        const vgvNum = lead.vgv || lead.valorAprovado || 0;
        const valorAprovadoNum = lead.valorAprovado || vgvNum || 0;
        const dataVendaStr = lead.dataVenda || lead.dataAtualizacao || lead.dataCriacao;

        list.push({
          id: `sale-lead-${lead.id}`,
          leadId: lead.id,
          nome: lead.nome,
          telefone: lead.telefone,
          whatsapp: lead.whatsapp,
          empreendimento: lead.empreendimento || 'Empreendimento não informado',
          dataVenda: dataVendaStr,
          valorAprovado: valorAprovadoNum,
          vgv: vgvNum,
          origem: lead.canalOrigem || 'outro',
          cidade: lead.cidade || 'Não informada',
        });
      });

    // 2. Vendas avulsas registradas no armazenamento que não duplicam os leads já processados
    if (sales && sales.length > 0) {
      sales.forEach((sale) => {
        if (sale.leadId && seenLeadIds.has(sale.leadId)) {
          return; // evita duplicatas
        }
        // Se houver coincidência de nome, também evitar duplicação
        const alreadyExists = list.some(
          (item) => item.nome.toLowerCase() === sale.clienteNome.toLowerCase()
        );
        if (alreadyExists) return;

        list.push({
          id: sale.id,
          leadId: sale.leadId,
          nome: sale.clienteNome,
          empreendimento: sale.empreendimento || 'Empreendimento não informado',
          dataVenda: sale.dataVenda || sale.dataCriacao,
          valorAprovado: sale.valorAprovado || sale.valorVenda || 0,
          vgv: sale.valorVenda || sale.valorAprovado || 0,
          origem: 'Venda Direta',
          cidade: 'Não informada',
        });
      });
    }

    return list;
  }, [leads, sales]);

  // Lista dinâmica de empreendimentos presentes nas vendas
  const uniqueEmpreendimentos = useMemo(() => {
    const set = new Set<string>();
    unifiedSales.forEach((s) => {
      if (s.empreendimento && s.empreendimento !== 'Empreendimento não informado') {
        set.add(s.empreendimento);
      }
    });
    return Array.from(set).sort();
  }, [unifiedSales]);

  // Aplicação de Filtros (Período, Empreendimento e Busca)
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return unifiedSales
      .filter((sale) => {
        // Busca textual
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNome = sale.nome.toLowerCase().includes(q);
          const matchEmp = sale.empreendimento.toLowerCase().includes(q);
          const matchCidade = sale.cidade?.toLowerCase().includes(q) || false;
          const matchTel = sale.telefone?.includes(q) || sale.whatsapp?.includes(q) || false;
          if (!matchNome && !matchEmp && !matchCidade && !matchTel) {
            return false;
          }
        }

        // Filtro por empreendimento
        if (empreendimentoFilter !== 'todos') {
          if (sale.empreendimento !== empreendimentoFilter) {
            return false;
          }
        }

        // Filtro por período
        if (periodFilter !== 'todos') {
          const sDate = new Date(sale.dataVenda);
          if (isNaN(sDate.getTime())) return true;

          if (periodFilter === 'hoje') {
            return sDate.toISOString().split('T')[0] === todayStr;
          }

          if (periodFilter === 'semana') {
            const diffMs = now.getTime() - sDate.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            return diffDays >= 0 && diffDays <= 7;
          }

          if (periodFilter === 'mes') {
            return (
              sDate.getMonth() === now.getMonth() &&
              sDate.getFullYear() === now.getFullYear()
            );
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'data') {
          const timeA = new Date(a.dataVenda).getTime() || 0;
          const timeB = new Date(b.dataVenda).getTime() || 0;
          return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        }
        if (sortBy === 'vgv') {
          return sortOrder === 'desc' ? b.vgv - a.vgv : a.vgv - b.vgv;
        }
        if (sortBy === 'nome') {
          return sortOrder === 'desc'
            ? b.nome.localeCompare(a.nome)
            : a.nome.localeCompare(b.nome);
        }
        return 0;
      });
  }, [unifiedSales, searchQuery, empreendimentoFilter, periodFilter, sortBy, sortOrder]);

  // Indicadores de Vendas
  const salesMetrics = useMemo(() => {
    const totalVendas = filteredSales.length;
    const totalVGV = filteredSales.reduce((acc, curr) => acc + (curr.vgv || 0), 0);
    const totalValorAprovado = filteredSales.reduce((acc, curr) => acc + (curr.valorAprovado || 0), 0);
    const mediaVGV = totalVendas > 0 ? totalVGV / totalVendas : 0;

    return {
      totalVendas,
      totalVGV,
      totalValorAprovado,
      mediaVGV,
    };
  }, [filteredSales]);

  // Alternar ordenação
  const handleToggleSort = (field: 'data' | 'vgv' | 'nome') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOPO DA PÁGINA COM CABEÇALHO FUTURISTA E CONTROLES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Consulta de Vendas & VGV
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Acompanhamento das vendas concretizadas, valores aprovados e VGV consolidado.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Atalho para Leads */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('leads')}
            icon={Users}
          >
            Acessar Leads
          </Button>

          {/* Relógio & Data */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#091329] border border-blue-900/40">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 capitalize">{weekday}</div>
              <div className="text-xs font-mono font-bold text-white">{currentTimeStr}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CARDS DE MÉTRICAS CONSOLIDADAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total de Vendas */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total de Vendas</span>
            <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800/40 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-white">
              {salesMetrics.totalVendas}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {salesMetrics.totalVendas === 1 ? 'Venda registrada' : 'Vendas registradas'}
            </div>
          </div>
        </div>

        {/* VGV Total (Destaque Neon Esmeralda) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#062424] via-[#07302F] to-[#0A3D3C] border border-emerald-500/50 flex flex-col justify-between shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">VGV Total Realizado</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-emerald-200 truncate">
              {formatMoeda(salesMetrics.totalVGV)}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">
              Valor Geral de Vendas
            </div>
          </div>
        </div>

        {/* Valor Aprovado Total */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Valor Aprovado Total</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-cyan-300 truncate">
              {formatMoeda(salesMetrics.totalValorAprovado)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Financiamento / Crédito</div>
          </div>
        </div>

        {/* Média de VGV por Venda (Ticket Médio) */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Média por Venda (Ticket)</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-indigo-300 truncate">
              {formatMoeda(salesMetrics.mediaVGV)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">VGV médio por unidade</div>
          </div>
        </div>
      </div>

      {/* 3. PAINEL DE FILTROS E BUSCA */}
      <Panel variant="default" className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Campo de Busca Rápida */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-busca-vendas"
              type="text"
              placeholder="Buscar cliente, telefone ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B132B] border border-blue-900/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Filtro por Empreendimento */}
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select
                id="select-filtro-empreendimento"
                value={empreendimentoFilter}
                onChange={(e) => setEmpreendimentoFilter(e.target.value)}
                className="bg-[#0B132B] border border-blue-900/40 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="todos">Todos os Empreendimentos</option>
                {uniqueEmpreendimentos.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Período */}
            <div className="inline-flex p-1 rounded-xl bg-[#0B132B] border border-blue-900/40 text-xs">
              {(
                [
                  { id: 'todos', label: 'Todos' },
                  { id: 'mes', label: 'Este Mês' },
                  { id: 'semana', label: 'Esta Semana' },
                  { id: 'hoje', label: 'Hoje' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriodFilter(p.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    periodFilter === p.id
                      ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* 4. TABELA DE VENDAS REGISTRADAS */}
      <Panel variant="default" className="p-6 space-y-4">
        <SectionHeader
          title="Listagem de Vendas Concretizadas"
          subtitle={`Mostrando ${filteredSales.length} de ${unifiedSales.length} vendas registradas.`}
          icon={Receipt}
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Total no Filtro:</span>
              <span className="text-xs font-bold font-mono text-emerald-400">
                {formatMoeda(salesMetrics.totalVGV)}
              </span>
            </div>
          }
        />

        {filteredSales.length === 0 ? (
          /* Estado Vazio Elegante */
          <div className="py-14 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-slate-400">
              <DollarSign className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Nenhuma venda encontrada</h3>
            <p className="text-xs text-slate-400 max-w-md">
              {unifiedSales.length === 0
                ? 'Nenhuma venda foi registrada até o momento. Acesse a gestão de Leads e defina a situação de um lead como "Vendidos" para computar a venda e o VGV correspondente.'
                : 'Nenhum registro atende aos filtros de busca, empreendimento ou período selecionados.'}
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate('leads')}
                icon={Users}
              >
                Ir para Módulo Leads
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-blue-900/40 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleToggleSort('nome')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Cliente / Lead</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Empreendimento</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleToggleSort('data')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Data da Venda</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Valor Aprovado</th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleToggleSort('vgv')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>VGV</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Origem</th>
                  <th className="py-3 px-4">Cidade</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-950/60 text-xs">
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-blue-950/20 transition-colors group"
                  >
                    {/* Cliente / Lead */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                          {sale.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors">
                            {sale.nome}
                          </div>
                          {(sale.whatsapp || sale.telefone) && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{sale.whatsapp || sale.telefone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Empreendimento */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-[160px] font-medium">
                          {sale.empreendimento}
                        </span>
                      </div>
                    </td>

                    {/* Data da Venda */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatData(sale.dataVenda)}</span>
                      </div>
                    </td>

                    {/* Valor Aprovado */}
                    <td className="py-3.5 px-4 text-right font-mono text-cyan-300">
                      {sale.valorAprovado > 0 ? formatMoeda(sale.valorAprovado) : '—'}
                    </td>

                    {/* VGV */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                      {formatMoeda(sale.vgv)}
                    </td>

                    {/* Origem */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/40 text-[10px] font-mono capitalize">
                        {sale.origem.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Cidade */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[120px]">{sale.cidade}</span>
                      </div>
                    </td>

                    {/* Ação */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onNavigate('leads')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        title="Ver lead completo no módulo Leads"
                      >
                        <span>Ver Lead</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};
