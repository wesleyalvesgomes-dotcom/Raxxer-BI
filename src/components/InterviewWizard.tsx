import React, { useState } from 'react';
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Target,
  FolderKanban,
  Clock,
  BookOpen,
  Heart,
  Coins,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { Panel, SectionHeader, Button } from './common/DesignSystem';

interface InterviewWizardProps {
  initialProfile: UserProfile;
  onCompleteInterview: (
    updatedProfile: UserProfile,
    aiGeneratedData?: {
      memories: any[];
      goals: any[];
      tasks: any[];
      welcomeAnalysis: string;
    }
  ) => void;
  onCancel?: () => void;
}

const STEPS = [
  {
    id: 1,
    title: 'Identidade & Arquitetura de 3 Pilares',
    icon: User,
    color: 'bg-blue-950/80 text-cyan-300 border-blue-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]',
    description: 'Ajuste do RAXXER entre seus três pilares fundamentais: Wesley Pessoa, Wesley Profissional (INC Empreendimentos) e Wesley Direção.',
    questions: [
      { key: 'nome', label: 'Qual é o seu nome completo?', placeholder: 'Ex: Wesley Gomes' },
      { key: 'comoSerChamado', label: 'Como você prefere que o RAXXER te chame?', placeholder: 'Ex: Wesley' },
      { key: 'rotinaAtual', label: 'Como é a sua rotina diária no Pessoal, Profissional e no seu Direcionamento?', placeholder: 'Ex: Manhãs com foco no CRM/leads da INC, tardes em agendamentos/atendimentos e noites com família e estudos...' },
      { key: 'responsabilidades', label: 'Quais são suas principais responsabilidades em cada um dos pilares?', placeholder: 'Ex: Profissional: 10 vendas/mês na INC. Pessoal: Saúde, treino 4x/semana e finanças. Direção: Equilíbrio e presença...' },
    ],
  },
  {
    id: 2,
    title: 'Metas & Visão de Futuro',
    icon: Target,
    color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.2)]',
    description: 'Onde você quer chegar nos próximos meses e anos.',
    questions: [
      { key: 'metasProximas', label: 'Quais são seus objetivos para os próximos 3 a 6 meses?', placeholder: 'Ex: Atingir metas de vendas na INC, criar hábitos de rotina matinal...' },
      { key: 'metasLongoPrazo', label: 'Quais são seus grandes objetivos de longo prazo (1 a 5 anos)?', placeholder: 'Ex: Independência financeira, evolução patrimonial...' },
      { key: 'mudancasDesejadas', label: 'O que você mais quer mudar ou melhorar na sua vida hoje?', placeholder: 'Ex: Organização comercial, consistência de follow-up com clientes...' },
    ],
  },
  {
    id: 3,
    title: 'Projetos & Prioridades',
    icon: FolderKanban,
    color: 'bg-blue-950/80 text-blue-300 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    description: 'Os projetos que estão em andamento e as ideias no papel.',
    questions: [
      { key: 'projetosAtuais', label: 'Quais são seus projetos atuais que estão em andamento?', placeholder: 'Ex: Carteira de Leads INC, Treinos e Saúde...' },
      { key: 'ideiasFuturas', label: 'Que ideias você tem guardadas para projetos futuros?', placeholder: 'Ex: Expansão de atuação, investimentos futuros...' },
      { key: 'prioridades', label: 'Qual é a sua prioridade absoluta número 1 hoje?', placeholder: 'Ex: Garantir processo comercial constante na INC...' },
    ],
  },
  {
    id: 4,
    title: 'Organização & Desafios',
    icon: Clock,
    color: 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    description: 'Como você organiza seu tempo e quais gargalos enfrenta.',
    questions: [
      { key: 'organizacaoHoje', label: 'Como você organiza o seu dia hoje?', placeholder: 'Ex: CRM da INC, WhatsApp, blocos de tempo...' },
      { key: 'dificuldades', label: 'Onde você sente que tem a sua maior dificuldade?', placeholder: 'Ex: Priorizar contatos certos, manter cadência de retrabalho...' },
      { key: 'procrastination', label: 'O que você costuma deixar para depois ou procrastinar?', placeholder: 'Ex: Acompanhamento de propostas paradas...' },
    ],
  },
  {
    id: 5,
    title: 'Aprendizado & Conhecimento',
    icon: BookOpen,
    color: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
    description: 'Habilidades que você quer dominar e assuntos que está estudando.',
    questions: [
      { key: 'estudando', label: 'O que você está estudando ativamente no momento?', placeholder: 'Ex: Técnicas de negociação, mercado imobiliário...' },
      { key: 'querAprender', label: 'O que mais você gostaria de aprender em breve?', placeholder: 'Ex: Estratégias avançadas de comunicação e vendas...' },
    ],
  },
  {
    id: 6,
    title: 'Saúde & Hábitos',
    icon: Heart,
    color: 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
    description: 'Sua energia física, mental e hábitos diários.',
    questions: [
      { key: 'saudeRotina', label: 'Como estão seus treinos, sono e alimentação?', placeholder: 'Ex: Academia 4x/semana, dormindo 7 horas...' },
      { key: 'habitosFixos', label: 'Quais hábitos você quer manter como inegociáveis?', placeholder: 'Ex: Leitura de 15min, planejamento na noite anterior...' },
    ],
  },
  {
    id: 7,
    title: 'Finanças & Resultados',
    icon: Coins,
    color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.2)]',
    description: 'Objetivos financeiros e métricas de sucesso.',
    questions: [
      { key: 'objetivoFinanceiro', label: 'Qual é o seu objetivo financeiro principal para este ano?', placeholder: 'Ex: Faturamento constante de comissões, reserva de emergência...' },
      { key: 'metasReceita', label: 'Quais métricas definem que o mês foi um sucesso comercial?', placeholder: 'Ex: Mínimo de 3 vendas de imóveis ou R$ 30k em comissão...' },
    ],
  },
];

