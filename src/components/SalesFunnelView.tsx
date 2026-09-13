import React, { useMemo, useState } from 'react';
import {
  Filter,
  Users,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  FileCheck,
  XCircle,
  PhoneOff,
  UserX,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ArrowRight,
  PieChart as PieIcon,
  BarChart2,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useCommercialData } from '../hooks/useCommercialData';
import { useCurrentDateTime } from '../hooks/useCurrentDateTime';
import { COMMERCIAL_STAGES, CommercialLeadStatus } from '../types/commercial';
import { Panel, SectionHeader, MetricCard, Button } from './common/DesignSystem';

interface SalesFunnelViewProps {
  onNavigate: (tab: string) => void;
  onOpenAIChat?: (prompt?: string) => void;
}

export const SalesFunnelView: React.FC<SalesFunnelViewProps> = ({
  onNavigate,
  onOpenAIChat,
}) => {
  const { leads } = useCommercialData();
  const [periodFilter, setPeriodFilter] = useState<'todos' | 'mes' | 'semana' | 'hoje'>('todos');
  const { weekday, dateDetail, timeStr: currentTimeStr } = useCurrentDateTime();

  // Formatação de moeda BRL
  const formatMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Filtragem de leads por período
  const filteredLeads = useMemo(() => {
    if (periodFilter === 'todos') return leads;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const getLeadRelevantDate = (lead: any): Date | null => {
      // Prioriza a data de movimentação comercial mais recente ou de cadastro
      const dateStr =
        lead.dataVenda ||
        lead.dataAprovacao ||
        lead.dataReprovacao ||
        lead.dataAnalise ||
        lead.dataCadastro ||
        lead.dataCriacao;
      return dateStr ? new Date(dateStr) : null;
    };

    return leads.filter((lead) => {
      const lDate = getLeadRelevantDate(lead);
      if (!lDate || isNaN(lDate.getTime())) return false;

      if (periodFilter === 'hoje') {
        return lDate.toISOString().split('T')[0] === todayStr;
      }

      if (periodFilter === 'semana') {
        const diffMs = now.getTime() - lDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }

      if (periodFilter === 'mes') {
        return (
          lDate.getMonth() === now.getMonth() &&
          lDate.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  }, [leads, periodFilter]);

  // Contadores oficiais do Funil Comercial (estritamente os 7 status oficiais)
  const funnelMetrics = useMemo(() => {
    const totalLeads = filteredLeads.length;

    const atendimentos = filteredLeads.filter((l) => l.status === 'atendimentos').length;
    const descartados = filteredLeads.filter((l) => l.status === 'descartados').length;
    const naoAtenderam = filteredLeads.filter((l) => l.status === 'nao_atenderam').length;
    const emAnalise = filteredLeads.filter((l) => l.status === 'em_analise').length;
    const aprovados = filteredLeads.filter((l) => l.status === 'aprovados').length;
    const reprovados = filteredLeads.filter((l) => l.status === 'reprovados').length;
    const vendidos = filteredLeads.filter((l) => l.status === 'vendidos').length;

    // VGV total dos vendidos
    const vgvTotal = filteredLeads
      .filter((l) => l.status === 'vendidos')
      .reduce((acc, curr) => acc + (curr.vgv || curr.valorAprovado || 0), 0);

    // Total de valor aprovado (aprovados + vendidos)
    const valorAprovadoTotal = filteredLeads
      .filter((l) => l.status === 'aprovados' || l.status === 'vendidos')
      .reduce((acc, curr) => acc + (curr.valorAprovado || curr.vgv || 0), 0);

    // Taxa de conversão para venda
    const taxaConversaoVenda = totalLeads > 0 ? (vendidos / totalLeads) * 100 : 0;

    // Taxa de aprovação de crédito: aprovados / (aprovados + reprovados)
    const totalAvaliados = aprovados + reprovados;
    const taxaAprovacaoCredito = totalAvaliados > 0 ? (aprovados / totalAvaliados) * 100 : 0;

    // Taxa de encaminhamento para análise: (em_analise + aprovados + reprovados + vendidos) / totalLeads
    const totalPassaramAnalise = emAnalise + aprovados + reprovados + vendidos;
    const taxaEncaminhamentoAnalise = totalLeads > 0 ? (totalPassaramAnalise / totalLeads) * 100 : 0;

    return {
      totalLeads,
      atendimentos,
      descartados,
      naoAtenderam,
      emAnalise,
      aprovados,
      reprovados,
      vendidos,
      vgvTotal,
      valorAprovadoTotal,
      taxaConversaoVenda,
      taxaAprovacaoCredito,
      taxaEncaminhamentoAnalise,
    };
  }, [filteredLeads]);

  // Lista dos 7 status com quantidades e percentuais detalhados
  const statusDetails = useMemo(() => {
    const total = funnelMetrics.totalLeads;
    return COMMERCIAL_STAGES.map((stg) => {
      let count = 0;
      let vgv = 0;

      switch (stg.id) {
        case 'atendimentos':
          count = funnelMetrics.atendimentos;
          break;
        case 'descartados':
          count = funnelMetrics.descartados;
          break;
        case 'nao_atenderam':
          count = funnelMetrics.naoAtenderam;
          break;
        case 'em_analise':
          count = funnelMetrics.emAnalise;
          break;
        case 'aprovados':
          count = funnelMetrics.aprovados;
          vgv = filteredLeads
            .filter((l) => l.status === 'aprovados')
            .reduce((acc, curr) => acc + (curr.valorAprovado || 0), 0);
          break;
        case 'reprovados':
          count = funnelMetrics.reprovados;
          break;
        case 'vendidos':
          count = funnelMetrics.vendidos;
          vgv = funnelMetrics.vgvTotal;
          break;
      }

      const percentual = total > 0 ? Math.round((count / total) * 100) : 0;

      return {
        ...stg,
        count,
        percentual,
        vgv,
      };
    });
  }, [funnelMetrics, filteredLeads]);

  return (
    <div className="space-y-6">
      {/* 1. TOPO DA PÁGINA COM CABEÇALHO FUTURISTA E CONTROLES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-700/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Funil de Vendas Comercial
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Painel analítico das 7 situações oficiais do RAXXER e taxas de conversão.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtro de Período */}
          <div className="inline-flex p-1 rounded-xl bg-[#091329] border border-blue-900/40 text-xs">
            {(
              [
                { id: 'todos', label: 'Todo o Período' },
                { id: 'mes', label: 'Este Mês' },
                { id: 'semana', label: 'Esta Semana' },
                { id: 'hoje', label: 'Hoje' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodFilter(p.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  periodFilter === p.id
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Relógio & Data */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#091329] border border-blue-900/40">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 capitalize">{weekday}</div>
              <div className="text-xs font-mono font-bold text-white">{currentTimeStr}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CARDS DE MÉTRICAS EM DESTAQUE (DESIGN SYSTEM RAXXER) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total Geral */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total de Leads</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/40 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-white">{funnelMetrics.totalLeads}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Leads registrados</div>
          </div>
        </div>

        {/* Atendimentos */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-300">Atendimentos</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-blue-400">{funnelMetrics.atendimentos}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {funnelMetrics.totalLeads > 0
                ? `${Math.round((funnelMetrics.atendimentos / funnelMetrics.totalLeads) * 100)}% do total`
                : '0%'}
            </div>
          </div>
        </div>

        {/* Em análise */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-300">Em análise</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-amber-400">{funnelMetrics.emAnalise}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {funnelMetrics.totalLeads > 0
                ? `${Math.round((funnelMetrics.emAnalise / funnelMetrics.totalLeads) * 100)}% do total`
                : '0%'}
            </div>
          </div>
        </div>

        {/* Aprovados */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-300">Aprovados</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-emerald-400">{funnelMetrics.aprovados}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {funnelMetrics.totalLeads > 0
                ? `${Math.round((funnelMetrics.aprovados / funnelMetrics.totalLeads) * 100)}% do total`
                : '0%'}
            </div>
          </div>
        </div>

        {/* Reprovados */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-blue-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-300">Reprovados</span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-rose-400">{funnelMetrics.reprovados}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {funnelMetrics.totalLeads > 0
                ? `${Math.round((funnelMetrics.reprovados / funnelMetrics.totalLeads) * 100)}% do total`
                : '0%'}
            </div>
          </div>
        </div>

        {/* Vendidos */}
        <div className="p-4 rounded-2xl bg-[#091329] border border-cyan-500/40 flex flex-col justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-cyan-300">Vendidos</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-cyan-400">{funnelMetrics.vendidos}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Vendas concretizadas</div>
          </div>
        </div>

        {/* VGV Total (Destaque Neon Esmeralda) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#062424] via-[#07302F] to-[#0A3D3C] border border-emerald-500/50 flex flex-col justify-between shadow-[0_0_25px_rgba(16,185,129,0.18)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">VGV Total</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black font-mono text-emerald-200 truncate">
              {formatMoeda(funnelMetrics.vgvTotal)}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">
              Conv. {funnelMetrics.taxaConversaoVenda.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* 3. FLUXO VISUAL DO FUNIL COMERCIAL ESCALONADO */}
      <Panel variant="default" className="p-6 space-y-6">
        <SectionHeader
          title="Fluxo Escalonado do Funil Comercial"
          subtitle="Acompanhamento linear de cada etapa oficial desde a entrada até a conversão final em Vendas."
          icon={TrendingUp}
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                Taxa Geral de Conversão:
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono">
                {funnelMetrics.taxaConversaoVenda.toFixed(1)}%
              </span>
            </div>
          }
        />

        {funnelMetrics.totalLeads === 0 ? (
          /* Estado vazio elegante quando não houver dados */
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-slate-400">
              <Filter className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">Nenhum dado encontrado no funil</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Não há registros de leads para o período selecionado ({periodFilter}). Cadastre novos leads ou altere o filtro para visualizar os números.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate('leads')}
                icon={Users}
              >
                Gerenciar Leads
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress Bars dos 7 Status Oficiais */}
            <div className="space-y-3">
              {statusDetails.map((stage, idx) => {
                const widthPercent =
                  funnelMetrics.totalLeads > 0
                    ? Math.max(8, Math.round((stage.count / funnelMetrics.totalLeads) * 100))
                    : 8;

                return (
                  <div
                    key={stage.id}
                    className="p-3.5 rounded-xl bg-[#0B1530] border border-blue-900/30 hover:border-blue-700/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                          style={{ backgroundColor: stage.cor, color: stage.cor }}
                        />
                        <span className="text-xs font-bold text-white">{stage.label}</span>
                        <span className="text-[11px] text-slate-400 hidden md:inline">
                          — {stage.descricao}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {stage.vgv > 0 && (
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {formatMoeda(stage.vgv)}
                          </span>
                        )}
                        <span className="text-xs font-bold font-mono text-white">
                          {stage.count} {stage.count === 1 ? 'lead' : 'leads'}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono"
                          style={{
                            backgroundColor: `${stage.cor}18`,
                            color: stage.cor,
                            border: `1px solid ${stage.cor}33`,
                          }}
                        >
                          {stage.percentual}%
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso com cor oficial */}
                    <div className="w-full bg-[#060B18] h-2.5 rounded-full overflow-hidden p-0.5 border border-blue-950">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: stage.cor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumo de Eficiência Comercial */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-[#060B18] border border-blue-900/30">
                <div className="text-[11px] text-slate-400">Encaminhamento p/ Análise</div>
                <div className="text-xl font-black font-mono text-amber-400 mt-1">
                  {funnelMetrics.taxaEncaminhamentoAnalise.toFixed(1)}%
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Leads que avançaram para análise de crédito
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#060B18] border border-blue-900/30">
                <div className="text-[11px] text-slate-400">Taxa de Aprovação de Crédito</div>
                <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                  {funnelMetrics.taxaAprovacaoCredito.toFixed(1)}%
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Aprovados sobre o total de fichas analisadas
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#060B18] border border-blue-900/30">
                <div className="text-[11px] text-slate-400">Conversão Final em Vendas</div>
                <div className="text-xl font-black font-mono text-cyan-400 mt-1">
                  {funnelMetrics.taxaConversaoVenda.toFixed(1)}%
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Proporção de leads que geraram VGV
                </p>
              </div>
            </div>
          </div>
        )}
      </Panel>

      {/* 4. TABELA ANALÍTICA DOS 7 STATUS OFICIAIS */}
      <Panel variant="default" className="p-6 space-y-4">
        <SectionHeader
          title="Detalhamento das Situações Oficiais"
          subtitle="Tabela quantitativa com percentuais e valores monetários associados a cada status."
          icon={BarChart2}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('leads')}
              icon={ChevronRight}
              iconPosition="right"
            >
              Ver no Módulo Leads
            </Button>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-blue-900/40 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Situação Oficial</th>
                <th className="py-3 px-4">Significado</th>
                <th className="py-3 px-4 text-center">Quantidade</th>
                <th className="py-3 px-4 text-center">% do Funil</th>
                <th className="py-3 px-4 text-right">Volume Financeiro</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/60 text-xs">
              {statusDetails.map((stg) => (
                <tr key={stg.id} className="hover:bg-blue-950/20 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 font-bold">{stg.ordem}</td>
                  <td className="py-3 px-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono border"
                      style={{
                        backgroundColor: `${stg.cor}18`,
                        color: stg.cor,
                        borderColor: `${stg.cor}44`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: stg.cor }}
                      />
                      {stg.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs max-w-xs">{stg.descricao}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-white text-sm">
                    {stg.count}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">
                    {stg.percentual}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {stg.vgv > 0 ? formatMoeda(stg.vgv) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigate('leads')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Filtrar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
