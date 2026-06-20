import { create } from 'zustand';
import { Tutor, Pet, SavedMedicalRecord, VaccinationRecord, Hospitalization, Appointment, Product } from '../types';
import { supabase } from '../lib/supabase';

interface TutorState {
  tutorAuth: Tutor | null;
  activeClinicId: string | null;
  availableClinics: Array<{ id: string; name: string }>;
  
  // Real data
  pets: Pet[];
  medicalRecords: SavedMedicalRecord[];
  vaccinations: VaccinationRecord[];
  hospitalizations: Hospitalization[];
  appointments: Appointment[];
  products: Product[];

  login: (cpfOrEmail: string) => Promise<boolean>;
  logout: () => void;
  setActiveClinic: (clinicId: string) => Promise<void>;
  loadTutorData: (clinicId: string, tutorId: string) => Promise<void>;
  placeOrder: (cart: any[]) => Promise<boolean>;
}

export const useTutorStore = create<TutorState>((set, get) => ({
  tutorAuth: null,
  activeClinicId: null,
  availableClinics: [],
  
  pets: [],
  medicalRecords: [],
  vaccinations: [],
  hospitalizations: [],
  appointments: [],
  products: [],

  login: async (cpfOrEmail: string) => {
    try {
      const cleanInput = cpfOrEmail.trim();
      
      // Query tutors that match CPF or Email. 
      // Supabase join syntax to get clinic name:
      const { data: tutorsData, error } = await supabase
        .from('tutors')
        .select(`
          *,
          clinics (
            id,
            name
          )
        `)
        .or(`cpf.eq.${cleanInput},email.eq.${cleanInput}`);

      if (error) {
        console.error('Supabase error on tutor login:', error);
        return false;
      }

      if (!tutorsData || tutorsData.length === 0) {
        return false;
      }

      // We might have multiple rows if the tutor is registered in multiple clinics.
      // We will pick the first one as the base tutor profile, but list all clinics.
      const baseTutor = tutorsData[0];
      const parsedTutor: Tutor = {
        ...baseTutor,
        address: baseTutor.address || {},
        tags: baseTutor.tags || [],
        financialHistory: baseTutor.financial_history || []
      };

      const clinics = tutorsData.map((t: any) => ({
        id: t.clinics?.id,
        name: t.clinics?.name || 'Clínica Desconhecida'
      })).filter(c => c.id);

      set({ 
        tutorAuth: parsedTutor, 
        availableClinics: clinics,
        activeClinicId: null // Reset active clinic to force choice if > 1
      });

      // Se tiver só uma clínica, já seleciona direto
      const firstClinic = clinics[0];
      if (clinics.length === 1 && firstClinic && firstClinic.id) {
        await get().setActiveClinic(firstClinic.id);
      }

      return true;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  },

  logout: () => {
    set({ 
      tutorAuth: null, activeClinicId: null, availableClinics: [],
      pets: [], medicalRecords: [], vaccinations: [], hospitalizations: [], appointments: [], products: []
    });
  },

  setActiveClinic: async (clinicId: string) => {
    set({ activeClinicId: clinicId });
    const tutor = get().tutorAuth;
    if (tutor) {
      await get().loadTutorData(clinicId, tutor.id);
    }
  },

  loadTutorData: async (clinicId: string, tutorId: string) => {
    try {
      // 1. Fetch Pets for this tutor in this clinic
      const { data: petsData } = await supabase
        .from('pets')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('clinic_id', clinicId);

      const pets = (petsData || []) as Pet[];
      const petIds = pets.map(p => p.id);

      // 2. Fetch Appointments
      const { data: appData } = await supabase
        .from('appointments')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('clinic_id', clinicId);
        
      // 3. Fetch Products for Marketplace
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('clinic_id', clinicId);

      let medicalRecords: SavedMedicalRecord[] = [];
      let vaccinations: VaccinationRecord[] = [];
      let hospitalizations: Hospitalization[] = [];

      if (petIds.length > 0) {
        // Fetch Medical Records
        const { data: mrData } = await supabase
          .from('medical_records')
          .select('*')
          .in('pet_id', petIds);
        
        if (mrData) {
          medicalRecords = mrData.map(mr => ({
            id: mr.id,
            petId: mr.pet_id,
            date: mr.date,
            veterinarianName: mr.veterinarian_name,
            chiefComplaint: mr.chief_complaint,
            conduct: mr.conduct,
            observations: mr.observations,
            nextReturn: mr.next_return,
            prescriptions: mr.prescriptions,
            createdAt: mr.created_at
          }));
        }

        // Fetch Vaccinations
        const { data: vacData } = await supabase
          .from('vaccinations')
          .select('*')
          .in('pet_id', petIds);
        
        if (vacData) {
          vaccinations = vacData.map(v => ({
            id: v.id,
            petId: v.pet_id,
            vaccineName: v.vaccine_name,
            vaccineType: v.vaccine_type,
            applicationDate: v.application_date,
            nextDoseDate: v.next_dose_date,
            veterinarianName: v.veterinarian_name,
            lot: v.lot,
            manufacturer: v.manufacturer,
            notes: v.notes
          }));
        }

        // Fetch Hospitalizations
        const { data: hospData } = await supabase
          .from('hospitalizations')
          .select('*')
          .in('pet_id', petIds);
        hospitalizations = (hospData || []) as any;
      }

      set({
        pets,
        appointments: (appData || []) as any,
        products: (prodData || []) as any,
        medicalRecords,
        vaccinations,
        hospitalizations
      });

    } catch (e) {
      console.error('Error loading tutor data:', e);
    }
  },

  placeOrder: async (cart: any[]) => {
    const { tutorAuth, activeClinicId } = get();
    if (!tutorAuth || !activeClinicId || cart.length === 0) return false;

    try {
      const orderItems = cart.map(item => ({
        clinic_id: activeClinicId,
        tutor_id: tutorAuth.id,
        name: `(Loja Virtual) ${item.name}`,
        type: 'product',
        price: item.price,
        quantity: item.qty
      }));

      const { error } = await supabase.from('comanda_items').insert(orderItems);
      
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error placing order:', e);
      return false;
    }
  }
}));
