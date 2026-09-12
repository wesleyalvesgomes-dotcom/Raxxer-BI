// React Hook para gerenciar e escutar o estado dos dados comerciais
import { useState, useEffect, useCallback } from 'react';
import {
  CommercialDataSnapshot,
  CommercialFunnelStage,
  CommercialGoalItem,
  CommercialInteractionItem,
  CommercialLeadItem,
  CommercialProposalItem,
  CommercialSaleItem,
  CommercialVisitItem,
  ProposalStatus,
  SaleStatus,
  VisitStatus,
} from '../types/commercial';
import {
  COMMERCIAL_UPDATE_EVENT,
  getCommercialDataSnapshot,
  addStoredLead,
  updateStoredLead,
  updateStoredLeadStage,
  deleteStoredLead,
  addStoredInteraction,
  addStoredVisit,
  updateStoredVisitStatus,
  addStoredProposal,
  updateStoredProposalStatus,
  addStoredSale,
  updateStoredSaleStatus,
  addStoredCommercialGoal,
  updateStoredCommercialGoal,
  clearCommercialStorage,
} from '../services/commercialStorage';

export function useCommercialData() {
  const [snapshot, setSnapshot] = useState<CommercialDataSnapshot>(() =>
    getCommercialDataSnapshot()
  );

  const refresh = useCallback(() => {
    setSnapshot(getCommercialDataSnapshot());
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener(COMMERCIAL_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(COMMERCIAL_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  return {
    // Dados reativos
    leads: snapshot.leads,
    interactions: snapshot.interactions,
    visits: snapshot.visits,
    proposals: snapshot.proposals,
    sales: snapshot.sales,
    goals: snapshot.goals,
    snapshot,
    refresh,

    // Métodos Leads
    addLead: useCallback(
      (lead: Omit<CommercialLeadItem, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => {
        const item = addStoredLead(lead);
        refresh();
        return item;
      },
      [refresh]
    ),
    updateLead: useCallback(
      (id: string, updates: Partial<Omit<CommercialLeadItem, 'id' | 'dataCriacao'>>) => {
        const item = updateStoredLead(id, updates);
        refresh();
        return item;
      },
      [refresh]
    ),
    updateLeadStage: useCallback(
      (id: string, etapa: CommercialFunnelStage, motivoPerda?: string) => {
        const item = updateStoredLeadStage(id, etapa, motivoPerda);
        refresh();
        return item;
      },
      [refresh]
    ),
    deleteLead: useCallback(
      (id: string) => {
        const ok = deleteStoredLead(id);
        refresh();
        return ok;
      },
      [refresh]
    ),

    // Métodos Interações
    addInteraction: useCallback(
      (interaction: Omit<CommercialInteractionItem, 'id' | 'dataCriacao'>) => {
        const item = addStoredInteraction(interaction);
        refresh();
        return item;
      },
      [refresh]
    ),

    // Métodos Visitas
    addVisit: useCallback(
      (visit: Omit<CommercialVisitItem, 'id' | 'dataCriacao'>) => {
        const item = addStoredVisit(visit);
        refresh();
        return item;
      },
      [refresh]
    ),
    updateVisitStatus: useCallback(
      (id: string, status: VisitStatus, details?: { feedback?: string; motivoCancelamento?: string }) => {
        const item = updateStoredVisitStatus(id, status, details);
        refresh();
        return item;
      },
      [refresh]
    ),

    // Métodos Propostas
    addProposal: useCallback(
      (proposal: Omit<CommercialProposalItem, 'id' | 'dataCriacao'>) => {
        const item = addStoredProposal(proposal);
        refresh();
        return item;
      },
      [refresh]
    ),
    updateProposalStatus: useCallback(
      (id: string, status: ProposalStatus, dataResposta?: string) => {
        const item = updateStoredProposalStatus(id, status, dataResposta);
        refresh();
        return item;
      },
      [refresh]
    ),

    // Métodos Vendas
    addSale: useCallback(
      (sale: Omit<CommercialSaleItem, 'id' | 'dataCriacao'>) => {
        const item = addStoredSale(sale);
        refresh();
        return item;
      },
      [refresh]
    ),
    updateSaleStatus: useCallback(
      (id: string, status: SaleStatus) => {
        const item = updateStoredSaleStatus(id, status);
        refresh();
        return item;
      },
      [refresh]
    ),

    // Métodos Metas
    addCommercialGoal: useCallback(
      (goal: Omit<CommercialGoalItem, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => {
        const item = addStoredCommercialGoal(goal);
        refresh();
        return item;
      },
      [refresh]
    ),
    updateCommercialGoal: useCallback(
      (id: string, updates: Partial<Omit<CommercialGoalItem, 'id' | 'dataCriacao'>>) => {
        const item = updateStoredCommercialGoal(id, updates);
        refresh();
        return item;
      },
      [refresh]
    ),

    // Limpeza
    clearAllCommercialData: useCallback(() => {
      clearCommercialStorage();
      refresh();
    }, [refresh]),
  };
}
