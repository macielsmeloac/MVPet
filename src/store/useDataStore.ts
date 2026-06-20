import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Pet, Tutor, Appointment, Product, Hospitalization, Transaction, TransportOrder, SubscriptionPlan, ComandaItem, Commission, VaccinationRecord, SavedMedicalRecord } from '../types';
import { seedPets, seedTutors, seedAppointments, seedProducts, seedHospitalizations, seedTransactions, seedTransportOrders, seedSubscriptionPlans, seedCommissions, seedVaccinations } from '../data/seed';

interface DataState {
  pets: Pet[];
  tutors: Tutor[];
  appointments: Appointment[];
  products: Product[];
  hospitalizations: Hospitalization[];
  transactions: Transaction[];
  transportOrders: TransportOrder[];
  subscriptionPlans: SubscriptionPlan[];
  comandas: Record<string, ComandaItem[]>;
  commissions: Commission[];
  vaccinations: VaccinationRecord[];
  medicalRecords: SavedMedicalRecord[];
  initialized: boolean;

  initializeData: () => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  administerMedication: (hospId: string, medId: string, hour: string, by: string, justification?: string, exactDateTime?: string) => void;
  updateTransportStatus: (id: string, status: TransportOrder['status']) => void;
  addPet: (pet: Pet) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  addTutor: (tutor: Tutor) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  addProduct: (product: Product) => void;
  addTransaction: (transaction: Transaction) => void;
  addSubscriptionPlan: (plan: SubscriptionPlan) => void;
  updateSubscriptionPlan: (id: string, updates: Partial<SubscriptionPlan>) => void;
  deleteSubscriptionPlan: (id: string) => void;
  addItemToComanda: (tutorId: string, item: ComandaItem) => void;
  removeItemFromComanda: (tutorId: string, itemId: string) => void;
  clearComanda: (tutorId: string) => void;
  depositTutorCredits: (tutorId: string, amount: number) => void;
  dischargePatient: (hospId: string, recommendations: string, report: string) => void;
  processDailyBedRates: () => void;
  updateTutorDebtStatus: (tutorId: string, hasDebt: boolean) => void;
  addCommission: (commission: Commission) => void;
  markCommissionPaid: (id: string) => void;
  addVaccination: (v: VaccinationRecord) => void;
  addMedicalRecord: (r: SavedMedicalRecord) => void;
  addHospitalizationPrescription: (hospId: string, medSchedule: import('../types').MedicationSchedule, billingItem: ComandaItem, tutorId: string) => void;
  suspendHospitalizationPrescription: (hospId: string, medId: string) => void;
  resumeHospitalizationPrescription: (hospId: string, medId: string) => void;
  editHospitalizationPrescription: (hospId: string, medId: string, newSchedule: import('../types').MedicationSchedule, newBillingItem: ComandaItem, tutorId: string) => void;
}

