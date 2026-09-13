import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  X,
  Phone,
  MessageSquare,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Trash2,
  Edit3,
  AlertTriangle,
  Clock,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  History,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  XCircle,
  FileText,
  UserCheck,
  Check,
} from 'lucide-react';
import {
  CommercialLeadItem,
  CommercialLeadStatus,
  LeadChannel,
  COMMERCIAL_STAGES,
  CommercialLeadHistoryEvent,
} from '../types/commercial';
import { useCommercialData } from '../hooks/useCommercialData';
import { Panel, SectionHeader, Button } from './common/DesignSystem';

const CANAL_OPTIONS: { id: LeadChannel; label: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'indicacao', label: 'Indicação' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'site', label: 'Site Oficial' },
  { id: 'portal_imobiliario', label: 'Portal Imobiliário' },
  { id: 'evento', label: 'Evento / Stand' },
  { id: 'telefone', label: 'Telefone Direto' },
  { id: 'outro', label: 'Outro' },
];

export const LeadsView: React.FC = () => {
  const {
    leads,
    addLead,
    updateLead,
    updateLeadStatus,
    deleteLead,
    getLeadHistoryEvents,
    addLeadHistoryEvent,
  } = useCommercialData();

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [empreendimentoFilter, setEmpreendimentoFilter] = useState<string>('todos');
  const [periodoFilter, setPeriodoFilter] = useState<'todos' | 'hoje' | 'semana' | 'mes'>('todos');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CommercialLeadItem | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<CommercialLeadItem | null>(null);
  const [historyModalLead, setHistoryModalLead] = useState<CommercialLeadItem | null>(null);
  const [statusChangeModal, setStatusChangeModal] = useState<{
    lead: CommercialLeadItem;
    targetStatus: CommercialLeadStatus;
  } | null>(null);

  // Campos do Formulário Principal (Cadastro Rápido & Edição)
  const [formNome, setFormNome] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formCanalOrigem, setFormCanalOrigem] = useState<LeadChannel | string>('whatsapp');
  const [formEmpreendimento, setFormEmpreendimento] = useState('');
  const [formRenda, setFormRenda] = useState('');
  const [formCidade, setFormCidade] = useState('');
  const [formStatus, setFormStatus] = useState<CommercialLeadStatus>('atendimentos');
  const [formDataCadastro, setFormDataCadastro] = useState('');
  const [formDataUltimoContato, setFormDataUltimoContato] = useState('');
  const [formProximoContato, setFormProximoContato] = useState('');
  const [formObservacoes, setFormObservacoes] = useState('');

  // Campos de Resultado Comercial
  const [formDataAnalise, setFormDataAnalise] = useState('');
  const [formDataAprovacao, setFormDataAprovacao] = useState('');
  const [formDataReprovacao, setFormDataReprovacao] = useState('');
  const [formDataVenda, setFormDataVenda] = useState('');
  const [formValorAprovado, setFormValorAprovado] = useState('');
  const [formVGV, setFormVGV] = useState('');
  const [formMotivoDescarte, setFormMotivoDescarte] = useState('');
  const [formError, setFormError] = useState('');

  // Campos do Modal de Transição Rápida de Status
  const [quickValorAprovado, setQuickValorAprovado] = useState('');
  const [quickVGV, setQuickVGV] = useState('');
  const [quickMotivo, setQuickMotivo] = useState('');
  const [quickObservacao, setQuickObservacao] = useState('');

  // Histórico novo registro manual
  const [novaObservacaoHistorico, setNovaObservacaoHistorico] = useState('');

  // Lista única de empreendimentos para filtro
  const listaEmpreendimentos = useMemo(() => {
    const setEmp = new Set<string>();
    leads.forEach((l) => {
      const emp = l.empreendimento || l.interesse;
      if (emp && emp.trim()) {
        setEmp.add(emp.trim());
      }
    });
    return Array.from(setEmp).sort();
  }, [leads]);

  // Contadores rápidos para o topo
  const counters = useMemo(() => {
    const total = leads.length;
    const atendimentos = leads.filter((l) => l.status === 'atendimentos').length;
    const emAnalise = leads.filter((l) => l.status === 'em_analise').length;
    const aprovados = leads.filter((l) => l.status === 'aprovados').length;
    const vendidos = leads.filter((l) => l.status === 'vendidos').length;
    const reprovados = leads.filter((l) => l.status === 'reprovados').length;
    const descartados = leads.filter((l) => l.status === 'descartados').length;
    const naoAtenderam = leads.filter((l) => l.status === 'nao_atenderam').length;

    const vgvTotal = leads
      .filter((l) => l.status === 'vendidos')
      .reduce((acc, curr) => acc + (curr.vgv || curr.valorAprovado || 0), 0);

    return {
      total,
      atendimentos,
      emAnalise,
      aprovados,
      vendidos,
      reprovados,
      descartados,
      naoAtenderam,
      vgvTotal,
    };
  }, [leads]);

  // Filtragem dos leads
  const leadsFiltrados = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return leads.filter((lead) => {
      // 1. Pesquisa textual
      if (searchTerm.trim()) {
        const termo = searchTerm.toLowerCase().trim();
        const nomeMatch = lead.nome?.toLowerCase().includes(termo);
        const telMatch = lead.telefone?.toLowerCase().includes(termo);
        const wppMatch = lead.whatsapp?.toLowerCase().includes(termo);
        const empMatch = (lead.empreendimento || lead.interesse)?.toLowerCase().includes(termo);
        const canalMatch = lead.canalOrigem?.toLowerCase().includes(termo);
        const cidadeMatch = lead.cidade?.toLowerCase().includes(termo);

        if (!nomeMatch && !telMatch && !wppMatch && !empMatch && !canalMatch && !cidadeMatch) {
          return false;
        }
      }

      // 2. Filtro de Status oficial
      if (statusFilter !== 'todos' && lead.status !== statusFilter) {
        return false;
      }

      // 3. Filtro de Empreendimento
      if (empreendimentoFilter !== 'todos') {
        const emp = (lead.empreendimento || lead.interesse || '').trim();
        if (emp !== empreendimentoFilter) {
          return false;
        }
      }

      // 4. Filtro de Período
      if (periodoFilter !== 'todos') {
        const cadDate = new Date(lead.dataCadastro || lead.dataCriacao);
        const leadDateStr = cadDate.toISOString().split('T')[0];

        if (periodoFilter === 'hoje') {
          if (leadDateStr !== todayStr) return false;
        } else if (periodoFilter === 'semana') {
          const diffDays = (now.getTime() - cadDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > 7) return false;
        } else if (periodoFilter === 'mes') {
          if (
            cadDate.getMonth() !== now.getMonth() ||
            cadDate.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [leads, searchTerm, statusFilter, empreendimentoFilter, periodoFilter]);

  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'todos' ||
    empreendimentoFilter !== 'todos' ||
    periodoFilter !== 'todos';

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setEmpreendimentoFilter('todos');
    setPeriodoFilter('todos');
  };

  // Abrir modal para novo lead
  const handleOpenCreateModal = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setEditingLead(null);
    setFormNome('');
    setFormTelefone('');
    setFormWhatsapp('');
    setFormCanalOrigem('whatsapp');
    setFormEmpreendimento('');
    setFormRenda('');
    setFormCidade('');
    setFormStatus('atendimentos');
    setFormDataCadastro(todayStr);
    setFormDataUltimoContato(todayStr);
    setFormProximoContato('');
    setFormObservacoes('');
    setFormDataAnalise('');
    setFormDataAprovacao('');
    setFormDataReprovacao('');
    setFormDataVenda('');
    setFormValorAprovado('');
    setFormVGV('');
    setFormMotivoDescarte('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Abrir modal para edição
  const handleOpenEditModal = (lead: CommercialLeadItem) => {
    setEditingLead(lead);
    setFormNome(lead.nome || '');
    setFormTelefone(lead.telefone || '');
    setFormWhatsapp(lead.whatsapp || '');
    setFormCanalOrigem(lead.canalOrigem || 'whatsapp');
    setFormEmpreendimento(lead.empreendimento || lead.interesse || '');
    setFormRenda(lead.renda !== undefined ? String(lead.renda) : '');
    setFormCidade(lead.cidade || '');
    setFormStatus(lead.status || 'atendimentos');
    setFormDataCadastro(lead.dataCadastro ? lead.dataCadastro.split('T')[0] : '');
    setFormDataUltimoContato(lead.dataUltimoContato ? lead.dataUltimoContato.split('T')[0] : '');
    setFormProximoContato(lead.proximoContato ? lead.proximoContato.split('T')[0] : '');
    setFormObservacoes(lead.observacoes || '');
    setFormDataAnalise(lead.dataAnalise ? lead.dataAnalise.split('T')[0] : '');
    setFormDataAprovacao(lead.dataAprovacao ? lead.dataAprovacao.split('T')[0] : '');
    setFormDataReprovacao(lead.dataReprovacao ? lead.dataReprovacao.split('T')[0] : '');
    setFormDataVenda(lead.dataVenda ? lead.dataVenda.split('T')[0] : '');
    setFormValorAprovado(lead.valorAprovado !== undefined ? String(lead.valorAprovado) : '');
    setFormVGV(lead.vgv !== undefined ? String(lead.vgv) : '');
    setFormMotivoDescarte(lead.motivoDescarteReprovacao || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Salvar lead (novo ou editado)
  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      setFormError('Por favor, informe o nome do lead.');
      return;
    }

    const rendaNum = formRenda ? parseFloat(formRenda.replace(/\D/g, '')) : undefined;
    const valorAprovadoNum = formValorAprovado ? parseFloat(formValorAprovado.replace(/\D/g, '')) : undefined;
    const vgvNum = formVGV ? parseFloat(formVGV.replace(/\D/g, '')) : undefined;

    const payload: Partial<CommercialLeadItem> = {
      nome: formNome.trim(),
      telefone: formTelefone.trim() || undefined,
      whatsapp: formWhatsapp.trim() || formTelefone.trim() || undefined,
      canalOrigem: formCanalOrigem,
      empreendimento: formEmpreendimento.trim() || undefined,
      renda: rendaNum,
      cidade: formCidade.trim() || undefined,
      status: formStatus,
      etapa: formStatus,
      dataCadastro: formDataCadastro || new Date().toISOString(),
      dataUltimoContato: formDataUltimoContato || undefined,
      proximoContato: formProximoContato || undefined,
      observacoes: formObservacoes.trim() || undefined,
      dataAnalise: formStatus === 'em_analise' ? (formDataAnalise || new Date().toISOString()) : formDataAnalise || undefined,
      dataAprovacao: formStatus === 'aprovados' ? (formDataAprovacao || new Date().toISOString()) : formDataAprovacao || undefined,
      dataReprovacao: formStatus === 'reprovados' ? (formDataReprovacao || new Date().toISOString()) : formDataReprovacao || undefined,
      dataVenda: formStatus === 'vendidos' ? (formDataVenda || new Date().toISOString()) : formDataVenda || undefined,
      valorAprovado: valorAprovadoNum,
      vgv: vgvNum,
      motivoDescarteReprovacao: formMotivoDescarte.trim() || undefined,
    };

    if (editingLead) {
      updateLead(editingLead.id, payload);
    } else {
      addLead(payload as any);
    }

    setIsModalOpen(false);
  };

  // Confirmação de exclusão
  const handleConfirmDelete = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete.id);
      setLeadToDelete(null);
    }
  };

  // Iniciar transição rápida de status
  const handleQuickStatusClick = (lead: CommercialLeadItem, newStatus: CommercialLeadStatus) => {
    if (lead.status === newStatus) return;

    if (['aprovados', 'reprovados', 'vendidos', 'descartados'].includes(newStatus)) {
      setStatusChangeModal({ lead, targetStatus: newStatus });
      setQuickValorAprovado(lead.valorAprovado ? String(lead.valorAprovado) : '');
      setQuickVGV(lead.vgv ? String(lead.vgv) : '');
      setQuickMotivo(lead.motivoDescarteReprovacao || '');
      setQuickObservacao('');
    } else {
      // Atendimentos, Não atenderam, Em análise aplicam direto
      updateLeadStatus(lead.id, newStatus);
    }
  };

  const handleConfirmStatusChange = () => {
    if (!statusChangeModal) return;
    const { lead, targetStatus } = statusChangeModal;

    const valorAprovadoNum = quickValorAprovado ? parseFloat(quickValorAprovado.replace(/\D/g, '')) : undefined;
    const vgvNum = quickVGV ? parseFloat(quickVGV.replace(/\D/g, '')) : undefined;

    updateLeadStatus(lead.id, targetStatus, {
      valorAprovado: valorAprovadoNum,
      vgv: vgvNum,
      motivoDescarteReprovacao: quickMotivo.trim() || undefined,
      observacao: quickObservacao.trim() || undefined,
    });

    setStatusChangeModal(null);
  };

  // Histórico
  const historyEvents = useMemo(() => {
    if (!historyModalLead) return [];
    return getLeadHistoryEvents(historyModalLead.id);
  }, [historyModalLead, getLeadHistoryEvents, leads]);

  const handleAddManualHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!historyModalLead || !novaObservacaoHistorico.trim()) return;

    addLeadHistoryEvent({
      leadId: historyModalLead.id,
      type: 'observacao_adicionada',
      novoStatus: historyModalLead.status,
      observacao: novaObservacaoHistorico.trim(),
    });

    setNovaObservacaoHistorico('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header do Módulo & Quick Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <SectionHeader
            title="Controle Comercial de Leads"
            subtitle="Registro ágil de leads, acompanhamento de análises de crédito, aprovações e vendas."
            icon={Users}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            id="btn-cadastrar-lead"
            onClick={handleOpenCreateModal}
            variant="primary"
            size="md"
            icon={Plus}
          >
            Cadastrar Lead
          </Button>
        </div>
      </div>

      {/* 2. Barra de Indicadores Oficiais em Pílulas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <button
          onClick={() => setStatusFilter('todos')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'todos'
              ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              : 'bg-[#091329] border-blue-900/40 text-slate-400 hover:border-blue-700/60'
          }`}
        >
          <div className="text-[10px] font-medium uppercase tracking-wider">Total</div>
          <div className="text-lg font-black font-mono text-white mt-0.5">{counters.total}</div>
        </button>

        {COMMERCIAL_STAGES.map((stg) => {
          const count =
            stg.id === 'atendimentos'
              ? counters.atendimentos
              : stg.id === 'em_analise'
              ? counters.emAnalise
              : stg.id === 'aprovados'
              ? counters.aprovados
              : stg.id === 'vendidos'
              ? counters.vendidos
              : stg.id === 'reprovados'
              ? counters.reprovados
              : stg.id === 'nao_atenderam'
              ? counters.naoAtenderam
              : counters.descartados;

          const isSelected = statusFilter === stg.id;

          return (
            <button
              key={stg.id}
              onClick={() => setStatusFilter(isSelected ? 'todos' : stg.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-[#091329] border-blue-900/40 hover:border-blue-700/60'
              }`}
            >
              <div className="text-[10px] font-medium truncate" style={{ color: stg.cor }}>
                {stg.label}
              </div>
              <div className="text-lg font-black font-mono text-white mt-0.5">{count}</div>
            </button>
          );
        })}
      </div>

      {/* 3. Painel de Filtros e Busca */}
      <Panel variant="default" className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-busca-leads"
              type="text"
              placeholder="Buscar por nome, telefone, cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros em Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Filtro de Status */}
            <div className="flex items-center gap-1.5 bg-[#070E24] border border-blue-900/50 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <select
                id="select-filtro-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="todos" className="bg-[#091329] text-white">Todos os Status</option>
                {COMMERCIAL_STAGES.map((stg) => (
                  <option key={stg.id} value={stg.id} className="bg-[#091329] text-white">
                    {stg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Empreendimento */}
            {listaEmpreendimentos.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#070E24] border border-blue-900/50 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <select
                  id="select-filtro-empreendimento"
                  value={empreendimentoFilter}
                  onChange={(e) => setEmpreendimentoFilter(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer max-w-[140px]"
                >
                  <option value="todos" className="bg-[#091329] text-white">Todos Empreendimentos</option>
                  {listaEmpreendimentos.map((emp) => (
                    <option key={emp} value={emp} className="bg-[#091329] text-white truncate">
                      {emp}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filtro de Período */}
            <div className="flex items-center gap-1.5 bg-[#070E24] border border-blue-900/50 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <select
                id="select-filtro-periodo"
                value={periodoFilter}
                onChange={(e) => setPeriodoFilter(e.target.value as any)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="todos" className="bg-[#091329] text-white">Qualquer Data</option>
                <option value="hoje" className="bg-[#091329] text-white">Cadastrados Hoje</option>
                <option value="semana" className="bg-[#091329] text-white">Esta Semana</option>
                <option value="mes" className="bg-[#091329] text-white">Este Mês</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                id="btn-limpar-filtros"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900 text-xs text-cyan-300 transition-colors cursor-pointer border border-blue-800/40"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>
      </Panel>

      {/* 4. Lista e Tabela de Leads */}
      {leads.length === 0 ? (
        <Panel variant="default" className="p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">Nenhum lead cadastrado ainda</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cadastre seus leads para registrar resultados, acompanhar quantos viram análise, aprovações, vendas e VGV.
            </p>
          </div>
          <Button
            id="btn-adicionar-primeiro-lead"
            onClick={handleOpenCreateModal}
            variant="primary"
            size="md"
            icon={Plus}
          >
            Cadastrar Primeiro Lead
          </Button>
        </Panel>
      ) : leadsFiltrados.length === 0 ? (
        <Panel variant="default" className="p-10 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhum lead encontrado com os filtros selecionados</h3>
          <p className="text-xs text-slate-400">Ajuste os termos de busca ou redefina os filtros.</p>
          <Button onClick={handleResetFilters} variant="secondary" size="sm">
            Limpar Filtros
          </Button>
        </Panel>
      ) : (
        <Panel variant="default" className="overflow-hidden">
          {/* Tabela para Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#070E24] border-b border-blue-900/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Lead</th>
                  <th className="py-3.5 px-4">Contatos</th>
                  <th className="py-3.5 px-4">Empreendimento</th>
                  <th className="py-3.5 px-4">Origem / Renda</th>
                  <th className="py-3.5 px-4">Situação Oficial</th>
                  <th className="py-3.5 px-4">Resultado Comercial</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-950/60">
                {leadsFiltrados.map((lead) => {
                  const stageConfig =
                    COMMERCIAL_STAGES.find((s) => s.id === lead.status) || COMMERCIAL_STAGES[0];

                  return (
                    <tr key={lead.id} className="hover:bg-[#0E1A38]/50 transition-colors">
                      {/* Nome e Cidade */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm">{lead.nome}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-light">
                          {lead.cidade && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-cyan-400" />
                              {lead.cidade}
                            </span>
                          )}
                          <span className="text-slate-500">
                            Cad: {new Date(lead.dataCadastro || lead.dataCriacao).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </td>

                      {/* Contatos */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {lead.whatsapp && (
                            <a
                              href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono font-medium hover:underline"
                              title="Abrir WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{lead.whatsapp}</span>
                            </a>
                          )}
                          {lead.telefone && (!lead.whatsapp || lead.whatsapp !== lead.telefone) && (
                            <a
                              href={`tel:${lead.telefone.replace(/\D/g, '')}`}
                              className="flex items-center gap-1.5 text-slate-400 hover:text-white font-mono"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span>{lead.telefone}</span>
                            </a>
                          )}
                          {!lead.telefone && !lead.whatsapp && (
                            <span className="text-slate-500 italic">Sem telefone</span>
                          )}
                        </div>
                      </td>

                      {/* Empreendimento */}
                      <td className="py-3.5 px-4">
                        {lead.empreendimento || lead.interesse ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-200">
                            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate max-w-[150px]" title={lead.empreendimento || lead.interesse}>
                              {lead.empreendimento || lead.interesse}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Geral / Não inf.</span>
                        )}
                      </td>

                      {/* Origem e Renda */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-[#0B1530] border border-blue-900/40 text-[11px] font-medium text-slate-300 capitalize">
                            {lead.canalOrigem || 'Outro'}
                          </span>
                          {lead.renda ? (
                            <div className="text-[11px] text-slate-400 font-mono">
                              R$ {typeof lead.renda === 'number' ? lead.renda.toLocaleString('pt-BR') : lead.renda}
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Situação Oficial (Com Dropdown Rápido) */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block">
                          <select
                            id={`select-status-${lead.id}`}
                            value={lead.status}
                            onChange={(e) => handleQuickStatusClick(lead, e.target.value as CommercialLeadStatus)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-all"
                            style={{
                              backgroundColor: `${stageConfig.cor}20`,
                              color: stageConfig.cor,
                              borderColor: `${stageConfig.cor}60`,
                            }}
                          >
                            {COMMERCIAL_STAGES.map((s) => (
                              <option key={s.id} value={s.id} className="bg-[#091329] text-white">
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Detalhes de Resultado Comercial */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          {lead.status === 'vendidos' && (
                            <div className="text-emerald-300 font-mono font-bold">
                              VGV: R$ {(lead.vgv || lead.valorAprovado || 0).toLocaleString('pt-BR')}
                              {lead.dataVenda && (
                                <div className="text-[10px] text-slate-400 font-normal">
                                  Vendido em: {new Date(lead.dataVenda).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          )}

                          {lead.status === 'aprovados' && (
                            <div className="text-emerald-400 font-mono">
                              Aprovado: {lead.valorAprovado ? `R$ ${lead.valorAprovado.toLocaleString('pt-BR')}` : 'Sim'}
                              {lead.dataAprovacao && (
                                <div className="text-[10px] text-slate-400 font-normal">
                                  Em: {new Date(lead.dataAprovacao).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          )}

                          {lead.status === 'em_analise' && (
                            <div className="text-amber-400">
                              Em análise
                              {lead.dataAnalise && (
                                <span className="text-[10px] text-slate-400 ml-1">
                                  desde {new Date(lead.dataAnalise).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          )}

                          {lead.status === 'reprovados' && (
                            <div className="text-rose-400">
                              Reprovado
                              {lead.motivoDescarteReprovacao && (
                                <span className="text-[10px] text-slate-400 block truncate max-w-[140px]" title={lead.motivoDescarteReprovacao}>
                                  {lead.motivoDescarteReprovacao}
                                </span>
                              )}
                            </div>
                          )}

                          {lead.status === 'descartados' && (
                            <div className="text-slate-400 italic">
                              {lead.motivoDescarteReprovacao || 'Sem motivo registrado'}
                            </div>
                          )}

                          {lead.status === 'nao_atenderam' && (
                            <div className="text-indigo-400">
                              Sem atendimento
                              {lead.proximoContato && (
                                <div className="text-[10px] text-slate-400">
                                  Prox: {new Date(lead.proximoContato).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          )}

                          {lead.status === 'atendimentos' && (
                            <div className="text-blue-300">
                              Em atendimento
                              {lead.proximoContato && (
                                <div className="text-[10px] text-slate-400">
                                  Prox: {new Date(lead.proximoContato).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-historico-${lead.id}`}
                            onClick={() => setHistoryModalLead(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors"
                            title="Ver Histórico de Eventos"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-editar-${lead.id}`}
                            onClick={() => handleOpenEditModal(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-900/50 transition-colors"
                            title="Editar Lead"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-excluir-${lead.id}`}
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                            title="Excluir Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards para Mobile */}
          <div className="block lg:hidden divide-y divide-blue-950/60">
            {leadsFiltrados.map((lead) => {
              const stageConfig =
                COMMERCIAL_STAGES.find((s) => s.id === lead.status) || COMMERCIAL_STAGES[0];

              return (
                <div key={lead.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-sm">{lead.nome}</div>
                      {lead.cidade && (
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{lead.cidade}</span>
                        </div>
                      )}
                    </div>
                    <select
                      value={lead.status}
                      onChange={(e) => handleQuickStatusClick(lead, e.target.value as CommercialLeadStatus)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none"
                      style={{
                        backgroundColor: `${stageConfig.cor}20`,
                        color: stageConfig.cor,
                        borderColor: `${stageConfig.cor}60`,
                      }}
                    >
                      {COMMERCIAL_STAGES.map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#091329] text-white">
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Empreendimento</span>
                      <span className="font-medium">{lead.empreendimento || 'Geral'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">WhatsApp</span>
                      {lead.whatsapp ? (
                        <a
                          href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 font-mono hover:underline inline-flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {lead.whatsapp}
                        </a>
                      ) : (
                        <span className="text-slate-500 italic">Não informado</span>
                      )}
                    </div>
                  </div>

                  {/* Resultado Comercial no Mobile */}
                  {lead.status === 'vendidos' && (
                    <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300 font-mono">
                      VGV: R$ {(lead.vgv || lead.valorAprovado || 0).toLocaleString('pt-BR')}
                    </div>
                  )}

                  {lead.status === 'aprovados' && (
                    <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
                      Valor Aprovado: R$ {(lead.valorAprovado || 0).toLocaleString('pt-BR')}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-blue-950">
                    <span className="text-[10px] text-slate-500">
                      Cadastrado em {new Date(lead.dataCadastro || lead.dataCriacao).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHistoryModalLead(lead)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300"
                        title="Histórico"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(lead)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setLeadToDelete(lead)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL DE CADASTRO RÁPIDO E EDIÇÃO DE LEAD                              */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#091329] border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between p-5 border-b border-blue-900/40 bg-[#070E24]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingLead ? 'Editar Lead' : 'Cadastrar Novo Lead'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Controle de leads e acompanhamento de resultados comerciais.
                  </p>
                </div>
              </div>
              <button
                id="btn-fechar-modal-lead"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-950/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSaveLead} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Seção 1: Dados Principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nome Completo <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="form-lead-nome"
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo Silveira"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp</label>
                  <input
                    id="form-lead-whatsapp"
                    type="text"
                    placeholder="Ex: (11) 98765-4321"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                {/* Telefone Fixo ou Alternativo */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Telefone Alternativo</label>
                  <input
                    id="form-lead-telefone"
                    type="text"
                    placeholder="Ex: (11) 3333-4444"
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                {/* Empreendimento */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Empreendimento de Interesse</label>
                  <input
                    id="form-lead-empreendimento"
                    type="text"
                    placeholder="Ex: Reserva Imperial, Sky Tower"
                    value={formEmpreendimento}
                    onChange={(e) => setFormEmpreendimento(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Origem */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Origem do Lead</label>
                  <select
                    id="form-lead-origem"
                    value={formCanalOrigem}
                    onChange={(e) => setFormCanalOrigem(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    {CANAL_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Renda */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Renda Mensal (R$)</label>
                  <input
                    id="form-lead-renda"
                    type="text"
                    placeholder="Ex: 15.000"
                    value={formRenda}
                    onChange={(e) => setFormRenda(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                {/* Cidade */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Cidade / UF</label>
                  <input
                    id="form-lead-cidade"
                    type="text"
                    placeholder="Ex: São Paulo / SP"
                    value={formCidade}
                    onChange={(e) => setFormCidade(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Situação Oficial (Status) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Situação Oficial <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {COMMERCIAL_STAGES.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setFormStatus(s.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          formStatus === s.id
                            ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                            : 'border-blue-900/40 bg-[#070E24] text-slate-400 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Datas de Contato */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Data de Cadastro</label>
                  <input
                    id="form-lead-datacadastro"
                    type="date"
                    value={formDataCadastro}
                    onChange={(e) => setFormDataCadastro(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Próximo Contato</label>
                  <input
                    id="form-lead-proximocontato"
                    type="date"
                    value={formProximoContato}
                    onChange={(e) => setFormProximoContato(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Seção 2: Campos Condicionais de Resultado Comercial */}
              {formStatus === 'em_analise' && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <FileCheck className="w-4 h-4" />
                    <span>Resultado Comercial: Em Análise</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-amber-200 mb-1">
                      Data em que entrou em análise
                    </label>
                    <input
                      type="date"
                      value={formDataAnalise}
                      onChange={(e) => setFormDataAnalise(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#070E24] border border-amber-500/50 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {formStatus === 'aprovados' && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Resultado Comercial: Crédito Aprovado</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-emerald-200 mb-1">
                        Data da Aprovação
                      </label>
                      <input
                        type="date"
                        value={formDataAprovacao}
                        onChange={(e) => setFormDataAprovacao(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070E24] border border-emerald-500/50 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-emerald-200 mb-1">
                        Valor Aprovado (R$)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 450.000"
                        value={formValorAprovado}
                        onChange={(e) => setFormValorAprovado(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070E24] border border-emerald-500/50 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formStatus === 'reprovados' && (
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <XCircle className="w-4 h-4" />
                    <span>Resultado Comercial: Reprovação</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-rose-200 mb-1">
                        Data da Reprovação
                      </label>
                      <input
                        type="date"
                        value={formDataReprovacao}
                        onChange={(e) => setFormDataReprovacao(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070E24] border border-rose-500/50 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-rose-200 mb-1">
                        Motivo da Reprovação
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Restrição cadastral, margem insuficiente"
                        value={formMotivoDescarte}
                        onChange={(e) => setFormMotivoDescarte(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070E24] border border-rose-500/50 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formStatus === 'descartados' && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
                  <label className="block text-[11px] font-medium text-slate-300">
                    Motivo do Descarte
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sem interesse na região, comprou com outra imobiliária"
                    value={formMotivoDescarte}
                    onChange={(e) => setFormMotivoDescarte(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070E24] border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
              )}

              {formStatus === 'vendidos' && (
                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <TrendingUp className="w-4 h-4" />
                    <span>Resultado Comercial: Venda Concretizada</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-cyan-200 mb-1">
                        Data da Venda
                      </label>
                      <input
                        type="date"
                        value={formDataVenda}
                        onChange={(e) => setFormDataVenda(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070E24] border border-cyan-500/50 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-cyan-200 mb-1">
                        VGV - Valor Geral de Venda (R$)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 650.000"
                        value={formVGV}
                        onChange={(e) => setFormVGV(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070E24] border border-cyan-500/50 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Observações</label>
                <textarea
                  id="form-lead-observacoes"
                  rows={2}
                  placeholder="Informações adicionais, histórico de conversa..."
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-900/40">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="secondary"
                  size="md"
                >
                  Cancelar
                </Button>
                <Button
                  id="btn-salvar-lead"
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Check}
                >
                  {editingLead ? 'Salvar Alterações' : 'Cadastrar Lead'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL DE TRANSIÇÃO RÁPIDA DE STATUS (Aprovados, Reprovados, Vendidos)   */}
      {/* ========================================================================= */}
      {statusChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#091329] border border-blue-900/60 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
              <h3 className="text-sm font-bold text-white">
                Atualizar Status: {COMMERCIAL_STAGES.find((s) => s.id === statusChangeModal.targetStatus)?.label}
              </h3>
              <button
                onClick={() => setStatusChangeModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Lead: <strong className="text-white">{statusChangeModal.lead.nome}</strong>
            </p>

            {statusChangeModal.targetStatus === 'vendidos' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-cyan-300 mb-1">
                    VGV da Venda (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 500.000"
                    value={quickVGV}
                    onChange={(e) => setQuickVGV(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070E24] border border-cyan-500/50 text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}

            {statusChangeModal.targetStatus === 'aprovados' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">
                    Valor Aprovado (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 400.000"
                    value={quickValorAprovado}
                    onChange={(e) => setQuickValorAprovado(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070E24] border border-emerald-500/50 text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}

            {(statusChangeModal.targetStatus === 'reprovados' ||
              statusChangeModal.targetStatus === 'descartados') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-rose-300 mb-1">
                    Motivo
                  </label>
                  <input
                    type="text"
                    placeholder="Informe o motivo..."
                    value={quickMotivo}
                    onChange={(e) => setQuickMotivo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Observação do Histórico (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Análise finalizada pelo correspondente bancário"
                value={quickObservacao}
                onChange={(e) => setQuickObservacao(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-900/40">
              <Button
                onClick={() => setStatusChangeModal(null)}
                variant="secondary"
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                id="btn-confirmar-mudanca-status"
                onClick={handleConfirmStatusChange}
                variant="primary"
                size="sm"
              >
                Confirmar Situação
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL DE HISTÓRICO DE EVENTOS DO LEAD                                  */}
      {/* ========================================================================= */}
      {historyModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#091329] border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-blue-900/40 bg-[#070E24]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Histórico de Eventos</h3>
                  <p className="text-[11px] text-slate-400">{historyModalLead.nome}</p>
                </div>
              </div>
              <button
                onClick={() => setHistoryModalLead(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Timeline de eventos */}
              {historyEvents.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  Nenhum evento registrado para este lead ainda.
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-900/50">
                  {historyEvents.map((ev) => (
                    <div key={ev.id} className="relative pl-7 text-xs">
                      {/* Ponto indicador */}
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute left-2 top-1.5 ring-4 ring-[#091329]" />
                      <div className="bg-[#0B1530] border border-blue-900/40 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white capitalize">
                            {ev.type === 'lead_cadastrado'
                              ? 'Lead Cadastrado'
                              : ev.type === 'entrou_analise'
                              ? 'Entrou em Análise'
                              : ev.type === 'aprovado'
                              ? 'Crédito Aprovado'
                              : ev.type === 'reprovado'
                              ? 'Crédito Reprovado'
                              : ev.type === 'vendido'
                              ? 'Venda Concretizada'
                              : ev.type === 'descartado'
                              ? 'Lead Descartado'
                              : ev.type === 'status_alterado'
                              ? 'Status Alterado'
                              : 'Anotação'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(ev.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        {ev.observacao && (
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {ev.observacao}
                          </p>
                        )}

                        {ev.valor !== undefined && (
                          <div className="text-emerald-400 font-mono font-bold text-[11px]">
                            Valor: R$ {ev.valor.toLocaleString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar Anotação Manual */}
              <form onSubmit={handleAddManualHistory} className="pt-3 border-t border-blue-900/40 flex gap-2">
                <input
                  type="text"
                  placeholder="Adicionar anotação rápida ao histórico..."
                  value={novaObservacaoHistorico}
                  onChange={(e) => setNovaObservacaoHistorico(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#070E24] border border-blue-900/50 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Adicionar
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL DE CONFIRMAÇÃO DE EXCLUSÃO                                       */}
      {/* ========================================================================= */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#091329] border border-rose-900/60 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-sm font-bold text-white">Excluir Lead</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja excluir o lead <strong className="text-white">{leadToDelete.nome}</strong>?
              Esta ação removerá o lead e todo o seu histórico comercial.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-900/40">
              <Button onClick={() => setLeadToDelete(null)} variant="secondary" size="sm">
                Cancelar
              </Button>
              <Button
                id="btn-confirmar-exclusao"
                onClick={handleConfirmDelete}
                variant="danger"
                size="sm"
                icon={Trash2}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
