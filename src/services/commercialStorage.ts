// Serviço de Persistência Local para o BI Comercial do RAXXER (Fase 2)
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

// Chaves exclusivas e isoladas no localStorage para o BI Comercial
export const COMMERCIAL_STORAGE_KEYS = {
  LEADS: 'raxxer_com_leads',
  INTERACTIONS: 'raxxer_com_interactions',
  VISITS: 'raxxer_com_visits',
  PROPOSALS: 'raxxer_com_proposals',
  SALES: 'raxxer_com_sales',
  GOALS: 'raxxer_com_goals',
} as const;

// Nome do evento para reatividade entre componentes caso necessário
export const COMMERCIAL_UPDATE_EVENT = 'raxxer_commercial_storage_update';

// Helpers seguros de acesso ao localStorage
function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (err) {
    console.error(`[commercialStorage] Erro ao ler chave "${key}":`, err);
    return fallback;
  }
}

function writeToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Notifica listeners no mesmo documento
    window.dispatchEvent(
      new CustomEvent(COMMERCIAL_UPDATE_EVENT, { detail: { key, timestamp: Date.now() } })
    );
  } catch (err) {
    console.error(`[commercialStorage] Erro ao gravar chave "${key}":`, err);
  }
}

// ==========================================
// 1. LEADS
// ==========================================
export function getStoredLeads(): CommercialLeadItem[] {
  return readFromStorage<CommercialLeadItem[]>(COMMERCIAL_STORAGE_KEYS.LEADS, []);
}

export function saveStoredLeads(leads: CommercialLeadItem[]): void {
  writeToStorage(COMMERCIAL_STORAGE_KEYS.LEADS, leads);
}

export function addStoredLead(
  lead: Omit<CommercialLeadItem, 'id' | 'dataCriacao' | 'dataAtualizacao'>
): CommercialLeadItem {
  const current = getStoredLeads();
  const now = new Date().toISOString();
  const newItem: CommercialLeadItem = {
    ...lead,
    id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    dataCriacao: now,
    dataAtualizacao: now,
  };
  saveStoredLeads([newItem, ...current]);
  return newItem;
}

export function updateStoredLead(
  id: string,
  updates: Partial<Omit<CommercialLeadItem, 'id' | 'dataCriacao'>>
): CommercialLeadItem | null {
  const current = getStoredLeads();
  let updatedItem: CommercialLeadItem | null = null;
  const next = current.map((item) => {
    if (item.id === id) {
      updatedItem = {
        ...item,
        ...updates,
        dataAtualizacao: new Date().toISOString(),
      };
      return updatedItem;
    }
    return item;
  });
  if (updatedItem) {
    saveStoredLeads(next);
  }
  return updatedItem;
}

export function updateStoredLeadStage(
  id: string,
  etapa: CommercialFunnelStage,
  motivoPerda?: string
): CommercialLeadItem | null {
  return updateStoredLead(id, {
    etapa,
    motivoPerda: etapa === 'perdido' ? motivoPerda : undefined,
    dataUltimoContato: new Date().toISOString(),
  });
}

export function deleteStoredLead(id: string): boolean {
  const current = getStoredLeads();
  const filtered = current.filter((l) => l.id !== id);
  if (filtered.length !== current.length) {
    saveStoredLeads(filtered);
    return true;
  }
  return false;
}

// ==========================================
// 2. INTERAÇÕES
// ==========================================
export function getStoredInteractions(): CommercialInteractionItem[] {
  return readFromStorage<CommercialInteractionItem[]>(COMMERCIAL_STORAGE_KEYS.INTERACTIONS, []);
}

export function saveStoredInteractions(interactions: CommercialInteractionItem[]): void {
  writeToStorage(COMMERCIAL_STORAGE_KEYS.INTERACTIONS, interactions);
}

export function addStoredInteraction(
  interaction: Omit<CommercialInteractionItem, 'id' | 'dataCriacao'>
): CommercialInteractionItem {
  const current = getStoredInteractions();
  const now = new Date().toISOString();
  const newItem: CommercialInteractionItem = {
    ...interaction,
    id: `inter-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    dataCriacao: now,
  };
  saveStoredInteractions([newItem, ...current]);

  // Atualiza data do último contato no Lead correspondente
  if (interaction.leadId) {
    updateStoredLead(interaction.leadId, { dataUltimoContato: now });
  }

  return newItem;
}

export function getInteractionsByLead(leadId: string): CommercialInteractionItem[] {
  return getStoredInteractions().filter((i) => i.leadId === leadId);
}

// ==========================================
// 3. VISITAS
// ==========================================
export function getStoredVisits(): CommercialVisitItem[] {
  return readFromStorage<CommercialVisitItem[]>(COMMERCIAL_STORAGE_KEYS.VISITS, []);
}

export function saveStoredVisits(visits: CommercialVisitItem[]): void {
  writeToStorage(COMMERCIAL_STORAGE_KEYS.VISITS, visits);
}

export function addStoredVisit(
  visit: Omit<CommercialVisitItem, 'id' | 'dataCriacao'>
): CommercialVisitItem {
  const current = getStoredVisits();
  const newItem: CommercialVisitItem = {
    ...visit,
    id: `visit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    dataCriacao: new Date().toISOString(),
  };
  saveStoredVisits([newItem, ...current]);
  return newItem;
}

