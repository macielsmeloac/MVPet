import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SaaSClient, SaaSInvoice, PaymentMethod } from '../types';
import { seedSaaSClients, seedSaaSInvoices } from '../data/saasSeed';

interface SaaSState {
  saasClients: SaaSClient[];
  saasInvoices: SaaSInvoice[];
  initialized: boolean;

  initializeSaaSData: () => void;
  addSaaSClient: (client: SaaSClient) => void;
  updateSaaSClient: (id: string, updates: Partial<SaaSClient>) => void;
  toggleSaaSClientStatus: (id: string) => void;
  confirmSaaSInvoicePayment: (invoiceId: string, paymentMethod: PaymentMethod) => void;
}

export const useSaaSStore = create<SaaSState>()(
  persist(
    (set, get) => ({
      saasClients: [],
      saasInvoices: [],
      initialized: false,

      initializeSaaSData: () => {
        if (get().initialized) return;
        set({
          saasClients: seedSaaSClients,
          saasInvoices: seedSaaSInvoices,
          initialized: true,
        });
      },

      addSaaSClient: (client) =>
        set((s) => ({
          saasClients: [client, ...s.saasClients],
        })),

      updateSaaSClient: (id, updates) =>
        set((s) => ({
          saasClients: s.saasClients.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      toggleSaaSClientStatus: (id) =>
        set((s) => ({
          saasClients: s.saasClients.map((c) => {
            if (c.id === id) {
              const newStatus: SaaSClient['status'] = c.status === 'active' ? 'suspended' : 'active';
              return { ...c, status: newStatus };
            }
            return c;
          }),
        })),

      confirmSaaSInvoicePayment: (invoiceId, paymentMethod) => {
        const now = new Date();
        const formattedDate = now.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        set((s) => {
          // 1. Encontrar a fatura e atualizar
          const updatedInvoices = s.saasInvoices.map((inv) =>
            inv.id === invoiceId
              ? {
                  ...inv,
                  status: 'paid' as const,
                  paymentMethod,
                  paidAt: formattedDate,
                }
              : inv
          );

          // Encontra o id do cliente associado à fatura paga
          const targetInvoice = s.saasInvoices.find((inv) => inv.id === invoiceId);
          if (!targetInvoice) return { saasInvoices: updatedInvoices };

          // 2. Se o cliente associado estiver "suspenso", ative-o novamente!
          const updatedClients = s.saasClients.map((c) => {
            if (c.id === targetInvoice.clientId && c.status === 'suspended') {
              // Também atualiza a próxima data de cobrança para daqui 30 dias
              const nextDate = new Date();
              nextDate.setDate(nextDate.getDate() + 30);
              const nextBillingStr = nextDate.toLocaleDateString('pt-BR');
              return {
                ...c,
                status: 'active' as const,
                nextBillingDate: nextBillingStr,
              };
            }
            return c;
          });

          return {
            saasInvoices: updatedInvoices,
            saasClients: updatedClients,
          };
        });
      },
    }),
    { name: 'mvpet-saas-data' }
  )
);
