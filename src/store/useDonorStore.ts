import { create } from 'zustand';

// ──────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────
export type BloodType = 'DEA 1.1+' | 'DEA 1.1-' | 'A' | 'B' | 'AB' | 'Desconhecido';
export type DonorStatus = 'ativo' | 'inativo' | 'em_avaliacao';

export interface BloodDonor {
  id: string;
  petId: string;        // vinculado ao Pet cadastrado
  petName: string;
  tutorId: string;      // vinculado ao Tutor cadastrado
  tutorName: string;
  species: string;
  breed: string;
  ageYears: number;     // em anos
  weightKg: number;
  bloodType: BloodType;
  status: DonorStatus;
  tutorConsent: boolean;
  lastDonationDate?: string;
  nextAvailableDate?: string;
  totalDonations: number;
  notes?: string;
  registeredAt: string;
}

// ──────────────────────────────────────────────
// Estado
// ──────────────────────────────────────────────
interface DonorState {
  donors: BloodDonor[];
  addDonor: (donor: BloodDonor) => void;
  updateDonor: (id: string, updates: Partial<BloodDonor>) => void;
  deleteDonor: (id: string) => void;
  registerDonation: (id: string) => void;
}

export const useDonorStore = create<DonorState>()((set, get) => ({
  donors: [],

  addDonor: (donor) =>
    set((s) => ({ donors: [...s.donors, donor] })),

  updateDonor: (id, updates) =>
    set((s) => ({
      donors: s.donors.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),

  deleteDonor: (id) =>
    set((s) => ({ donors: s.donors.filter((d) => d.id !== id) })),

  registerDonation: (id) => {
    const today = new Date();
    const nextAvailable = new Date(today);
    nextAvailable.setDate(today.getDate() + 90); // intervalo mínimo de 90 dias
    set((s) => ({
      donors: s.donors.map((d) =>
        d.id === id
          ? {
              ...d,
              lastDonationDate: today.toISOString().split('T')[0],
              nextAvailableDate: nextAvailable.toISOString().split('T')[0],
              totalDonations: d.totalDonations + 1,
            }
          : d
      ),
    }));
  },
}));