export const useDataStore = create<DataState>()(
    (set, get) => ({
      pets: [],
      tutors: [],
      appointments: [],
      products: [],
      hospitalizations: [],
      transactions: [],
      transportOrders: [],
      subscriptionPlans: [],
      comandas: {},
      commissions: [],
      vaccinations: [],
      medicalRecords: [],
      initialized: false,

      initializeData: async () => {
        if (get().initialized) return;

        const { data: sessionData } = await supabase.auth.getSession();
        const clinicOwnerId = sessionData.session?.user?.id;

        // Defaults (seed data)
        let supaTutors = seedTutors;
        let supaPets = seedPets;
        let supaAppointments = seedAppointments;
        let supaProducts = seedProducts;
        let supaHospitalizations = seedHospitalizations;
        let supaTransactions = seedTransactions;
        let supaTransportOrders = seedTransportOrders;
        let supaSubscriptionPlans = seedSubscriptionPlans;
        let supaCommissions = seedCommissions;
        let supaVaccinations = seedVaccinations;
        let supaMedicalRecords: import('../types').SavedMedicalRecord[] = [];
        let supaComandas: Record<string, ComandaItem[]> = {};

        if (clinicOwnerId) {
          try {
            const { data: dbClinics } = await supabase.from('clinics').select('id').eq('owner_id', clinicOwnerId).single();
            if (dbClinics) {
              const cid = dbClinics.id;

              const [
                tutRes, petRes, appRes, prodRes, hospRes,
                transRes, transportRes, planRes, commRes, vacRes, mrRes, comandaRes
              ] = await Promise.all([
                supabase.from('tutors').select('*').eq('clinic_id', cid),
                supabase.from('pets').select('*').eq('clinic_id', cid),
                supabase.from('appointments').select('*').eq('clinic_id', cid),
                supabase.from('products').select('*').eq('clinic_id', cid),
                supabase.from('hospitalizations').select('*').eq('clinic_id', cid),
                supabase.from('transactions').select('*').eq('clinic_id', cid),
                supabase.from('transport_orders').select('*').eq('clinic_id', cid),
                supabase.from('subscription_plans').select('*').eq('clinic_id', cid),
                supabase.from('commissions').select('*').eq('clinic_id', cid),
                supabase.from('vaccinations').select('*').eq('clinic_id', cid),
                supabase.from('medical_records').select('*').eq('clinic_id', cid),
                supabase.from('comanda_items').select('*').eq('clinic_id', cid),
              ]);

              if (tutRes.data?.length) supaTutors = tutRes.data as any;
              if (petRes.data?.length) supaPets = petRes.data as any;
              if (appRes.data?.length) supaAppointments = appRes.data as any;
              if (prodRes.data?.length) supaProducts = prodRes.data as any;
              if (hospRes.data?.length) supaHospitalizations = hospRes.data as any;
              if (transRes.data?.length) supaTransactions = transRes.data as any;
              if (transportRes.data?.length) supaTransportOrders = transportRes.data as any;
              if (planRes.data?.length) supaSubscriptionPlans = planRes.data as any;
              if (commRes.data?.length) supaCommissions = commRes.data as any;
              if (vacRes.data?.length) supaVaccinations = vacRes.data as any;
              if (mrRes.data?.length) supaMedicalRecords = mrRes.data as any;

              // Rebuild comandas map from flat rows
              if (comandaRes.data?.length) {
                supaComandas = (comandaRes.data as any[]).reduce((acc: Record<string, ComandaItem[]>, row) => {
                  const tid = row.tutor_id as string;
                  if (!acc[tid]) acc[tid] = [];
                  acc[tid].push({ id: row.id, name: row.name, type: row.type, price: row.price, quantity: row.quantity });
                  return acc;
                }, {});
              }
            }
          } catch(e) {
            console.error('[MVPet] Error fetching from Supabase:', e);
          }
        }

        set({
          pets: supaPets,
          tutors: supaTutors,
          appointments: supaAppointments,
          products: supaProducts,
          hospitalizations: supaHospitalizations,
          transactions: supaTransactions,
          transportOrders: supaTransportOrders,
          subscriptionPlans: supaSubscriptionPlans,
          commissions: supaCommissions,
          vaccinations: supaVaccinations,
          medicalRecords: supaMedicalRecords,
          comandas: supaComandas,
          initialized: true,
        });
      },

      updateAppointmentStatus: (id, status) =>
        set((s) => ({
          appointments: s.appointments.map((a) => a.id === id ? { ...a, status } : a),
        })),

      administerMedication: (hospId, medId, hour, by, justification, exactDateTime) =>
        set((s) => {
          const hosp = s.hospitalizations.find((h) => h.id === hospId);
          if (!hosp) return {};

          const pet = s.pets.find((p) => p.id === hosp.petId);
          const tutorId = pet?.tutorId;

          const medSchedule = hosp.medications.find((m) => m.id === medId);
          const rawMedName = medSchedule?.medication || '';
          const cleanMedName = rawMedName.split(' ')[0] || rawMedName;

          let newProducts = s.products;
          let productPrice = 45.00;
          const productIndex = s.products.findIndex(
            (p) => p.name.toLowerCase().includes(cleanMedName.toLowerCase()) || p.id === medId
          );

          if (productIndex !== -1) {
            newProducts = s.products.map((p, idx) =>
              idx === productIndex
                ? { ...p, quantity: Math.max(0, p.quantity - 1), alertType: (p.quantity - 1 <= p.minQuantity) ? 'low-stock' : 'ok' }
                : p
            );
            const foundProduct = s.products[productIndex];
            if (foundProduct) {
              productPrice = foundProduct.price;
            }
          }

          const newHospitalizations = s.hospitalizations.map((h) =>
            h.id === hospId
              ? {
                  ...h,
                  medications: h.medications.map((m) =>
                    m.id === medId
                      ? {
                          ...m,
                          times: m.times.map((t) =>
                            t.hour === hour
                              ? {
                                  ...t,
                                  administered: true,
                                  administeredAt:
                                    exactDateTime ||
                                    new Date().toLocaleString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }),
                                  administeredBy: by,
                                  delayJustification: justification,
                                }
                              : t
                          ),
                        }
                      : m
                  ),
                }
              : h
          );

          let newComandas = s.comandas;
          if (tutorId) {
            const tutorComanda = s.comandas[tutorId] || [];
            const itemUniqueId = `med-check-${medId}-${hour}-${Date.now()}`;
            const newItem: ComandaItem = {
              id: itemUniqueId,
              name: `Aplicação: ${rawMedName}`,
              type: 'product',
              price: productPrice,
              quantity: 1,
            };
            newComandas = {
              ...s.comandas,
              [tutorId]: [...tutorComanda, newItem],
            };
          }

          return {
            products: newProducts,
            hospitalizations: newHospitalizations,
            comandas: newComandas,
          };
        }),

      updateTransportStatus: (id, status) =>
        set((s) => ({
          transportOrders: s.transportOrders.map((t) => t.id === id ? { ...t, status } : t),
        })),

      addPet: async (pet) => {
        set((s) => ({ pets: [...s.pets, pet] }));
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user?.id) {
          const { data: dbClinics } = await supabase.from('clinics').select('id').eq('owner_id', sessionData.session.user.id).single();
          if (dbClinics) {
            await supabase.from('pets').insert({ ...pet, clinic_id: dbClinics.id });
          }
        }
      },
      updatePet: (id, updates) => set((s) => ({
        pets: s.pets.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
      addTutor: async (tutor) => {
        set((s) => ({ tutors: [...s.tutors, tutor] }));
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user?.id) {
          const { data: dbClinics } = await supabase.from('clinics').select('id').eq('owner_id', sessionData.session.user.id).single();
          if (dbClinics) {
            await supabase.from('tutors').insert({ ...tutor, clinic_id: dbClinics.id });
          }
        }
      },
      addAppointment: async (appointment) => {
        set((s) => ({ appointments: [...s.appointments, appointment] }));
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user?.id) {
          const { data: dbClinics } = await supabase.from('clinics').select('id').eq('owner_id', sessionData.session.user.id).single();
          if (dbClinics) {
            await supabase.from('appointments').insert({ ...appointment, clinic_id: dbClinics.id });
          }
        }
      },
      updateAppointment: (id, appointment) => set((s) => ({ appointments: s.appointments.map((a) => a.id === id ? { ...a, ...appointment } : a) })),
      addProduct: async (product) => {
        set((s) => ({ products: [...s.products, product] }));
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user?.id) {
          const { data: clinic } = await supabase.from('clinics').select('id').eq('owner_id', sessionData.session.user.id).single();
          if (clinic) await supabase.from('products').insert({ ...product, clinic_id: clinic.id, min_quantity: product.minQuantity, cost_price: product.costPrice, expiry_date: product.expiryDate, alert_type: product.alertType, sales_unit: product.salesUnit, conversion_factor: product.conversionFactor });
        }
      },
      addTransaction: async (transaction) => {
        set((s) => ({ transactions: [...s.transactions, transaction] }));
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user?.id) {
          const { data: clinic } = await supabase.from('clinics').select('id').eq('owner_id', sessionData.session.user.id).single();
          if (clinic) await supabase.from('transactions').insert({ ...transaction, clinic_id: clinic.id, payment_method: transaction.paymentMethod, invoice_status: transaction.invoiceStatus, invoice_type: transaction.invoiceType, related_appointment_id: transaction.relatedAppointmentId });
        }
      },
      addSubscriptionPlan: async (plan) => {
        set((s) => ({ subscriptionPlans: [...s.subscriptionPlans, plan] }));
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user?.id) {
          const { data: clinic } = await supabase.from('clinics').select('id').eq('owner_id', sessionData.session.user.id).single();
          if (clinic) await supabase.from('subscription_plans').insert({ ...plan, clinic_id: clinic.id, is_active: plan.isActive, is_featured: plan.isFeatured, highlight_color: plan.highlightColor });
        }
      },
      updateSubscriptionPlan: async (id, updates) => {
        set((s) => ({
          subscriptionPlans: s.subscriptionPlans.map((p) => p.id === id ? { ...p, ...updates } : p),
        }));
        await supabase.from('subscription_plans').update({ ...updates, is_active: updates.isActive, is_featured: updates.isFeatured, highlight_color: updates.highlightColor }).eq('id', id);
      },
      deleteSubscriptionPlan: async (id) => {
        set((s) => ({
          subscriptionPlans: s.subscriptionPlans.map((p) => p.id === id ? { ...p, isActive: false } : p),
        }));
        await supabase.from('subscription_plans').update({ is_active: false }).eq('id', id);
      },

      addItemToComanda: async (tutorId, item) => {
        set((s) => {
          const tutorComanda = s.comandas[tutorId] || [];
          const existingItem = tutorComanda.find((i) => i.id === item.id || (i.name === item.name && i.type === item.type));
          let newComanda;
          if (existingItem) {
            newComanda = tutorComanda.map((i) =>
              i.id === existingItem.id ? { ...i, quantity: i.quantity + item.quantity } : i
            );
          } else {
            newComanda = [...tutorComanda, item];
          }
          return { comandas: { ...s.comandas, [tutorId]: newComanda } };
        });
        // Persist to Supabase
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user?.id) {
          const { data: clinic } = await supabase.from('clinics').select('id').eq('owner_id', sessionData.session.user.id).single();
          if (clinic) {
            // Upsert by id to handle quantity increments
            await supabase.from('comanda_items').upsert({
              id: item.id,
              clinic_id: clinic.id,
              tutor_id: tutorId,
              name: item.name,
              type: item.type,
              price: item.price,
              quantity: item.quantity,
            });
          }
        }
      },

      removeItemFromComanda: async (tutorId, itemId) => {
        set((s) => {
          const tutorComanda = s.comandas[tutorId] || [];
          return { comandas: { ...s.comandas, [tutorId]: tutorComanda.filter((i) => i.id !== itemId) } };
        });
        await supabase.from('comanda_items').delete().eq('id', itemId);
      },

      clearComanda: async (tutorId) => {
        set((s) => {
          const copy = { ...s.comandas };
          delete copy[tutorId];
          return { comandas: copy };
        });
        await supabase.from('comanda_items').delete().eq('tutor_id', tutorId);
      },

      depositTutorCredits: (tutorId, amount) =>
        set((s) => {
          const tutor = s.tutors.find((t) => t.id === tutorId);
          if (!tutor) return {};

          const currentCredits = tutor.credits || 0;
          const newCredits = currentCredits + amount;
          const newHistory = tutor.financialHistory || [];

          const transactionRecord = {
            id: `dep-${Date.now()}`,
            type: 'credit_deposit' as const,
            description: `Depósito Calção Antecipado`,
            amount: amount,
            date: new Date().toISOString().split('T')[0] || '',
            status: 'paid' as const,
          };

          return {
            tutors: s.tutors.map((t) =>
              t.id === tutorId
                ? {
                    ...t,
                    credits: newCredits,
                    financialHistory: [transactionRecord, ...newHistory],
                  }
                : t
            ),
          };
        }),

      dischargePatient: async (hospId, recommendations, report) => {
        let finalHospState: import('../types').Hospitalization | null = null;
        let newRecord: import('../types').SavedMedicalRecord | null = null;

        set((s) => {
          const hosp = s.hospitalizations.find((h) => h.id === hospId);
          if (!hosp) return {};
          const pet = s.pets.find(p => p.id === hosp.petId);
          if (!pet) return {};

          let totalRefund = 0;
          const finalMedications = hosp.medications.map(m => {
            if (m.status !== 'suspended') {
              const unadministered = m.times.filter(t => !t.administered);
              totalRefund += unadministered.length * (m.pricePerUnit || 0);
            }
            return { ...m, status: 'completed' as const, times: m.times.filter(t => t.administered) };
          });

          const updatedHosp = {
            ...hosp, status: 'discharged' as const,
            dischargeDate: new Date().toISOString().split('T')[0] || '',
            dischargeRecommendations: recommendations, dischargeReport: report,
            isAccountFrozen: true, medications: finalMedications
          };
          finalHospState = updatedHosp;

          const newHospitalizations = s.hospitalizations.map((h) => h.id === hospId ? updatedHosp : h);

          let newComandas = s.comandas;
          if (totalRefund > 0) {
            const tutorId = pet.tutorId;
            const refundItem = {
              id: `refund-discharge-${Date.now()}`, name: `Estorno (Alta Médica): Doses não aplicadas`,
              type: 'product' as const, price: -Math.abs(totalRefund), quantity: 1,
            };
            newComandas = { ...s.comandas, [tutorId]: [...(s.comandas[tutorId] || []), refundItem] };
          }

          const recordId = `rec-${Date.now()}`;
          newRecord = {
            id: recordId, petId: hosp.petId,
            date: new Date().toISOString().split('T')[0] || '',
            veterinarianName: hosp.veterinarianName,
            chiefComplaint: `Internação (Leito ${hosp.bedNumber}): ${hosp.reason}`,
            conduct: recommendations, observations: report,
            prescriptions: hosp.medications.map(m => ({
              id: m.id, medication: m.medication, dosage: m.dosage, route: m.route,
              frequency: `${m.frequencyHours || 8}h`, duration: `${m.durationDays || 1} dias`,
              instructions: `Via de administração: ${m.route}`
            })),
            createdAt: new Date().toISOString()
          };

          return { hospitalizations: newHospitalizations, medicalRecords: [...s.medicalRecords, newRecord!], comandas: newComandas };
        });

        // Persist to Supabase
        const { data: sessionData } = await supabase.auth.getSession();
        const castRecord = newRecord as import('../types').SavedMedicalRecord | null;
        const castHosp = finalHospState as import('../types').Hospitalization | null;
        if (sessionData.session?.user?.id && castHosp && castRecord) {
          const { data: clinic } = await supabase.from('clinics').select('id').eq('owner_id', sessionData.session.user.id).single();
          if (clinic) {
            await Promise.all([
              supabase.from('hospitalizations').update({
                status: 'discharged', discharge_date: castHosp.dischargeDate,
                discharge_recommendations: recommendations, discharge_report: report,
                is_account_frozen: true, medications: castHosp.medications,
              }).eq('id', hospId),
              supabase.from('medical_records').insert({
                id: castRecord.id, clinic_id: clinic.id, pet_id: castRecord.petId,
                date: castRecord.date, veterinarian_name: castRecord.veterinarianName,
                chief_complaint: castRecord.chiefComplaint, conduct: castRecord.conduct,
                observations: castRecord.observations, prescriptions: castRecord.prescriptions,
              }),
            ]);
          }
        }
      },

      processDailyBedRates: () =>
        set((s) => {
          const todayStr = new Date().toISOString().split('T')[0] || '';
          const newComandas = { ...s.comandas };
          const updatedHospList = s.hospitalizations.map((h) => {
            if (h.status !== 'active') return h;

            const lastCharged = h.lastDailyRateChargedAt ? h.lastDailyRateChargedAt.split('T')[0] : '';
            if (lastCharged === todayStr) {
              return h;
            }

            const pet = s.pets.find((p) => p.id === h.petId);
            const tutorId = pet?.tutorId;
            if (tutorId) {
              const bedCost = h.bedCostPerDay || 120.00;
              const tutorComanda = newComandas[tutorId] || [];
              const dailyRateItem: ComandaItem = {
                id: `daily-rate-${h.id}-${Date.now()}`,
                name: `Diária de Internação - Leito ${h.bedNumber}`,
                type: 'service',
                price: bedCost,
                quantity: 1,
              };
              newComandas[tutorId] = [...tutorComanda, dailyRateItem];
            }

            return {
              ...h,
              lastDailyRateChargedAt: new Date().toISOString(),
            };
          });

          return {
            hospitalizations: updatedHospList,
            comandas: newComandas,
          };
        }),

      updateTutorDebtStatus: async (tutorId, hasDebt) => {
        set((s) => ({
          tutors: s.tutors.map((t) =>
            t.id === tutorId ? { ...t, hasDebt, blockedByDebt: hasDebt } : t
          ),
        }));
        await supabase.from('tutors').update({ has_debt: hasDebt, blocked_by_debt: hasDebt }).eq('id', tutorId);
      },

      addCommission: async (commission) => {
        set((s) => ({ commissions: [...s.commissions, commission] }));
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user?.id) {
          const { data: clinic } = await supabase.from('clinics').select('id').eq('owner_id', sessionData.session.user.id).single();
          if (clinic) {
            await supabase.from('commissions').insert({
              id: commission.id,
              clinic_id: clinic.id,
              employee_name: commission.employeeName,
              transaction_id: commission.transactionId,
              service_description: commission.serviceDescription,
              sale_amount: commission.saleAmount,
              commission_rate: commission.commissionRate,
              commission_value: commission.commissionValue,
              date: commission.date,
              status: commission.status,
            });
          }
        }
      },

      markCommissionPaid: async (id) => {
        set((s) => ({
          commissions: s.commissions.map((c) =>
            c.id === id ? { ...c, status: 'paid' as const } : c
          ),
        }));
        await supabase.from('commissions').update({ status: 'paid' }).eq('id', id);
      },

      addVaccination: async (v) => {
        set((s) => ({ vaccinations: [...s.vaccinations, v] }));
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user?.id) {
          const { data: clinic } = await supabase.from('clinics').select('id').eq('owner_id', sessionData.session.user.id).single();
          if (clinic) {
            await supabase.from('vaccinations').insert({
              id: v.id,
              clinic_id: clinic.id,
              pet_id: v.petId,
              vaccine_name: v.vaccineName,
              vaccine_type: v.vaccineType,
              application_date: v.applicationDate,
              next_dose_date: v.nextDoseDate,
              veterinarian_name: v.veterinarianName,
              lot: v.lot,
              manufacturer: v.manufacturer,
              notes: v.notes,
            });
          }
        }
      },

      addMedicalRecord: async (r) => {
        set((s) => ({ medicalRecords: [...s.medicalRecords, r] }));
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user?.id) {
          const { data: clinic } = await supabase.from('clinics').select('id').eq('owner_id', sessionData.session.user.id).single();
          if (clinic) {
            await supabase.from('medical_records').insert({
              id: r.id,
              clinic_id: clinic.id,
              pet_id: r.petId,
              date: r.date,
              veterinarian_name: r.veterinarianName,
              chief_complaint: r.chiefComplaint,
              conduct: r.conduct,
              observations: r.observations,
              next_return: r.nextReturn || null,
              prescriptions: r.prescriptions,
            });
          }
        }
      },

      addHospitalizationPrescription: (hospId, medSchedule, billingItem, tutorId) =>
        set((s) => {
          const hosp = s.hospitalizations.find((h) => h.id === hospId);
          if (!hosp) return {};
          
          const newHospitalizations = s.hospitalizations.map((h) =>
            h.id === hospId ? { ...h, medications: [...h.medications, medSchedule] } : h
          );

          // Add to Comanda
          const tutorComanda = s.comandas[tutorId] || [];
          const existingItem = tutorComanda.find((i) => i.id === billingItem.id || (i.name === billingItem.name && i.type === billingItem.type));
          
          let newComanda;
          if (existingItem) {
            newComanda = tutorComanda.map((i) =>
              i.id === existingItem.id ? { ...i, quantity: i.quantity + billingItem.quantity } : i
            );
          } else {
            newComanda = [...tutorComanda, billingItem];
          }

          return {
            hospitalizations: newHospitalizations,
            comandas: {
              ...s.comandas,
              [tutorId]: newComanda,
            },
          };
        }),

      suspendHospitalizationPrescription: (hospId, medId) =>
        set((s) => {
          const hosp = s.hospitalizations.find((h) => h.id === hospId);
          if (!hosp) return {};
          
          const pet = s.pets.find(p => p.id === hosp.petId);
          if (!pet) return {};

          let refundAmount = 0;
          let medicationName = '';
          let unadministeredCount = 0;

          // 1. Atualizar a grade da internação, marcando como suspensa e guardando a qtde
          const newHospitalizations = s.hospitalizations.map((h) => {
            if (h.id !== hospId) return h;
            const updatedMedications = h.medications.map(m => {
              if (m.id !== medId || m.status === 'suspended') return m;
              medicationName = m.medication;
              const unadministered = m.times.filter(t => !t.administered);
              unadministeredCount = unadministered.length;
              refundAmount = unadministeredCount * (m.pricePerUnit || 0);

              // Removemos da grade os horários não administrados e mudamos status
              return { 
                ...m, 
                status: 'suspended' as const,
                pendingDoses: unadministeredCount,
                times: m.times.filter(t => t.administered) 
              };
            });

            return { ...h, medications: updatedMedications };
          });

          // 2. Lançar o estorno na comanda se houver valor a devolver
          let newComandas = s.comandas;
          if (refundAmount > 0) {
            const tutorId = pet.tutorId;
            const tutorComanda = s.comandas[tutorId] || [];
            const refundItem = {
              id: `refund-${Date.now()}`,
              name: `Estorno (Suspensão): ${medicationName} (${unadministeredCount} doses)`,
              type: 'product' as const,
              price: -Math.abs(refundAmount),
              quantity: 1,
            };
            newComandas = {
              ...s.comandas,
              [tutorId]: [...tutorComanda, refundItem],
            };
          }

          return {
            hospitalizations: newHospitalizations,
            comandas: newComandas,
          };
        }),

      resumeHospitalizationPrescription: (hospId, medId) =>
        set((s) => {
          const hosp = s.hospitalizations.find((h) => h.id === hospId);
          if (!hosp) return {};
          
          const pet = s.pets.find(p => p.id === hosp.petId);
          if (!pet) return {};

          let chargeAmount = 0;
          let medicationName = '';
          let generatedCount = 0;

          const newHospitalizations = s.hospitalizations.map((h) => {
            if (h.id !== hospId) return h;
            const updatedMedications = h.medications.map(m => {
              if (m.id !== medId || m.status !== 'suspended') return m;
              
              const remaining = m.pendingDoses || 0;
              if (remaining <= 0) return { ...m, status: 'active' as const };

              medicationName = m.medication;
              generatedCount = remaining;
              chargeAmount = generatedCount * (m.pricePerUnit || 0);

              // Gerar novos horários a partir de agora
              const newTimes = [];
              let currentHour = new Date().getHours();
              const freqValue = m.frequencyHours || 24;
              
              for (let i = 0; i < remaining; i++) {
                const hourStr = `${String(currentHour).padStart(2, '0')}:00`;
                newTimes.push({ hour: hourStr, administered: false });
                currentHour = (currentHour + freqValue) % 24;
              }

              // Apenas projeta o que cabe no dia (como a regra original)
              const maxPerDay = 24 / freqValue;
              const timesToday = newTimes.slice(0, maxPerDay);

              return { 
                ...m, 
                status: 'active' as const,
                pendingDoses: 0,
                times: [...m.times, ...timesToday] 
              };
            });

            return { ...h, medications: updatedMedications };
          });

          let newComandas = s.comandas;
          if (chargeAmount > 0) {
            const tutorId = pet.tutorId;
            const tutorComanda = s.comandas[tutorId] || [];
            const chargeItem = {
              id: `resume-${Date.now()}`,
              name: `Retomada de Prescrição: ${medicationName} (${generatedCount} doses)`,
              type: 'product' as const,
              price: Math.abs(chargeAmount),
              quantity: 1,
            };
            newComandas = {
              ...s.comandas,
              [tutorId]: [...tutorComanda, chargeItem],
            };
          }

          return {
            hospitalizations: newHospitalizations,
            comandas: newComandas,
          };
        }),

      editHospitalizationPrescription: (hospId, medId, newSchedule, newBillingItem, tutorId) =>
        set((s) => {
          const hosp = s.hospitalizations.find((h) => h.id === hospId);
          if (!hosp) return {};
          
          let oldRefundAmount = 0;
          let oldUnadministeredCount = 0;
          let medicationName = '';

          // 1. Estornar a antiga, pegar doses administradas
          const newHospitalizations = s.hospitalizations.map((h) => {
            if (h.id !== hospId) return h;
            
            const updatedMedications = h.medications.map(m => {
              if (m.id !== medId) return m;
              medicationName = m.medication;
              
              if (m.status !== 'suspended') {
                const unadministered = m.times.filter(t => !t.administered);
                oldUnadministeredCount = unadministered.length;
                oldRefundAmount = oldUnadministeredCount * (m.pricePerUnit || 0);
              }

              // Substitui o `m` pela `newSchedule`, mas preservando o histórico das `times` antigas administradas!
              const pastTimes = m.times.filter(t => t.administered);
              return { 
                ...newSchedule, 
                id: m.id, // Preserva ID
                times: [...pastTimes, ...newSchedule.times] 
              };
            });

            return { ...h, medications: updatedMedications };
          });

          // 2. Atualizar Comanda (Estornar antigo + Cobrar novo)
          let newComandas = s.comandas;
          const tutorComanda = s.comandas[tutorId] || [];
          const itemsToAdd = [...tutorComanda];

          if (oldRefundAmount > 0) {
            itemsToAdd.push({
              id: `refund-edit-${Date.now()}`,
              name: `Estorno (Edição): ${medicationName} (${oldUnadministeredCount} doses)`,
              type: 'product' as const,
              price: -Math.abs(oldRefundAmount),
              quantity: 1,
            });
          }

          itemsToAdd.push(newBillingItem);

          newComandas = {
            ...s.comandas,
            [tutorId]: itemsToAdd,
          };

          return {
            hospitalizations: newHospitalizations,
            comandas: newComandas,
          };
        }),
    })
);
