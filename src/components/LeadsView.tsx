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
  Flame,
  Trash2,
  Edit3,
  AlertTriangle,
  Clock,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  CommercialLeadItem,
  CommercialFunnelStage,
  LeadTemperature,
  LeadStatus,
  LeadChannel,
  COMMERCIAL_FUNNEL_STAGES,
} from '../types/commercial';
import { useCommercialData } from '../hooks/useCommercialData';
import { Panel, SectionHeader, StatusBadge, Button } from './common/DesignSystem';

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

const TEMPERATURA_CONFIG: Record<LeadTemperature, { label: string; badgeClass: string; iconClass: string }> = {
  quente: {
    label: 'Quente',
    badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-500/40',
    iconClass: 'text-rose-400 fill-rose-400',
  },
  morno: {
    label: 'Morno',
    badgeClass: 'bg-[#362512] text-amber-300 border-amber-500/40',
    iconClass: 'text-amber-400',
  },
  frio: {
    label: 'Frio',
    badgeClass: 'bg-[#083344] text-cyan-300 border-cyan-500/40',
    iconClass: 'text-cyan-400',
  },
};

const STATUS_CONFIG: Record<LeadStatus, { label: string; badgeClass: string }> = {
  ativo: {
    label: 'Ativo',
    badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
  },
  ganho: {
    label: 'Ganho / Venda',
    badgeClass: 'bg-blue-950/70 text-cyan-300 border-blue-500/40',
  },
  perdido: {
    label: 'Perdido',
    badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-500/40',
  },
  pausado: {
    label: 'Pausado',
    badgeClass: 'bg-slate-900 text-slate-300 border-slate-700/50',
  },
};