export function updateStoredVisitStatus(
  id: string,
  status: VisitStatus,
  details?: { feedback?: string; motivoCancelamento?: string }
): CommercialVisitItem | null {
  const current = getStoredVisits();
  let updatedItem: CommercialVisitItem | null = null;
  const next = current.map((item) => {
    if (item.id === id) {
      updatedItem = {
        ...item,
        status,
        feedback: details?.feedback ?? item.feedback,
        motivoCancelamento: details?.motivoCancelamento ?? item.motivoCancelamento,
        dataRealizacao: status === 'realizada' ? new Date().toISOString() : item.dataRealizacao,
        dataCancelamento: status === 'cancelada' ? new Date().toISOString() : item.dataCancelamento,
      };
      return updatedItem;
    }
    return item;
  });
  if (updatedItem) {
    saveStoredVisits(next);
  }
  return updatedItem;
}

// ==========================================
// 4. PROPOSTAS
// ==========================================
export function getStoredProposals(): CommercialProposalItem[] {
  return readFromStorage<CommercialProposalItem[]>(COMMERCIAL_STORAGE_KEYS.PROPOSALS, []);
}

export function saveStoredProposals(proposals: CommercialProposalItem[]): void {
  writeToStorage(COMMERCIAL_STORAGE_KEYS.PROPOSALS, proposals);
}

export function addStoredProposal(
  proposal: Omit<CommercialProposalItem, 'id' | 'dataCriacao'>
): CommercialProposalItem {
  const current = getStoredProposals();
  const newItem: CommercialProposalItem = {
    ...proposal,
    id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    dataCriacao: new Date().toISOString(),
  };
  saveStoredProposals([newItem, ...current]);
  return newItem;
}

export function updateStoredProposalStatus(
  id: string,
  status: ProposalStatus,
  dataResposta?: string
): CommercialProposalItem | null {
  const current = getStoredProposals();
  let updatedItem: CommercialProposalItem | null = null;
  const next = current.map((item) => {
    if (item.id === id) {
      updatedItem = {
        ...item,
        status,
        dataResposta: dataResposta || (status === 'aceita' || status === 'recusada' ? new Date().toISOString() : item.dataResposta),
      };
      return updatedItem;
    }
    return item;
  });
  if (updatedItem) {
    saveStoredProposals(next);
  }
  return updatedItem;
}

// ==========================================
// 5. VENDAS
// ==========================================
export function getStoredSales(): CommercialSaleItem[] {
  return readFromStorage<CommercialSaleItem[]>(COMMERCIAL_STORAGE_KEYS.SALES, []);
}

export function saveStoredSales(sales: CommercialSaleItem[]): void {
  writeToStorage(COMMERCIAL_STORAGE_KEYS.SALES, sales);
}

export function addStoredSale(
  sale: Omit<CommercialSaleItem, 'id' | 'dataCriacao'>
): CommercialSaleItem {
  const current = getStoredSales();
  const newItem: CommercialSaleItem = {
    ...sale,
    id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    dataCriacao: new Date().toISOString(),
  };
  saveStoredSales([newItem, ...current]);

  // Se a venda estiver vinculada a um lead, atualiza o status do lead para 'venda'
  if (sale.leadId) {
    updateStoredLeadStage(sale.leadId, 'venda');
  }

  return newItem;
}

export function updateStoredSaleStatus(id: string, status: SaleStatus): CommercialSaleItem | null {
  const current = getStoredSales();
  let updatedItem: CommercialSaleItem | null = null;
  const next = current.map((item) => {
    if (item.id === id) {
      updatedItem = { ...item, status };
      return updatedItem;
    }
    return item;
  });
  if (updatedItem) {
    saveStoredSales(next);
  }
  return updatedItem;
}

// ==========================================
// 6. METAS COMERCIAIS
// ==========================================
export function getStoredCommercialGoals(): CommercialGoalItem[] {
  return readFromStorage<CommercialGoalItem[]>(COMMERCIAL_STORAGE_KEYS.GOALS, []);
}

export function saveStoredCommercialGoals(goals: CommercialGoalItem[]): void {
  writeToStorage(COMMERCIAL_STORAGE_KEYS.GOALS, goals);
}

export function addStoredCommercialGoal(
  goal: Omit<CommercialGoalItem, 'id' | 'dataCriacao' | 'dataAtualizacao'>
): CommercialGoalItem {
  const current = getStoredCommercialGoals();
  const now = new Date().toISOString();
  const newItem: CommercialGoalItem = {
    ...goal,
    id: `cgoal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    dataCriacao: now,
    dataAtualizacao: now,
  };
  saveStoredCommercialGoals([newItem, ...current]);
  return newItem;
}

export function updateStoredCommercialGoal(
  id: string,
  updates: Partial<Omit<CommercialGoalItem, 'id' | 'dataCriacao'>>
): CommercialGoalItem | null {
  const current = getStoredCommercialGoals();
  let updatedItem: CommercialGoalItem | null = null;
  const next = current.map((item) => {
    if (item.id === id) {
      updatedItem = {
        ...item,
        ...updates,
        dataAtualizacao: new Date().toISOString(),
      };
      return updatedItem;
    }
    return item;
  });
  if (updatedItem) {
    saveStoredCommercialGoals(next);
  }
  return updatedItem;
}

// ==========================================
// SNAPSHOT & UTILITÁRIOS GERAIS
// ==========================================
export function getCommercialDataSnapshot(): CommercialDataSnapshot {
  return {
    leads: getStoredLeads(),
    interactions: getStoredInteractions(),
    visits: getStoredVisits(),
    proposals: getStoredProposals(),
    sales: getStoredSales(),
    goals: getStoredCommercialGoals(),
  };
}

export function clearCommercialStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  Object.values(COMMERCIAL_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  window.dispatchEvent(
    new CustomEvent(COMMERCIAL_UPDATE_EVENT, { detail: { cleared: true, timestamp: Date.now() } })
  );
}
