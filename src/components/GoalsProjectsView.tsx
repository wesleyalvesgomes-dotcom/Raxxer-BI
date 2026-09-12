import React, { useState } from 'react';
import {
  Target,
  FolderKanban,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Trash2,
  Calendar,
  Layers,
  Loader2,
} from 'lucide-react';
import { GoalItem, MemoryCategory, MemoryImportance, ProjectItem } from '../types';
import { Panel, SectionHeader, MetricCard, StatusBadge, Button } from './common/DesignSystem';

interface GoalsProjectsViewProps {
  goals: GoalItem[];
  projects: ProjectItem[];
  onAddGoal: (newGoal: Omit<GoalItem, 'id' | 'dataCriacao'>) => void;
  onUpdateGoalProgress: (id: string, newProgress: number) => void;
  onToggleGoalNextStep: (goalId: string, stepIndex: number) => void;
  onDeleteGoal: (id: string) => void;
  onAddProject: (newProject: Omit<ProjectItem, 'id' | 'dataAtualizacao'>) => void;
  onUpdateProjectProgress: (id: string, newProgress: number) => void;
  onDeleteProject: (id: string) => void;
  onOpenAIChat: (prompt?: string) => void;
}

export const GoalsProjectsView: React.FC<GoalsProjectsViewProps> = ({
  goals,
  projects,
  onAddGoal,
  onUpdateGoalProgress,
  onToggleGoalNextStep,
  onDeleteGoal,
  onAddProject,
  onUpdateProjectProgress,
  onDeleteProject,
  onOpenAIChat,
}) => {
  const [activeTab, setActiveTab] = useState<'metas' | 'projetos'>('metas');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);

  // New Goal Form State
  const [goalObjetivo, setGoalObjetivo] = useState('');
  const [goalPrazo, setGoalPrazo] = useState('');
  const [goalCategoria, setGoalCategoria] = useState<MemoryCategory>('metas');
  const [goalStepInput, setGoalStepInput] = useState('');
  const [goalSteps, setGoalSteps] = useState<string[]>([]);

  // New Project Form State
  const [projNome, setProjNome] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projPrioridade, setProjPrioridade] = useState<MemoryImportance>('alta');

  // AI Goal Advice Modal
  const [aiGoalAdvice, setAiGoalAdvice] = useState<{ goalId: string; text: string } | null>(null);
  const [loadingGoalId, setLoadingGoalId] = useState<string | null>(null);

  const handleAddStepToGoal = () => {
    if (goalStepInput.trim()) {
      setGoalSteps([...goalSteps, goalStepInput.trim()]);
      setGoalStepInput('');
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalObjetivo.trim()) return;

    onAddGoal({
      objetivo: goalObjetivo.trim(),
      categoria: goalCategoria,
      prazo: goalPrazo.trim() || undefined,
      progresso: 0,
      status: 'em_andamento',
      proximosPassos: goalSteps.map((step) => ({ passo: step, concluido: false })),
    });

    setGoalObjetivo('');
    setGoalPrazo('');
    setGoalSteps([]);
    setIsAddingGoal(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projNome.trim()) return;

    onAddProject({
      nome: projNome.trim(),
      descricao: projDesc.trim(),
      status: 'ativo',
      progresso: 0,
      prioridade: projPrioridade,
      etapas: [],
    });

    setProjNome('');
    setProjDesc('');
    setIsAddingProject(false);
  };

  const handleConsultAIGoal = async (goal: GoalItem) => {
    setLoadingGoalId(goal.id);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analise minha meta: "${goal.objetivo}". Categoria: ${goal.categoria}, Progresso: ${goal.progresso}%. Sugira 3 ações práticas e um conselho estratégico para acelerar meu resultado.`,
        }),
      });

      if (!response.ok) throw new Error('Falha ao obter conselho');
      const data = await response.json();
      setAiGoalAdvice({ goalId: goal.id, text: data.text });
    } catch (err) {
      setAiGoalAdvice({
        goalId: goal.id,
        text: 'Concentre-se em quebrar esta meta em microações diárias de 25 minutos. A consistência diária vence qualquer sprint isolado.',
      });
    } finally {
      setLoadingGoalId(null);
    }
  };

  // Metrics
  const avgGoalProgress =
    goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + g.progresso, 0) / goals.length)
      : 0;
  const activeProjectsCount = projects.filter((p) => p.status === 'ativo').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 pt-2 font-sans text-slate-100">
      {/* Banner Superior */}
      <div className="relative rounded-2xl overflow-hidden border border-blue-900/40 bg-gradient-to-r from-[#091530] via-[#0D1C44] to-[#112356] p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-300 bg-blue-950/80 border border-blue-800/60 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                Planejamento & Conquistas
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Metas & Projetos Estratégicos
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl font-light">
              Monitore sua evolução patrimonial, objetivos profissionais e marcos de longo prazo com o suporte da IA.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'metas' ? 'primary' : 'secondary'}
              size="md"
              icon={Target}
              onClick={() => setActiveTab('metas')}
            >
              Metas ({goals.length})
            </Button>
            <Button
              variant={activeTab === 'projetos' ? 'primary' : 'secondary'}
              size="md"
              icon={FolderKanban}
              onClick={() => setActiveTab('projetos')}
            >
              Projetos ({projects.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Indicadores Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Progresso Médio das Metas"
          value={`${avgGoalProgress}%`}
          subtitle="Taxa geral de avanço"
          trend={avgGoalProgress > 50 ? '↑ Positivo' : 'Em curso'}
          icon={TrendingUp}
          iconColor="text-cyan-400"
          iconBg="bg-[#083344] border border-cyan-500/30"
          variant={avgGoalProgress > 70 ? 'highlight' : 'default'}
        />
        <MetricCard
          title="Total de Metas Ativas"
          value={goals.length}
          subtitle="Objetivos traçados"
          icon={Target}
          iconColor="text-blue-400"
          iconBg="bg-[#132A54] border border-blue-500/30"
        />
        <MetricCard
          title="Projetos em Andamento"
          value={activeProjectsCount}
          subtitle="Iniciativas em execução"
          icon={FolderKanban}
          iconColor="text-purple-400"
          iconBg="bg-[#1E1B4B] border border-purple-500/30"
        />
      </div>

      {/* Aba de Metas */}
      {activeTab === 'metas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Objetivos & Metas Cadastradas
            </h2>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddingGoal(true)}
            >
              Nova Meta
            </Button>
          </div>

          {/* Form Nova Meta */}
          {isAddingGoal && (
            <Panel variant="glow" className="p-6 space-y-4 animate-fadeIn">
              <SectionHeader
                icon={Target}
                title="Cadastrar Nova Meta"
                subtitle="Defina o objetivo, prazo e próximos passos"
              />

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Qual é o seu objetivo?</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Atingir 10 vendas no mês na INC Empreendimentos"
                    value={goalObjetivo}
                    onChange={(e) => setGoalObjetivo(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Categoria</label>
                    <select
                      value={goalCategoria}
                      onChange={(e) => setGoalCategoria(e.target.value as MemoryCategory)}
                      className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="metas">Comercial / Vendas</option>
                      <option value="projetos">Projetos & Estratégia</option>
                      <option value="identidade">Identidade & Direção</option>
                      <option value="aprendizados">Desenvolvimento Pessoal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Prazo estimado</label>
                    <input
                      type="date"
                      value={goalPrazo}
                      onChange={(e) => setGoalPrazo(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Próximos passos práticos</label>
                  <div className="flex gap-2 mt-1.5">
                    <input
                      type="text"
                      placeholder="Adicione um passo..."
                      value={goalStepInput}
                      onChange={(e) => setGoalStepInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={handleAddStepToGoal}>
                      Adicionar
                    </Button>
                  </div>

                  {goalSteps.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {goalSteps.map((step, idx) => (
                        <div key={idx} className="text-xs text-slate-300 bg-[#0B1530] px-3 py-1.5 rounded-lg border border-blue-900/30 flex items-center justify-between">
                          <span>{idx + 1}. {step}</span>
                          <button
                            type="button"
                            onClick={() => setGoalSteps(goalSteps.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingGoal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Salvar Meta
                  </Button>
                </div>
              </form>
            </Panel>
          )}

          {/* Cards de Metas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <Panel key={goal.id} variant="default" className="p-5 space-y-4 hover:border-blue-600/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <StatusBadge
                      label={goal.categoria.toUpperCase()}
                      variant="cyan"
                    />
                    <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                      {goal.objetivo}
                    </h3>
                  </div>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Progresso</span>
                    <span className="text-cyan-400 font-mono font-bold">{goal.progresso}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#081126] border border-blue-900/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${goal.progresso}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-1">
                    {[0, 25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        onClick={() => onUpdateGoalProgress(goal.id, val)}
                        className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
                          goal.progresso === val
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-500 hover:text-slate-300 bg-[#081126]'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Próximos Passos */}
                {goal.proximosPassos && goal.proximosPassos.length > 0 && (
                  <div className="pt-2 border-t border-blue-900/30 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Próximos Passos
                    </span>
                    <div className="space-y-1.5">
                      {goal.proximosPassos.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => onToggleGoalNextStep(goal.id, idx)}
                          className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white"
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              p.concluido ? 'text-emerald-400' : 'text-slate-600'
                            }`}
                          />
                          <span className={p.concluido ? 'line-through text-slate-500' : ''}>
                            {p.passo}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botão AI Advice */}
                <div className="pt-2 border-t border-blue-900/30 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {goal.prazo ? `Prazo: ${goal.prazo}` : 'Sem prazo definido'}
                  </span>
                  <Button
                    variant="ai"
                    size="sm"
                    icon={loadingGoalId === goal.id ? Loader2 : Sparkles}
                    disabled={loadingGoalId === goal.id}
                    onClick={() => handleConsultAIGoal(goal)}
                  >
                    Estratégia IA
                  </Button>
                </div>

                {aiGoalAdvice && aiGoalAdvice.goalId === goal.id && (
                  <div className="p-3.5 rounded-xl bg-[#081126] border border-blue-500/40 text-xs text-slate-300 leading-relaxed font-light mt-2 animate-fadeIn">
                    <div className="flex items-center justify-between mb-1 text-cyan-400 font-bold text-[11px]">
                      <span>Recomendação RAXXER AI</span>
                      <button onClick={() => setAiGoalAdvice(null)} className="text-slate-500 hover:text-white">✕</button>
                    </div>
                    {aiGoalAdvice.text}
                  </div>
                )}
              </Panel>
            ))}
          </div>
        </div>
      )}

      {/* Aba de Projetos */}
      {activeTab === 'projetos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-cyan-400" />
              Iniciativas & Projetos Ativos
            </h2>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddingProject(true)}
            >
              Novo Projeto
            </Button>
          </div>

          {/* Form Novo Projeto */}
          {isAddingProject && (
            <Panel variant="glow" className="p-6 space-y-4 animate-fadeIn">
              <SectionHeader
                icon={FolderKanban}
                title="Novo Projeto Estratégico"
                subtitle="Defina o escopo e prioridade"
              />

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Nome do Projeto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Campanha de Lançamento Residencial Jardins"
                    value={projNome}
                    onChange={(e) => setProjNome(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Descrição</label>
                  <textarea
                    rows={2}
                    placeholder="Objetivo principal, metas intermediárias e responsáveis..."
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingProject(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Criar Projeto
                  </Button>
                </div>
              </form>
            </Panel>
          )}

          {/* Cards de Projetos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <Panel key={p.id} variant="default" className="p-5 space-y-4 hover:border-blue-600/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <StatusBadge label="PROJETO ATIVO" variant="green" />
                    <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">{p.nome}</h3>
                    {p.descricao && (
                      <p className="text-xs text-slate-400 mt-1 font-light line-clamp-2">{p.descricao}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteProject(p.id)}
                    className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progresso do Projeto */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progresso</span>
                    <span className="text-cyan-400 font-mono font-bold">{p.progresso}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#081126] border border-blue-900/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all"
                      style={{ width: `${p.progresso}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-1">
                    {[0, 25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        onClick={() => onUpdateProjectProgress(p.id, val)}
                        className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
                          p.progresso === val
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-500 hover:text-slate-300 bg-[#081126]'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
