import { DailyHistoryLog, GoalItem, MemoryItem, ProjectItem, TaskItem, UserProfile, WeeklyReview } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  nome: 'Wesley Gomes',
  comoSerChamado: 'Wesley',
  rotinaAtual: '',
  responsabilidades: '',
  metasProximas: '',
  metasLongoPrazo: '',
  mudancasDesejadas: '',
  projetosAtuais: '',
  ideiasFuturas: '',
  prioridades: '',
  organizacaoHoje: '',
  dificuldades: '',
  procrastination: '',
  estudando: '',
  querAprender: '',
  rotinaSaude: '',
  habitosMelhorar: '',
  objetivosFinanceiros: '',
  planejamentoFinancas: '',
  interviewCompleted: false,
  currentInterviewStep: 0,
};

export const INITIAL_MEMORIES: MemoryItem[] = [];

export const INITIAL_TASKS: TaskItem[] = [];

export const INITIAL_GOALS: GoalItem[] = [];

export const INITIAL_PROJECTS: ProjectItem[] = [];

export const INITIAL_WEEKLY_REVIEWS: WeeklyReview[] = [];

export const INITIAL_DAILY_HISTORY: DailyHistoryLog[] = [];
