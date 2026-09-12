import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { DailyHistoryLog } from '../types';
import { Panel, SectionHeader, MetricCard, StatusBadge, Button } from './common/DesignSystem';

interface EvolutionViewProps {
  dailyHistory: DailyHistoryLog[];
  onOpenAIChat?: (prompt?: string) => void;
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  dailyHistory,
  onOpenAIChat,
}) => {
  // Sort history by date ascending for charts, and descending for recent list
  const historyAsc = [...dailyHistory].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );
  const historyDesc = [...dailyHistory].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  // Take last 7 days for the weekly view
  const last7Days = historyAsc.slice(-7);

  // Weekly Aggregates
  const totalCriadas = last7Days.reduce((acc, curr) => acc + curr.criadas, 0);
  const totalConcluidas = last7Days.reduce((acc, curr) => acc + curr.concluidas, 0);
  const totalPendentes = last7Days.reduce((acc, curr) => acc + curr.pendentes, 0);
  const totalAdiadas = last7Days.reduce((acc, curr) => acc + curr.adiadas, 0);

  const taxaExecucao =
    totalCriadas > 0 ? Math.round((totalConcluidas / totalCriadas) * 100) : 0;

  // Helper to format date string DD/MM
  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  // Helper for short day names
  const getShortDayName = (diaSemana: string, dateStr: string) => {
    if (diaSemana) {
      const lower = diaSemana.toLowerCase();
      if (lower.includes('segunda')) return 'Seg';
      if (lower.includes('terça') || lower.includes('terca')) return 'Ter';
      if (lower.includes('quarta')) return 'Qua';
      if (lower.includes('quinta')) return 'Qui';
      if (lower.includes('sexta')) return 'Sex';
      if (lower.includes('sábado') || lower.includes('sabado')) return 'Sáb';
      if (lower.includes('domingo')) return 'Dom';
    }
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[d.getDay()] || 'Dia';
  };

  // Prepare chart data
  const chartData = last7Days.map((item) => ({
    dia: getShortDayName(item.diaSemana, item.data),
    dataCurta: formatDateShort(item.data),
    percentual: item.percentualExecucao,
    criadas: item.criadas,
    concluidas: item.concluidas,
    pendentes: item.pendentes,
    adiadas: item.adiadas,
    diaSemana: item.diaSemana || item.data,
  }));

  // Custom Tooltip for Execution Rate Chart
  const CustomRateTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#080E21] border border-blue-900/60 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans">
          <p className="font-bold border-b border-blue-900/40 pb-1 text-cyan-300">
            {data.diaSemana} ({data.dataCurta})
          </p>
          <p className="text-emerald-400 font-semibold font-mono">
            Execução: {data.percentual}%
          </p>
          <p className="text-slate-300 font-light">
            Concluídas: <span className="font-mono text-white">{data.concluidas}</span> de <span className="font-mono text-white">{data.criadas}</span> tarefas
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Volume Chart
  const CustomVolumeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#080E21] border border-blue-900/60 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans">
          <p className="font-bold border-b border-blue-900/40 pb-1 text-cyan-300">
            {data.diaSemana} ({data.dataCurta})
          </p>
          <p className="text-slate-300">📋 Criadas: <span className="font-mono text-white">{data.criadas}</span></p>
          <p className="text-emerald-400">✅ Concluídas: <span className="font-mono text-white">{data.concluidas}</span></p>
          <p className="text-amber-400">⏳ Pendentes: <span className="font-mono text-white">{data.pendentes}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 pt-2 font-sans text-slate-100">
      {/* HEADER DA ÁREA DE EVOLUÇÃO */}
      <div className="relative rounded-2xl overflow-hidden border border-blue-900/40 bg-gradient-to-r from-[#091530] via-[#0D1C44] to-[#112356] p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cyan-400 bg-blue-950/70 border border-blue-500/30 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Performance & Métricas
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Evolução Semanal
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl font-light">
            Gráficos e telemetria de execução diária, consistência de rotina e volume de tarefas concluídas.
          </p>
        </div>

        {onOpenAIChat && (
          <Button
            onClick={() => onOpenAIChat('Como foi minha semana?')}
            variant="primary"
            size="md"
            icon={Sparkles}
          >
            Analisar com RAXXER
          </Button>
        )}
      </div>

      {/* RESUMO VISUAL DA SEMANA */}
      <Panel variant="default" className="p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Resumo da Semana
            </h2>
            <p className="text-xs text-slate-400 font-light">Métricas consolidadas dos últimos 7 dias</p>
          </div>
          <span className="text-xs font-bold text-cyan-300 bg-blue-950/80 border border-blue-500/40 px-3 py-1 rounded-lg font-mono">
            Taxa de execução: {taxaExecucao}%
          </span>
        </div>

        {/* Visual Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#081126] border border-blue-900/40 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total de tarefas
            </span>
            <span className="text-2xl font-bold font-mono text-white">{totalCriadas}</span>
            <span className="text-[10px] text-slate-500 block">registradas no período</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              Concluídas
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-300">{totalConcluidas}</span>
            <span className="text-[10px] text-emerald-500/80 block">executadas com sucesso</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Pendentes
            </span>
            <span className="text-2xl font-bold font-mono text-amber-300">{totalPendentes}</span>
            <span className="text-[10px] text-amber-500/80 block">aguardando conclusão</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-700/40 space-y-1">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
              Taxa de execução
            </span>
            <span className="text-2xl font-bold font-mono text-cyan-300">{taxaExecucao}%</span>
            <span className="text-[10px] text-cyan-500/80 block">eficiência média</span>
          </div>
        </div>

        {totalCriadas === 0 && (
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-slate-300 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-cyan-400 shrink-0" />
            <p>
              Ainda não existem tarefas registradas nos últimos dias. Crie e conclua tarefas com o RAXXER para preencher este gráfico em tempo real.
            </p>
          </div>
        )}

        {/* Global Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Ritmo semanal</span>
            <span className="text-cyan-400 font-mono">{totalConcluidas} de {totalCriadas} concluídas</span>
          </div>
          <div className="w-full bg-[#081126] border border-blue-900/40 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${taxaExecucao}%` }}
            />
          </div>
        </div>
      </Panel>

      {/* 1. GRÁFICO SEMANAL DE EXECUÇÃO (% por dia) */}
      <Panel variant="default" className="p-6 space-y-4">
        <div className="border-b border-blue-900/40 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              1. Taxa de Execução Diária (%)
            </h2>
            <p className="text-xs text-slate-400 font-light">
              Percentual de tarefas concluídas por dia da semana
            </p>
          </div>
          <span className="text-xs text-cyan-300 font-semibold bg-blue-950/80 border border-blue-500/30 px-2.5 py-1 rounded-md">
            Gráfico de Execução
          </span>
        </div>

        <div className="w-full pt-2" style={{ minHeight: '240px' }}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#172554" />
              <XAxis dataKey="dia" tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
              <Tooltip content={<CustomRateTooltip />} />
              <Bar dataKey="percentual" radius={[6, 6, 0, 0]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.percentual >= 80
                        ? '#38bdf8'
                        : entry.percentual >= 50
                        ? '#2563eb'
                        : '#f59e0b'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 pt-1 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>&ge; 80% (Alto)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>50% - 79% (Médio)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>&lt; 50% (Em andamento)</span>
          </div>
        </div>
      </Panel>

      {/* 2. GRÁFICO DE VOLUME DE TAREFAS */}
      <Panel variant="default" className="p-6 space-y-4">
        <div className="border-b border-blue-900/40 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              2. Volume de Tarefas por Dia
            </h2>
            <p className="text-xs text-slate-400 font-light">
              Comparativo de tarefas criadas, concluídas e pendentes por dia
            </p>
          </div>
          <span className="text-xs text-slate-300 font-semibold bg-[#0B1530] border border-blue-900/40 px-2.5 py-1 rounded-md">
            Gráfico de Volume
          </span>
        </div>

        <div className="w-full pt-2" style={{ minHeight: '260px' }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#172554" />
              <XAxis dataKey="dia" tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis allowDecimals={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip content={<CustomVolumeTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
              />
              <Bar dataKey="criadas" name="Criadas" fill="#64748b" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="concluidas" name="Concluídas" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="pendentes" name="Pendentes" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* HISTÓRICO RECENTE */}
      <Panel variant="default" className="p-6 space-y-4">
        <div className="border-b border-blue-900/40 pb-3">
          <h2 className="text-base font-bold text-white tracking-tight">
            Histórico Recente
          </h2>
          <p className="text-xs text-slate-400 font-light">Detalhamento dos registros por data</p>
        </div>

        <div className="divide-y divide-blue-950/60">
          {historyDesc.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 italic">
              Nenhum histórico registrado ainda.
            </div>
          ) : (
            historyDesc.map((item) => {
              const formattedDate = formatDateShort(item.data);

              return (
                <div
                  key={item.data}
                  className="py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#0E1A38]/50 rounded-lg transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">
                        {formattedDate}
                      </span>
                      {item.diaSemana && (
                        <span className="text-xs text-slate-400 font-medium">
                          • {item.diaSemana}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                      <span>{item.criadas} criadas</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">
                        {item.concluidas} concluídas
                      </span>
                      {item.pendentes > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400 font-medium">
                            {item.pendentes} pendentes
                          </span>
                        </>
                      )}
                      {item.adiadas > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-400 font-medium">
                            {item.adiadas} adiadas
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 bg-[#081126] border border-blue-900/40 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="bg-cyan-400 h-full rounded-full"
                        style={{ width: `${item.percentualExecucao}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border font-mono ${
                        item.percentualExecucao >= 80
                          ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40'
                          : item.percentualExecucao >= 50
                          ? 'bg-blue-950/70 text-blue-300 border-blue-500/40'
                          : 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {item.percentualExecucao}% concluído
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Panel>
    </div>
  );
};
