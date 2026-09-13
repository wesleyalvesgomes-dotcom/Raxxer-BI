// Tipos e Modelos do Controle Comercial e BI do RAXXER
// Escopo focado: Gestão de Leads, Balanços (Diário, Semanal, Mensal), Análises e Vendas/VGV

export type CommercialLeadStatus =
  | 'atendimentos'
  | 'descartados'
  | 'nao_atenderam'
  | 'em_analise'
  | 'aprovados'
  | 'reprovados'
  | 'vendidos';

// Alias para compatibilidade com versões anteriores
export type CommercialFunnelStage = CommercialLeadStatus;

export interface CommercialStageConfig {
  id: CommercialLeadStatus;
  label: string; // Exatamente como requerido na interface
  ordem: number;
  descricao: string;
  cor: string;
  badgeClass: string;
}

// 7 Etapas/Status Oficiais do RAXXER
export const COMMERCIAL_STAGES: readonly CommercialStageConfig[] = [
  {
    id: 'atendimentos',
    label: 'Atendimentos',
    ordem: 1,
    descricao: 'Leads que estão sendo acompanhados ou atendidos.',
    cor: '#3B82F6', // Blue
    badgeClass: 'bg-blue-950/70 text-blue-300 border-blue-500/40',
  },
  {
    id: 'descartados',
    label: 'Descartados',
    ordem: 2,
    descricao: 'Leads que foram descartados.',
    cor: '#64748B', // Slate
    badgeClass: 'bg-slate-900 text-slate-300 border-slate-700/50',
  },
  {
    id: 'nao_atenderam',
    label: 'Não atenderam',
    ordem: 3,
    descricao: 'Leads que ainda não atenderam ou não respondem.',
    cor: '#818CF8', // Indigo
    badgeClass: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40',
  },
  {
    id: 'em_analise',
    label: 'Em análise',
    ordem: 4,
    descricao: 'Leads cuja documentação/cadastro entrou em análise de crédito ou processo.',
    cor: '#F59E0B', // Amber
    badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
  },
  {
    id: 'aprovados',
    label: 'Aprovados',
    ordem: 5,
    descricao: 'Leads aprovados pela análise de crédito/financiamento.',
    cor: '#10B981', // Emerald
    badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'reprovados',
    label: 'Reprovados',
    ordem: 6,
    descricao: 'Leads reprovados na análise ou sem enquadramento financeiro.',
    cor: '#EF4444', // Red
    badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-500/40',
  },
  {
    id: 'vendidos',
    label: 'Vendidos',
    ordem: 7,
    descricao: 'Vendas concretizadas com registro de VGV.',
    cor: '#06B6D4', // Cyan
    badgeClass: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40',
  },
] as const;

// Alias para evitar quebras em código legado
export const COMMERCIAL_FUNNEL_STAGES = COMMERCIAL_STAGES;
export type CommercialFunnelStageConfig = CommercialStageConfig;

export type LeadChannel =
  | 'whatsapp'
  | 'indicacao'
  | 'instagram'
  | 'site'
  | 'portal_imobiliario'
  | 'evento'
  | 'telefone'
  | 'outro';

export interface CommercialLeadItem {
  id: string;
  nome: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  canalOrigem?: LeadChannel | string;
  empreendimento?: string;
  renda?: number | string;
  cidade?: string;
  status: CommercialLeadStatus;
  etapa?: CommercialLeadStatus; // mantido sincronizado para compatibilidade
  
  // Datas e Controle
  dataCadastro?: string; // ISO string ou YYYY-MM-DD
  dataCriacao: string; // ISO string
  dataAtualizacao: string; // ISO string
  dataUltimoContato?: string; // ISO string ou YYYY-MM-DD
  proximoContato?: string; // ISO string ou YYYY-MM-DD
  observacoes?: string;

  // Resultado Comercial Específico
  dataAnalise?: string; // Data em que entrou em análise
  dataAprovacao?: string; // Data da aprovação
  dataReprovacao?: string; // Data da reprovação
  dataVenda?: string; // Data da venda
  valorAprovado?: number; // Valor aprovado
  vgv?: number; // VGV vendido
  motivoDescarteReprovacao?: string; // Motivo do descarte ou reprovação
  
  // Flag para assegurar contabilização única de venda sem duplicação em edições
  vendaContabilizada?: boolean;