export const InterviewWizard: React.FC<InterviewWizardProps> = ({
  initialProfile,
  onCompleteInterview,
  onCancel,
}) => {
  const [formData, setFormData] = useState<UserProfile>(initialProfile);
  const [currentStepIndex, setCurrentStepIndex] = useState(
    initialProfile.currentInterviewStep ? Math.min(initialProfile.currentInterviewStep, STEPS.length - 1) : 0
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const step = STEPS[currentStepIndex];
  const StepIcon = step.icon;

  const handleChange = (key: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/ai/onboarding-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileAnswers: formData }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor');
      }

      const data = await response.json();
      const updatedProfile: UserProfile = {
        ...formData,
        interviewCompleted: true,
        currentInterviewStep: STEPS.length,
      };

      onCompleteInterview(updatedProfile, data);
    } catch (err: any) {
      console.error('Erro no processamento com IA:', err);
      const updatedProfile: UserProfile = {
        ...formData,
        interviewCompleted: true,
        currentInterviewStep: STEPS.length,
      };
      onCompleteInterview(updatedProfile);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans text-slate-100">
      {/* Top Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 text-cyan-300 border border-blue-500/40 text-xs font-bold mb-3 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Configuração Estratégica</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Seu Alinhamento no RAXXER
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto font-light">
          Responda às perguntas para alinhar a inteligência do RAXXER nos três pilares: Wesley Pessoa, Wesley Profissional (INC) e Wesley Direção.
        </p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-cyan-400 font-mono">
            Etapa {currentStepIndex + 1} de {STEPS.length}: {step.title}
          </span>
          <span className="text-xs font-semibold text-slate-400 font-mono">
            {Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}% concluído
          </span>
        </div>
        <div className="w-full bg-[#081126] border border-blue-900/40 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Card */}
      <Panel variant="default" className="p-6 md:p-8 relative space-y-6">
        <div className="flex items-center gap-3.5 pb-5 border-b border-blue-900/40">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold ${step.color}`}>
            <StepIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{step.title}</h3>
            <p className="text-xs text-slate-300 font-light">{step.description}</p>
          </div>
        </div>

        {/* Questions Form */}
        <div className="space-y-5">
          {step.questions.map((q) => (
            <div key={q.key} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {q.label}
              </label>
              <textarea
                rows={2}
                value={(formData as any)[q.key] || ''}
                onChange={(e) => handleChange(q.key as keyof UserProfile, e.target.value)}
                placeholder={q.placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#081126] border border-blue-900/50 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-none font-light"
              />
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-blue-900/40">
          <Button
            onClick={handlePrev}
            disabled={currentStepIndex === 0 || isGenerating}
            variant="ghost"
            size="md"
            icon={ArrowLeft}
          >
            Anterior
          </Button>

          <div className="flex items-center gap-3">
            {onCancel && (
              <Button
                onClick={onCancel}
                disabled={isGenerating}
                variant="ghost"
                size="md"
              >
                Pular / Ver Dashboard
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={isGenerating}
              variant="primary"
              size="md"
              icon={isGenerating ? Loader2 : currentStepIndex === STEPS.length - 1 ? Sparkles : ArrowRight}
            >
              {isGenerating ? (
                <span>Construindo Estrutura com IA...</span>
              ) : currentStepIndex === STEPS.length - 1 ? (
                <span>Concluir e Criar Estrutura</span>
              ) : (
                <span>Próximo</span>
              )}
            </Button>
          </div>
        </div>

        {generationError && (
          <p className="mt-4 text-xs text-rose-400 text-center font-semibold">
            {generationError}
          </p>
        )}
      </Panel>
    </div>
  );
};