export const LeadsView: React.FC = () => {
  const { leads, addLead, updateLead, deleteLead } = useCommercialData();

  // Estados de busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('todos');
  const [tempFilter, setTempFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [empreendimentoFilter, setEmpreendimentoFilter] = useState<string>('todos');

  // Modal de formulário (criação e edição)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CommercialLeadItem | null>(null);

  // Modal de confirmação de exclusão
  const [leadToDelete, setLeadToDelete] = useState<CommercialLeadItem | null>(null);

  // Estados dos campos do formulário
  const [formNome, setFormNome] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCanalOrigem, setFormCanalOrigem] = useState<LeadChannel | string>('whatsapp');
  const [formEmpreendimento, setFormEmpreendimento] = useState('');
  const [formRenda, setFormRenda] = useState('');
  const [formCidade, setFormCidade] = useState('');
  const [formEtapa, setFormEtapa] = useState<CommercialFunnelStage>('novo_lead');
  const [formTemperatura, setFormTemperatura] = useState<LeadTemperature>('morno');
  const [formStatus, setFormStatus] = useState<LeadStatus>('ativo');
  const [formValorEstimado, setFormValorEstimado] = useState('');
  const [formProximoContato, setFormProximoContato] = useState('');
  const [formObservacoes, setFormObservacoes] = useState('');
  const [formError, setFormError] = useState('');

  // Lista única de empreendimentos para o filtro
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

  // Aplicação da pesquisa e filtros
  const leadsFiltrados = useMemo(() => {
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

      // 2. Filtro de Etapa
      if (stageFilter !== 'todos' && lead.etapa !== stageFilter) {
        return false;
      }

      // 3. Filtro de Temperatura
      if (tempFilter !== 'todos' && lead.temperatura !== tempFilter) {
        return false;
      }

      // 4. Filtro de Status
      if (statusFilter !== 'todos' && lead.status !== statusFilter) {
        return false;
      }

      // 5. Filtro de Empreendimento
      if (empreendimentoFilter !== 'todos') {
        const emp = (lead.empreendimento || lead.interesse || '').trim();
        if (emp !== empreendimentoFilter) {
          return false;
        }
      }

      return true;
    });
  }, [leads, searchTerm, stageFilter, tempFilter, statusFilter, empreendimentoFilter]);

  const hasActiveFilters =
    searchTerm !== '' ||
    stageFilter !== 'todos' ||
    tempFilter !== 'todos' ||
    statusFilter !== 'todos' ||
    empreendimentoFilter !== 'todos';

  const handleResetFilters = () => {
    setSearchTerm('');
    setStageFilter('todos');
    setTempFilter('todos');
    setStatusFilter('todos');
    setEmpreendimentoFilter('todos');
  };

  // Abrir modal para novo lead
  const handleOpenCreateModal = () => {
    setEditingLead(null);
    setFormNome('');
    setFormTelefone('');
    setFormWhatsapp('');
    setFormEmail('');
    setFormCanalOrigem('whatsapp');
    setFormEmpreendimento('');
    setFormRenda('');
    setFormCidade('');
    setFormEtapa('novo_lead');
    setFormTemperatura('morno');
    setFormStatus('ativo');
    setFormValorEstimado('');
    setFormProximoContato('');
    setFormObservacoes('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Abrir modal de edição
  const handleOpenEditModal = (lead: CommercialLeadItem) => {
    setEditingLead(lead);
    setFormNome(lead.nome || '');
    setFormTelefone(lead.telefone || '');
    setFormWhatsapp(lead.whatsapp || '');
    setFormEmail(lead.email || '');
    setFormCanalOrigem(lead.canalOrigem || 'whatsapp');
    setFormEmpreendimento(lead.empreendimento || lead.interesse || '');
    setFormRenda(lead.renda !== undefined ? String(lead.renda) : '');
    setFormCidade(lead.cidade || '');
    setFormEtapa(lead.etapa || 'novo_lead');
    setFormTemperatura(lead.temperatura || 'morno');
    setFormStatus(lead.status || 'ativo');
    setFormValorEstimado(lead.valorEstimado !== undefined ? String(lead.valorEstimado) : '');
    setFormProximoContato(lead.proximoContato ? lead.proximoContato.split('T')[0] : '');
    setFormObservacoes(lead.observacoes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Salvar cadastro ou edição
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedNome = formNome.trim();
    const trimmedTel = formTelefone.trim();
    const trimmedWpp = formWhatsapp.trim();

    if (!trimmedNome) {
      setFormError('O nome do lead é obrigatório.');
      return;
    }

    if (!trimmedTel && !trimmedWpp) {
      setFormError('Informe pelo menos um número de contato (Telefone ou WhatsApp).');
      return;
    }

    const payload = {
      nome: trimmedNome,
      telefone: trimmedTel || undefined,
      whatsapp: trimmedWpp || undefined,
      email: formEmail.trim() || undefined,
      canalOrigem: formCanalOrigem || 'whatsapp',
      empreendimento: formEmpreendimento.trim() || undefined,
      interesse: formEmpreendimento.trim() || undefined,
      renda: formRenda.trim() || undefined,
      cidade: formCidade.trim() || undefined,
      etapa: formEtapa || 'novo_lead',
      temperatura: formTemperatura || 'morno',
      status: formStatus || 'ativo',
      valorEstimado: formValorEstimado.trim() ? Number(formValorEstimado.replace(/[^0-9.-]+/g, '')) : undefined,
      proximoContato: formProximoContato.trim() || undefined,
      observacoes: formObservacoes.trim() || undefined,
    };

    if (editingLead) {
      updateLead(editingLead.id, payload);
    } else {
      addLead(payload);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete.id);
      setLeadToDelete(null);
    }
  };

  const formatDataAmigavel = (isoString?: string) => {
    if (!isoString) return 'Não registrado';
    try {
      const dataObj = new Date(isoString);
      if (isNaN(dataObj.getTime())) return isoString;
      return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div id="raxxer-leads-view" className="space-y-6 pb-12 font-sans text-slate-100">
      {/* Cabeçalho da Tela */}
      <div className="relative rounded-2xl overflow-hidden border border-blue-900/40 bg-gradient-to-r from-[#091530] via-[#0D1C44] to-[#112356] p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Leads Comerciais</h2>
            <p className="text-xs text-slate-300 font-light">
              Gestão e acompanhamento de contatos, interesse e oportunidades no funil de vendas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 font-medium">Total de contatos</span>
            <p className="text-sm font-bold font-mono text-cyan-300">{leads.length} leads</p>
          </div>

          <Button
            id="btn-novo-lead"
            onClick={handleOpenCreateModal}
            variant="primary"
            size="md"
            icon={Plus}
          >
            Cadastrar Lead
          </Button>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <Panel variant="default" className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Campo de Pesquisa Geral */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-pesquisa-lead"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone, empreendimento..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro: Etapa do Funil */}
          <div className="md:col-span-2">
            <select
              id="select-filtro-etapa"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="todos">Todas as etapas</option>
              {COMMERCIAL_FUNNEL_STAGES.map((stg) => (
                <option key={stg.id} value={stg.id}>
                  {stg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro: Temperatura */}
          <div className="md:col-span-2">
            <select
              id="select-filtro-temperatura"
              value={tempFilter}
              onChange={(e) => setTempFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="todos">Temperaturas</option>
              <option value="quente">Quente</option>
              <option value="morno">Morno</option>
              <option value="frio">Frio</option>
            </select>
          </div>

          {/* Filtro: Status */}
          <div className="md:col-span-2">
            <select
              id="select-filtro-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="ganho">Ganho / Venda</option>
              <option value="perdido">Perdido</option>
              <option value="pausado">Pausado</option>
            </select>
          </div>

          {/* Filtro: Empreendimento */}
          <div className="md:col-span-2">
            <select
              id="select-filtro-empreendimento"
              value={empreendimentoFilter}
              onChange={(e) => setEmpreendimentoFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="todos">Empreendimento</option>
              {listaEmpreendimentos.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumo do filtro e botão de limpar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-blue-900/30 text-xs text-slate-400">
            <span>
              Exibindo <strong>{leadsFiltrados.length}</strong> de <strong>{leads.length}</strong> leads cadastrados.
            </span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          </div>
        )}
      </Panel>

      {/* Tabela Responsiva de Leads */}
      {leads.length === 0 ? (
        <Panel variant="default" className="p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-950/60 border border-blue-800/40 text-cyan-400 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Nenhum lead cadastrado ainda</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Sua base de leads comerciais está vazia. Comece cadastrando os primeiros contatos para acompanhar o
              funil de vendas, visitas e oportunidades.
            </p>
          </div>
          <Button
            onClick={handleOpenCreateModal}
            variant="primary"
            size="md"
            icon={Plus}
          >
            Adicionar Primeiro Lead
          </Button>
        </Panel>
      ) : leadsFiltrados.length === 0 ? (
        <Panel variant="default" className="p-10 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhum lead encontrado com esses filtros</h3>
          <p className="text-xs text-slate-400">Tente ajustar o termo de pesquisa ou redefinir os filtros selecionados.</p>
          <Button
            onClick={handleResetFilters}
            variant="secondary"
            size="sm"
          >
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
                  <th className="py-3.5 px-4">Origem</th>
                  <th className="py-3.5 px-4">Renda</th>
                  <th className="py-3.5 px-4">Etapa do Funil</th>
                  <th className="py-3.5 px-4">Temperatura</th>
                  <th className="py-3.5 px-4">Último Contato</th>
                  <th className="py-3.5 px-4">Próximo Contato</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-950/60">
                {leadsFiltrados.map((lead) => {
                  const stageConfig = COMMERCIAL_FUNNEL_STAGES.find((s) => s.id === lead.etapa) || COMMERCIAL_FUNNEL_STAGES[0];
                  const tempConfig = TEMPERATURA_CONFIG[lead.temperatura || 'morno'];
                  const statusConfig = STATUS_CONFIG[lead.status || 'ativo'];

                  return (
                    <tr key={lead.id} className="hover:bg-[#0E1A38]/50 transition-colors">
                      {/* Nome e Cidade */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{lead.nome}</div>
                        {lead.cidade && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 font-light">
                            <MapPin className="w-3 h-3" />
                            <span>{lead.cidade}</span>
                          </div>
                        )}
                      </td>

                      {/* Telefone e WhatsApp */}
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
                            <span className="truncate max-w-[140px]" title={lead.empreendimento || lead.interesse}>
                              {lead.empreendimento || lead.interesse}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Geral / Não inf.</span>
                        )}
                      </td>

                      {/* Origem */}
                      <td className="py-3.5 px-4 text-slate-300 capitalize">
                        {lead.canalOrigem ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#0B1530] border border-blue-900/40 text-[11px] font-medium text-slate-300">
                            {lead.canalOrigem}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Renda */}
                      <td className="py-3.5 px-4 text-slate-200 font-mono">
                        {lead.renda ? (
                          <span>
                            {typeof lead.renda === 'number'
                              ? `R$ ${lead.renda.toLocaleString('pt-BR')}`
                              : lead.renda.startsWith('R$')
                              ? lead.renda
                              : `R$ ${lead.renda}`}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic font-sans">Não informada</span>
                        )}
                      </td>

                      {/* Etapa do Funil */}
                      <td className="py-3.5 px-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                          style={{
                            backgroundColor: `${stageConfig.cor}25`,
                            color: stageConfig.cor,
                            borderColor: `${stageConfig.cor}50`,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stageConfig.cor }} />
                          {stageConfig.label}
                        </span>
                      </td>

                      {/* Temperatura */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${tempConfig.badgeClass}`}
                        >
                          <Flame className={`w-3 h-3 ${tempConfig.iconClass}`} />
                          {tempConfig.label}
                        </span>
                      </td>

                      {/* Último Contato */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {lead.dataUltimoContato ? (
                          <span>{formatDataAmigavel(lead.dataUltimoContato)}</span>
                        ) : (
                          <span className="text-slate-500 italic font-sans">Sem contato</span>
                        )}
                      </td>

                      {/* Próximo Contato */}
                      <td className="py-3.5 px-4">
                        {lead.proximoContato ? (
                          <div className="flex items-center gap-1 font-semibold text-cyan-300 bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-800/40 inline-flex font-mono">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>{formatDataAmigavel(lead.proximoContato)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Não agendado</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.badgeClass}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-blue-950/80 transition-colors cursor-pointer"
                            title="Editar Lead"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Excluir Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
          <div className="lg:hidden divide-y divide-blue-950/60">
            {leadsFiltrados.map((lead) => {
              const stageConfig = COMMERCIAL_FUNNEL_STAGES.find((s) => s.id === lead.etapa) || COMMERCIAL_FUNNEL_STAGES[0];
              const tempConfig = TEMPERATURA_CONFIG[lead.temperatura || 'morno'];
              const statusConfig = STATUS_CONFIG[lead.status || 'ativo'];

              return (
                <div key={lead.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{lead.nome}</h4>
                      {lead.cidade && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{lead.cidade}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tempConfig.badgeClass}`}>
                        <Flame className={`w-2.5 h-2.5 ${tempConfig.iconClass}`} />
                        {tempConfig.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.badgeClass}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Etapa:</span>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-0.5"
                        style={{
                          backgroundColor: `${stageConfig.cor}25`,
                          color: stageConfig.cor,
                          borderColor: `${stageConfig.cor}50`,
                        }}
                      >
                        {stageConfig.label}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Empreendimento:</span>
                      <span className="font-medium text-slate-200 text-[11px] truncate block">
                        {lead.empreendimento || lead.interesse || 'Geral'}
                      </span>
                    </div>
                  </div>

                  {/* Contatos rápidos */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    {lead.whatsapp && (
                      <a
                        href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 font-mono font-semibold hover:underline"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{lead.whatsapp}</span>
                      </a>
                    )}
                    {lead.telefone && (
                      <a
                        href={`tel:${lead.telefone.replace(/\D/g, '')}`}
                        className="inline-flex items-center gap-1 text-slate-400 font-mono"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{lead.telefone}</span>
                      </a>
                    )}
                  </div>

                  {/* Rodapé Mobile */}
                  <div className="flex items-center justify-between pt-2 border-t border-blue-900/30 text-[11px] text-slate-400">
                    <div>
                      {lead.proximoContato && (
                        <span className="text-cyan-400 font-mono">
                          Próx: {formatDataAmigavel(lead.proximoContato)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEditModal(lead)}
                      >
                        Editar
                      </Button>
                      <button
                        onClick={() => setLeadToDelete(lead)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 cursor-pointer"
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

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            id="modal-lead-form"
            className="bg-[#080E21] border border-blue-900/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto text-slate-100"
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-600/40 text-cyan-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingLead ? 'Editar Lead' : 'Cadastrar Novo Lead'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-light">
                    {editingLead
                      ? 'Atualize as informações cadastrais e de negociação do contato.'
                      : 'Preencha os dados do cliente para ingressar no funil comercial.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Linha 1: Nome Completo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo <span className="text-rose-400">*</span>
                </label>
                <input
                  id="form-lead-nome"
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Linha 2: Telefone e WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp <span className="text-slate-400 text-[10px] font-normal">(ou Telefone)</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="form-lead-whatsapp"
                      type="text"
                      value={formWhatsapp}
                      onChange={(e) => setFormWhatsapp(e.target.value)}
                      placeholder="(11) 99999-8888"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone Fixo / Outro</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="form-lead-telefone"
                      type="text"
                      value={formTelefone}
                      onChange={(e) => setFormTelefone(e.target.value)}
                      placeholder="(11) 3333-2222"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Linha 3: Empreendimento e Canal de Origem */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Empreendimento de Interesse
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="form-lead-empreendimento"
                      type="text"
                      value={formEmpreendimento}
                      onChange={(e) => setFormEmpreendimento(e.target.value)}
                      placeholder="Ex: Reserva Imperial, Jardins..."
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Canal de Origem</label>
                  <select
                    id="form-lead-canal"
                    value={formCanalOrigem}
                    onChange={(e) => setFormCanalOrigem(e.target.value as LeadChannel)}
                    className="w-full px-3 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {CANAL_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Linha 4: Renda Estimada e Cidade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Renda Mensal Estimada
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="form-lead-renda"
                      type="text"
                      value={formRenda}
                      onChange={(e) => setFormRenda(e.target.value)}
                      placeholder="Ex: 8.500,00"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade / Região</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="form-lead-cidade"
                      type="text"
                      value={formCidade}
                      onChange={(e) => setFormCidade(e.target.value)}
                      placeholder="Ex: Campinas / SP"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Linha 5: Etapa do Funil, Temperatura e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Etapa do Funil</label>
                  <select
                    id="form-lead-etapa"
                    value={formEtapa}
                    onChange={(e) => setFormEtapa(e.target.value as CommercialFunnelStage)}
                    className="w-full px-3 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {COMMERCIAL_FUNNEL_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Temperatura</label>
                  <select
                    id="form-lead-temperatura"
                    value={formTemperatura}
                    onChange={(e) => setFormTemperatura(e.target.value as LeadTemperature)}
                    className="w-full px-3 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="quente">Quente (Alta intenção)</option>
                    <option value="morno">Morno (Em avaliação)</option>
                    <option value="frio">Frio (Contato inicial)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    id="form-lead-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="ganho">Ganho / Venda</option>
                    <option value="perdido">Perdido</option>
                    <option value="pausado">Pausado</option>
                  </select>
                </div>
              </div>

              {/* Linha 6: Próximo Contato e Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Próximo Contato Previsto
                  </label>
                  <input
                    id="form-lead-proximo-contato"
                    type="date"
                    value={formProximoContato}
                    onChange={(e) => setFormProximoContato(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-mail <span className="text-slate-500 text-[10px] font-normal">(Opcional)</span>
                  </label>
                  <input
                    id="form-lead-email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Linha 7: Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Observações e Perfil de Compra
                </label>
                <textarea
                  id="form-lead-observacoes"
                  rows={3}
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  placeholder="Ex: Procura apartamento de 3 dormitórios, entrada de R$ 100 mil..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#081126] border border-blue-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Botões do Formulário */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-blue-900/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  id="btn-salvar-lead"
                  variant="primary"
                  size="sm"
                >
                  {editingLead ? 'Salvar Alterações' : 'Cadastrar Lead'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            id="modal-confirm-delete"
            className="bg-[#080E21] border border-rose-900/50 rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-100"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800/50 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Excluir Lead Comercial</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Tem certeza que deseja excluir o lead <strong className="text-white">{leadToDelete.nome}</strong>? Esta ação removerá o contato da sua lista comercial.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-900/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeadToDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                id="btn-confirmar-exclusao"
                onClick={handleConfirmDelete}
              >
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