  // Campos legados mapeados de forma segura
  valorEstimado?: number;
  motivoPerda?: string;
  temperatura?: string;
  responsavel?: string;
  tags?: string[];
  interesse?: string;
}

// Histórico de Eventos Importantes do Lead
export type LeadHistoryEventType =
  | 'lead_cadastrado'
  | 'status_alterado'
  | 'entrou_analise'
  | 'aprovado'
  | 'reprovado'
  | 'vendido'
  | 'descartado'
  | 'observacao_adicionada';

export interface CommercialLeadHistoryEvent {
  id: string;
  leadId: string;
  type: LeadHistoryEventType;
  createdAt: string; // ISO string
  statusAnterior?: CommercialLeadStatus | string;
  novoStatus?: CommercialLeadStatus | string;
  observacao?: string;
  valor?: number; // Valor aprovado ou VGV
}

// Balanços Comercial (Diário, Semanal e Mensal)
export interface CommercialBalanceMetrics {
  periodo: 'diario' | 'semanal' | 'mensal';
  dataInicio: string;
  dataFim: string;
  
  // Métricas principais
  cadastrados: number;
  atendimentos: number;
  naoAtenderam: number;
  descartados: number;
  analises: number;
  aprovados: number;
  reprovados: number;
  vendidos: number;
  vgv: number;
  
  // Conversões
  taxaConversaoAnalise: number; // (analises / cadastrados) * 100
  taxaConversaoVenda: number; // (vendidos / cadastrados) * 100
  taxaConversaoGeral: number; // (vendidos / totalLeads) * 100
}

// Tipos legados para não quebrar compatibilidade
export type InteractionType = 'whatsapp' | 'ligacao' | 'reuniao' | 'email' | 'visita' | 'mensagem' | 'outro';
export interface CommercialInteractionItem {
  id: string;
  leadId: string;
  tipo: InteractionType;
  descricao: string;
  data: string;
  proximaAcao?: string;
  dataProximaAcao?: string;
  responsavel?: string;
  resultado?: string;
  dataCriacao: string;
}

export type VisitStatus = 'agendada' | 'realizada' | 'cancelada' | 'reagendada';
export interface CommercialVisitItem {
  id: string;
  leadId: string;
  dataAgendada: string;
  horario?: string;
  local?: string;
  status: VisitStatus;
  feedback?: string;
  responsavel?: string;
  dataCriacao: string;
}

export type ProposalStatus = 'em_analise' | 'enviada' | 'aceita' | 'recusada' | 'expirada';
export interface CommercialProposalItem {
  id: string;
  leadId: string;
  numeroIdentificador?: string;
  valor: number;
  condicoes?: string;
  validade?: string;
  status: ProposalStatus;
  dataEnvio: string;
  dataResposta?: string;
  arquivoUrl?: string;
  observacoes?: string;
  dataCriacao: string;
}

export type SaleStatus = 'fechada' | 'faturada' | 'cancelada' | 'em_contrato';
export interface CommercialSaleItem {
  id: string;
  leadId: string;
  propostaId?: string;
  valorTotal: number;
  comissaoValor?: number;
  comissaoPercentual?: number;
  dataVenda: string;
  status: SaleStatus;
  produtoOuServico: string;
  compradorNome: string;
  compradorDocumento?: string;
  compradorTelefone?: string;
  formaPagamento?: string;
  observacoes?: string;
  dataCriacao: string;
}

export type CommercialGoalPeriod = 'mensal' | 'trimestral' | 'anual' | 'semanal';
export interface CommercialGoalItem {
  id: string;
  titulo: string;
  periodo: CommercialGoalPeriod;
  mesReferencia?: string;
  ano: number;
  metaVendasValor: number;
  metaVendasQuantidade: number;
  metaLeads: number;
  metaVisitas: number;
  metaPropostas: number;
  realizadoVendasValor: number;
  realizadoVendasQuantidade: number;
  realizadoLeads: number;
  realizadoVisitas: number;
  realizadoPropostas: number;
  dataCriacao: string;
  dataAtualizacao: string;
  observacoes?: string;
}

// Snapshot completo do banco comercial local
export interface CommercialDataSnapshot {
  leads: CommercialLeadItem[];
  history: CommercialLeadHistoryEvent[];
  interactions: CommercialInteractionItem[];
  visits: CommercialVisitItem[];
  proposals: CommercialProposalItem[];
  sales: CommercialSaleItem[];
  goals: CommercialGoalItem[];
}
