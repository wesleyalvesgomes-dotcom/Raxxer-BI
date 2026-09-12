// Tipos e Modelos do BI Comercial RAXXER (Fase 2)

export type CommercialFunnelStage =
  | 'novo_lead'
  | 'primeira_tratativa'
  | 'segunda_tratativa'
  | 'terceira_tratativa'
  | 'atendimento'
  | 'documentacao'
  | 'visita_agendada'
  | 'proposta'
  | 'venda'
  | 'perdido';

export interface CommercialFunnelStageConfig {
  id: CommercialFunnelStage;
  label: string;
  ordem: number;
  descricao: string;
  cor: string;
}

export const COMMERCIAL_FUNNEL_STAGES: readonly CommercialFunnelStageConfig[] = [
  {
    id: 'novo_lead',
    label: 'Novo lead',
    ordem: 1,
    descricao: 'Lead recém-captado ou cadastrado, ainda sem contato inicial.',
    cor: '#3B82F6', // Blue
  },
  {
    id: 'primeira_tratativa',
    label: 'Primeira tratativa',
    ordem: 2,
    descricao: 'Primeira tentativa ou contato inicial de abordagem.',
    cor: '#6366F1', // Indigo
  },
  {
    id: 'segunda_tratativa',
    label: 'Segunda tratativa',
    ordem: 3,
    descricao: 'Follow-up ou segundo contato para avanço da conversa.',
    cor: '#8B5CF6', // Purple
  },
  {
    id: 'terceira_tratativa',
    label: 'Terceira tratativa',
    ordem: 4,
    descricao: 'Terceiro contato de insistência ou reativação do lead.',
    cor: '#A855F7', // Fuchsia
  },
  {
    id: 'atendimento',
    label: 'Atendimento',
    ordem: 5,
    descricao: 'Lead em atendimento ativo e qualificação de interesse.',
    cor: '#EC4899', // Pink
  },
  {
    id: 'documentacao',
    label: 'Documentação',
    ordem: 6,
    descricao: 'Coleta, análise e validação de documentos cadastrais.',
    cor: '#F59E0B', // Amber
  },
  {
    id: 'visita_agendada',
    label: 'Visita agendada',
    ordem: 7,
    descricao: 'Visita técnica, presencial ou demonstração agendada.',
    cor: '#EAB308', // Yellow
  },
  {
    id: 'proposta',
    label: 'Proposta',
    ordem: 8,
    descricao: 'Proposta formal enviada em negociação de valores e condições.',
    cor: '#10B981', // Emerald
  },
  {
    id: 'venda',
    label: 'Venda',
    ordem: 9,
    descricao: 'Negócio fechado e venda convertida com sucesso.',
    cor: '#059669', // Dark Emerald
  },
  {
    id: 'perdido',
    label: 'Perdido',
    ordem: 10,
    descricao: 'Negociação não concretizada ou lead desqualificado/desistente.',
    cor: '#EF4444', // Red
  },
] as const;

export type LeadTemperature = 'frio' | 'morno' | 'quente';

export type LeadStatus = 'ativo' | 'ganho' | 'perdido' | 'pausado';

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
  etapa: CommercialFunnelStage;
  temperatura?: LeadTemperature;
  status?: LeadStatus;
  valorEstimado?: number;
  interesse?: string;
  responsavel?: string;
  motivoPerda?: string;
  tags?: string[];
  observacoes?: string;
  dataCriacao: string; // ISO string
  dataAtualizacao: string; // ISO string
  dataUltimoContato?: string; // ISO string
  proximoContato?: string; // ISO string ou YYYY-MM-DD
}

export type InteractionType =
  | 'whatsapp'
  | 'ligacao'
  | 'reuniao'
  | 'email'
  | 'visita'
  | 'mensagem'
  | 'outro';

export interface CommercialInteractionItem {
  id: string;
  leadId: string;
  tipo: InteractionType;
  descricao: string;
  data: string; // ISO string
  proximaAcao?: string;
  dataProximaAcao?: string; // ISO string ou YYYY-MM-DD
  responsavel?: string;
  resultado?: string;
  dataCriacao: string;
}

export type VisitStatus = 'agendada' | 'realizada' | 'cancelada' | 'reagendada';

export interface CommercialVisitItem {
  id: string;
  leadId: string;
  dataAgendada: string; // YYYY-MM-DD
  horario?: string; // HH:mm
  local?: string;
  status: VisitStatus;
  feedback?: string;
  responsavel?: string;
  dataCriacao: string;
  dataRealizacao?: string;
  dataCancelamento?: string;
  motivoCancelamento?: string;
}

export type ProposalStatus =
  | 'em_analise'
  | 'enviada'
  | 'aceita'
  | 'recusada'
  | 'expirada';

export interface CommercialProposalItem {
  id: string;
  leadId: string;
  numeroIdentificador?: string;
  valor: number;
  condicoes?: string;
  validade?: string; // YYYY-MM-DD
  status: ProposalStatus;
  dataEnvio: string; // ISO string
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
  dataVenda: string; // YYYY-MM-DD
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
  mesReferencia?: string; // ex: '2026-09'
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
  interactions: CommercialInteractionItem[];
  visits: CommercialVisitItem[];
  proposals: CommercialProposalItem[];
  sales: CommercialSaleItem[];
  goals: CommercialGoalItem[];
}
