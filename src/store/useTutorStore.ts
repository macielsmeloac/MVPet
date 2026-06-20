import { create } from 'zustand';
import { Tutor } from '../types';

interface TutorState {
  tutorAuth: Tutor | null;
  activeClinicId: string | null;
  availableClinics: Array<{ id: string; name: string }>;
  login: (cpfOrEmail: string) => Promise<boolean>;
  logout: () => void;
  setActiveClinic: (clinicId: string) => void;
}

export const useTutorStore = create<TutorState>((set) => ({
  tutorAuth: null,
  activeClinicId: null,
  availableClinics: [],

  login: async (cpfOrEmail: string) => {
    // Mock login that finds a tutor by CPF or Email
    // In a real scenario, this would query Supabase `tutors` and their linked clinics.
    // For now, we simulate success if they type "tutor@exemplo.com" or "123"
    
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock data for demonstration
    const mockTutor: Tutor = {
      id: 'tutor-123',
      name: 'João Silva',
      cpf: '123.456.789-00',
      email: 'tutor@exemplo.com',
      phone: '11999999999',
      whatsapp: '11999999999',
      address: {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000'
      },
      isSubscriber: false,
      hasDebt: false,
      tags: [],
      petIds: ['pet-1', 'pet-2'],
      createdAt: new Date().toISOString(),
    };

    const mockClinics = [
      { id: 'clinic-1', name: 'PetShop Cão Feliz' },
      { id: 'clinic-2', name: 'Clínica Veterinária Vida Animal' }
    ];

    set({ 
      tutorAuth: mockTutor, 
      availableClinics: mockClinics,
      // Se tiver só uma clínica, já seleciona direto. Senão, deixa null pra ele escolher.
      activeClinicId: mockClinics.length === 1 ? mockClinics[0]?.id : null
    });

    return true;
  },

  logout: () => {
    set({ tutorAuth: null, activeClinicId: null, availableClinics: [] });
  },

  setActiveClinic: (clinicId: string) => {
    set({ activeClinicId: clinicId });
  }
}));
