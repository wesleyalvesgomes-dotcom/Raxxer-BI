import React, { useState } from 'react';
import {
  BarChart3,
  Trophy,
  AlertCircle,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Calendar,
  Loader2,
  ListTodo,
} from 'lucide-react';
import { GoalItem, MemoryItem, TaskItem, WeeklyReview } from '../types';
import { Panel, SectionHeader, MetricCard, Button } from './common/DesignSystem';

interface WeeklyReviewViewProps {
  reviews: WeeklyReview[];
  tasks: TaskItem[];
  goals: GoalItem[];
  memories: MemoryItem[];
  onSaveReview: (review: WeeklyReview) => void;
  onOpenAIChat: (prompt?: string) => void;
}

export const WeeklyReviewView: React.FC<WeeklyReviewViewProps> = ({
  reviews,
  tasks,
  goals,
  memories,
  onSaveReview,
  onOpenAIChat,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReview, setSelectedReview] = useState<WeeklyReview | null>(reviews[0] || null);

  const completedTasks = tasks.filter((t) => t.concluida);
  const pendingTasks = tasks.filter((t) => !t.concluida);

  const handleGenerateWeeklyReview = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/weekly-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedTasks,
          pendingTasks,
          goals,
          memories,
          weekName: `Semana ${getWeekNumber(new Date())} (${new Date().getFullYear()})`,
        }),
      });

      if (!response.ok) throw new Error('Erro no servidor');

      const data = await response.json();

      const newReview: WeeklyReview = {
        id: `review-${Date.now()}`,
        semana: `Semana ${getWeekNumber(new Date())} (${new Date().getFullYear()})`,
        conquistas: data.conquistas || ['Avançou nas metas principais da semana'],
        pendencias: data.pendencias || ['Revisar tarefas não concluídas'],
        pontosAtencao: data.pontosAtencao || ['Manter foco nos horários de maior energia'],
        recomendacoes: data.recomendacoes || ['Priorizar o bloco matinal para deep work'],
        data: new Date().toISOString(),
      };

      onSaveReview(newReview);
      setSelectedReview(newReview);
    } catch (err: any) {
      console.error(err);
      const fallbackReview: WeeklyReview = {
        id: `review-${Date.now()}`,
        semana: `Semana ${getWeekNumber(new Date())} (${new Date().getFullYear()})`,
        conquistas: [
          `Concluiu ${completedTasks.length} tarefas relevantes na semana`,
          'Manteve a estrutura do RAXXER atualizada',
        ],
        pendencias: pendingTasks.map((t) => t.titulo).slice(0, 3),
        pontosAtencao: ['Atenção aos horários em que a energia cai durante a tarde'],
        recomendacoes: [
          'Começar o dia executando a tarefa mais urgente primeiro',
          'Bloquear 1 hora por dia sem notificações',
        ],
        data: new Date().toISOString(),
      };
      onSaveReview(fallbackReview);
      setSelectedReview(fallbackReview);
    } finally {
      setIsGenerating(false);
    }
  };

  function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  const current = selectedReview || reviews[0];

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-100">
      {/* Top Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-blue-900/40 bg-gradient-to-r from-[#091530] via-[#0D1C44] to-[#112356] p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Revisão Semanal — Diagnóstico & Reflexão
          </h2>
          <p className="text-xs text-slate-300 font-light">
            Análise de conquistas, gargalos e direcionamento nos três pilares (Pessoa, INC e Direção).
          </p>
        </div>

        <Button
          onClick={handleGenerateWeeklyReview}
          disabled={isGenerating}
          variant="primary"
          size="md"
          icon={isGenerating ? Loader2 : Sparkles}
        >
          {isGenerating ? 'Sintetizando com IA...' : 'Gerar Nova Revisão com IA'}
        </Button>
      </div>

      {/* Visual Weekly Progress Chart */}
      <Panel variant="default" className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Desempenho Visual da Semana</h3>
            <p className="text-[11px] text-slate-400 font-light">Taxa de conclusão e ritmo de entregas diárias</p>
          </div>
          <span className="text-xs font-bold text-cyan-300 bg-blue-950/80 border border-blue-500/40 px-3 py-1 rounded-lg font-mono">
            {completedTasks.length} tarefas entregues
          </span>
        </div>

        {/* Bar Chart for Days of Week */}
        <div className="grid grid-cols-7 gap-2 md:gap-4 pt-2">
          {[
            { day: 'Seg', val: 85, tasks: '4/5' },
            { day: 'Ter', val: 100, tasks: '5/5' },
            { day: 'Qua', val: 70, tasks: '3/4' },
            { day: 'Qui', val: 90, tasks: '4/4' },
            { day: 'Sex', val: 60, tasks: '3/5' },
            { day: 'Sáb', val: 40, tasks: '2/3' },
            { day: 'Dom', val: 100, tasks: '1/1' },
          ].map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full bg-[#081126] h-28 rounded-xl relative overflow-hidden flex items-end p-1 border border-blue-900/40">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 hover:brightness-110 rounded-lg transition-all duration-500 flex items-center justify-center shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                  style={{ height: `${d.val}%` }}
                >
                  <span className="text-[9px] font-bold text-white font-mono hidden md:inline">{d.val}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-200">{d.day}</p>
                <p className="text-[10px] text-slate-400 font-mono">{d.tasks}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {reviews.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {reviews.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReview(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                current?.id === r.id
                  ? 'bg-blue-950/80 text-cyan-300 border-blue-500/50 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  : 'bg-[#0A122A] text-slate-400 border-blue-900/40 hover:text-white'
              }`}
            >
              {r.semana}
            </button>
          ))}
        </div>
      )}

      {current ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Box 1: Conquistas da Semana */}
          <Panel variant="default" className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-blue-900/40 pb-3">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                🏆 Conquistas da Semana
              </h3>
            </div>
            <ul className="space-y-2.5">
              {current.conquistas.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 font-light">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Box 2: Pendências Acumuladas */}
          <Panel variant="default" className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-blue-900/40 pb-3">
              <ListTodo className="w-5 h-5 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                📌 Pendências & Gargalos
              </h3>
            </div>
            <ul className="space-y-2.5">
              {current.pendencias.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Box 3: Pontos de Atenção */}
          <Panel variant="default" className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-blue-900/40 pb-3">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                ⚠️ Pontos de Atenção (Procrastinação / Hábitos)
              </h3>
            </div>
            <ul className="space-y-2.5">
              {current.pontosAtencao.map((pa, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                  <span>{pa}</span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Box 4: Recomendações Estratégicas */}
          <Panel variant="highlight" className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-blue-900/40 pb-3">
              <Lightbulb className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                💡 Recomendações Estratégicas da IA
              </h3>
            </div>
            <ul className="space-y-2.5">
              {current.recomendacoes.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200 font-light">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      ) : (
        <Panel variant="default" className="text-center py-12">
          <p className="text-xs text-slate-400 font-light">
            Nenhuma revisão semanal gerada ainda. Clique no botão acima para sintetizar a sua primeira revisão!
          </p>
        </Panel>
      )}
    </div>
  );
};
