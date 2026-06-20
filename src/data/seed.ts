import type { Pet, Tutor, Appointment, Product, Hospitalization, Transaction, TransportOrder, SubscriptionPlan } from '../types';

// ========== TUTORS ==========
export const seedTutors: Tutor[] = [
  { id: 't1', name: 'Maria Silva', cpf: '123.456.789-00', email: 'maria@email.com', phone: '(11) 98765-4321', whatsapp: '11987654321', address: { street: 'Rua das Flores', number: '123', neighborhood: 'Jardim Primavera', city: 'São Paulo', state: 'SP', zipCode: '01234-567' }, isSubscriber: true, subscriptionPlanId: 'sp1', hasDebt: false, tags: ['VIP', 'Assinante'], petIds: ['p1', 'p2'], createdAt: '2025-01-15', credits: 500, blockedByDebt: true, financialHistory: [{ id: 'f1', type: 'credit_deposit', description: 'Depósito Calção Internação', amount: 500, date: '2026-05-17', status: 'paid' }] },
  { id: 't2', name: 'João Santos', cpf: '987.654.321-00', email: 'joao@email.com', phone: '(11) 91234-5678', whatsapp: '11912345678', address: { street: 'Av. Paulista', number: '456', complement: 'Apto 12', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', zipCode: '01310-100' }, isSubscriber: false, hasDebt: true, tags: ['Devedor'], petIds: ['p3'], createdAt: '2025-03-20', credits: 0, blockedByDebt: true, financialHistory: [{ id: 'f2', type: 'invoice', description: 'Consulta Veterinária em Atraso', amount: 150, date: '2026-04-10', status: 'overdue' }] },
  { id: 't3', name: 'Ana Oliveira', cpf: '456.789.123-00', email: 'ana@email.com', phone: '(11) 99876-5432', whatsapp: '11998765432', address: { street: 'Rua Augusta', number: '789', neighborhood: 'Consolação', city: 'São Paulo', state: 'SP', zipCode: '01305-100' }, isSubscriber: true, subscriptionPlanId: 'sp2', hasDebt: false, tags: ['VIP', 'Assinante'], petIds: ['p4', 'p5'], createdAt: '2024-11-10', credits: 0, blockedByDebt: true, financialHistory: [] },
  { id: 't4', name: 'Carlos Mendes', cpf: '321.654.987-00', email: 'carlos@email.com', phone: '(11) 95555-1234', whatsapp: '11955551234', address: { street: 'Rua Oscar Freire', number: '321', neighborhood: 'Pinheiros', city: 'São Paulo', state: 'SP', zipCode: '05409-010' }, isSubscriber: false, hasDebt: false, tags: ['Novo'], petIds: ['p6'], createdAt: '2026-04-01', credits: 0, blockedByDebt: true, financialHistory: [] },
  { id: 't5', name: 'Fernanda Costa', cpf: '654.321.987-00', email: 'fernanda@email.com', phone: '(11) 94444-5678', whatsapp: '11944445678', address: { street: 'Rua Harmonia', number: '55', neighborhood: 'Vila Madalena', city: 'São Paulo', state: 'SP', zipCode: '05435-000' }, isSubscriber: false, hasDebt: false, tags: [], petIds: ['p7', 'p8'], createdAt: '2025-08-15', credits: 0, blockedByDebt: true, financialHistory: [] },
  { id: 't6', name: 'Roberto Lima', cpf: '789.123.456-00', email: 'roberto@email.com', phone: '(11) 93333-9876', whatsapp: '11933339876', address: { street: 'Alameda Santos', number: '1000', complement: 'Sala 5', neighborhood: 'Cerqueira César', city: 'São Paulo', state: 'SP', zipCode: '01418-100' }, isSubscriber: true, subscriptionPlanId: 'sp1', hasDebt: false, tags: ['Assinante'], petIds: ['p9', 'p10'], createdAt: '2025-06-20', credits: 0, blockedByDebt: true, financialHistory: [] },
];

// ========== PETS ==========
export const seedPets: Pet[] = [
  { id: 'p1', name: 'Thor', species: 'dog', breed: 'Golden Retriever', birthDate: '2022-03-15', sex: 'male', neutered: true, weight: 32, color: 'Dourado', tutorId: 't1', isAggressive: false, allergies: [], createdAt: '2025-01-15' },
  { id: 'p2', name: 'Mel', species: 'cat', breed: 'Siamês', birthDate: '2023-07-20', sex: 'female', neutered: true, weight: 4.2, color: 'Creme e Marrom', tutorId: 't1', isAggressive: false, allergies: ['Frango'], createdAt: '2025-01-15' },
  { id: 'p3', name: 'Rex', species: 'dog', breed: 'Pastor Alemão', birthDate: '2021-01-10', sex: 'male', neutered: false, weight: 38, color: 'Preto e Marrom', tutorId: 't2', isAggressive: true, allergies: [], notes: 'Usar focinheira durante atendimento', createdAt: '2025-03-20' },
  { id: 'p4', name: 'Luna', species: 'cat', breed: 'Persa', birthDate: '2023-11-05', sex: 'female', neutered: true, weight: 3.8, color: 'Branco', tutorId: 't3', isAggressive: false, allergies: ['Dipirona'], createdAt: '2024-11-10' },
  { id: 'p5', name: 'Simba', species: 'dog', breed: 'Shih Tzu', birthDate: '2024-02-14', sex: 'male', neutered: false, weight: 6.5, color: 'Branco e Caramelo', tutorId: 't3', isAggressive: false, allergies: [], createdAt: '2024-11-10' },
  { id: 'p6', name: 'Pipoca', species: 'bird', breed: 'Calopsita', birthDate: '2024-06-01', sex: 'female', neutered: false, weight: 0.09, color: 'Cinza e Amarelo', tutorId: 't4', isAggressive: false, allergies: [], createdAt: '2026-04-01' },
  { id: 'p7', name: 'Bob', species: 'dog', breed: 'Bulldog Francês', birthDate: '2023-09-10', sex: 'male', neutered: true, weight: 12, color: 'Tigrado', tutorId: 't5', isAggressive: false, allergies: ['Amoxicilina'], createdAt: '2025-08-15' },
  { id: 'p8', name: 'Nina', species: 'cat', breed: 'Maine Coon', birthDate: '2022-12-25', sex: 'female', neutered: true, weight: 6.8, color: 'Cinza Tabby', tutorId: 't5', isAggressive: false, allergies: [], createdAt: '2025-08-15' },
  { id: 'p9', name: 'Zeus', species: 'dog', breed: 'Rottweiler', birthDate: '2021-05-20', sex: 'male', neutered: true, weight: 45, color: 'Preto e Castanho', tutorId: 't6', isAggressive: true, allergies: [], notes: 'Cuidado no manejo', createdAt: '2025-06-20' },
  { id: 'p10', name: 'Mia', species: 'dog', breed: 'Poodle', birthDate: '2024-08-30', sex: 'female', neutered: false, weight: 5, color: 'Branco', tutorId: 't6', isAggressive: false, allergies: [], createdAt: '2025-06-20' },
];

// ========== TODAY HELPER ==========
const today = new Date().toISOString().split('T')[0]!;
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]!;

// ========== APPOINTMENTS ==========
export const seedAppointments: Appointment[] = [
  { id: 'a1', petId: 'p1', tutorId: 't1', professionalName: 'Dra. Camila Rocha', type: 'consultation', sector: 'Consultório 1', date: today, startTime: '09:00', status: 'completed', notes: 'Check-up rotina', services: [{ id: 's1', name: 'Consulta', price: 150, quantity: 1 }], createdAt: today },
  { id: 'a2', petId: 'p3', tutorId: 't2', professionalName: 'Dr. Rafael Souza', type: 'consultation', sector: 'Consultório 2', date: today, startTime: '10:00', status: 'in-progress', triageLevel: 'urgent', notes: 'Claudicação MDE', services: [{ id: 's2', name: 'Consulta', price: 150, quantity: 1 }, { id: 's3', name: 'Raio-X', price: 120, quantity: 1 }], createdAt: today },
  { id: 'a3', petId: 'p5', tutorId: 't3', professionalName: 'Tosador Lucas', type: 'grooming', sector: 'Banho e Tosa', date: today, startTime: '10:30', status: 'waiting', services: [{ id: 's4', name: 'Banho + Tosa Higiênica', price: 80, quantity: 1 }], createdAt: today },
  { id: 'a4', petId: 'p4', tutorId: 't3', professionalName: 'Dra. Camila Rocha', type: 'vaccine', sector: 'Consultório 1', date: today, startTime: '14:00', status: 'scheduled', services: [{ id: 's5', name: 'V10', price: 90, quantity: 1 }], createdAt: today },
  { id: 'a5', petId: 'p7', tutorId: 't5', professionalName: 'Dr. Rafael Souza', type: 'return', sector: 'Consultório 2', date: today, startTime: '15:00', status: 'scheduled', services: [{ id: 's6', name: 'Retorno', price: 0, quantity: 1 }], createdAt: today },
  { id: 'a6', petId: 'p10', tutorId: 't6', professionalName: 'Tosadora Juliana', type: 'grooming', sector: 'Banho e Tosa', date: today, startTime: '11:00', status: 'scheduled', services: [{ id: 's7', name: 'Banho Completo', price: 60, quantity: 1 }], createdAt: today },
  { id: 'a7', petId: 'p2', tutorId: 't1', professionalName: 'Dra. Camila Rocha', type: 'exam', sector: 'Consultório 1', date: tomorrow, startTime: '09:30', status: 'scheduled', services: [{ id: 's8', name: 'Hemograma', price: 80, quantity: 1 }], createdAt: today },
  { id: 'a8', petId: 'p9', tutorId: 't6', professionalName: 'Dr. Rafael Souza', type: 'consultation', sector: 'Consultório 2', date: tomorrow, startTime: '11:00', status: 'scheduled', triageLevel: 'minor', services: [{ id: 's9', name: 'Consulta', price: 150, quantity: 1 }], createdAt: today },
];

// ========== PRODUCTS ==========
export const seedProducts: Product[] = [
  { id: 'pr1', name: 'Ração Royal Canin Medium Adult 15kg', category: 'food', sku: 'RC-MED-15', price: 289.90, costPrice: 210, quantity: 12, minQuantity: 5, expiryDate: '2027-03-15', alertType: 'ok' },
  { id: 'pr2', name: 'Vacina V10 Nobivac', category: 'vaccine', sku: 'VAC-V10', price: 90, costPrice: 45, quantity: 3, minQuantity: 10, expiryDate: '2026-08-20', alertType: 'low-stock' },
  { id: 'pr3', name: 'Shampoo Antipulgas Virbac', category: 'hygiene', sku: 'SH-APV', price: 45.90, costPrice: 25, quantity: 25, minQuantity: 8, expiryDate: '2027-01-10', alertType: 'ok' },
  { id: 'pr4', name: 'Ceftriaxona 1g Injetável', category: 'medication', sku: 'MED-CFT', price: 35, costPrice: 18, quantity: 8, minQuantity: 5, expiryDate: '2026-06-30', alertType: 'expiring', salesUnit: 'ml', conversionFactor: 10 },
  { id: 'pr5', name: 'Coleira Antipulgas Seresto', category: 'accessory', sku: 'COL-SER', price: 199.90, costPrice: 130, quantity: 0, minQuantity: 3, alertType: 'low-stock' },
  { id: 'pr6', name: 'Ração Whiskas Sachê Carne', category: 'food', sku: 'WH-SC-C', price: 4.50, costPrice: 2.80, quantity: 45, minQuantity: 20, expiryDate: '2026-12-01', alertType: 'ok' },
  { id: 'pr7', name: 'Dipirona Gotas 20ml', category: 'medication', sku: 'MED-DIP', price: 22, costPrice: 8, quantity: 15, minQuantity: 5, expiryDate: '2026-07-15', alertType: 'expiring', salesUnit: 'gotas', conversionFactor: 400 },
  { id: 'pr8', name: 'Fio Sutura Nylon 3-0', category: 'surgical', sku: 'CIR-FSN', price: 12, costPrice: 5, quantity: 40, minQuantity: 10, expiryDate: '2028-01-01', alertType: 'ok' },
  { id: 'pr9', name: 'Ração Premier Filhotes 10kg', category: 'food', sku: 'PM-FIL-10', price: 199.90, costPrice: 140, quantity: 7, minQuantity: 4, expiryDate: '2027-06-20', alertType: 'ok' },
  { id: 'pr10', name: 'Amoxicilina 250mg Comprimidos', category: 'medication', sku: 'MED-AMX', price: 28, costPrice: 12, quantity: 2, minQuantity: 5, expiryDate: '2026-09-10', alertType: 'low-stock', salesUnit: 'comprimido', conversionFactor: 10 },
];

// ========== HOSPITALIZATIONS ==========
export const seedHospitalizations: Hospitalization[] = [
  {
    id: 'h1', petId: 'p3', bedNumber: 1, admissionDate: today, triageLevel: 'very-urgent', reason: 'Fratura na pata dianteira esquerda', veterinarianName: 'Dr. Rafael Souza', status: 'active',
    medications: [
      { id: 'ms1', medication: 'Ceftriaxona 30mg/kg', dosage: '1140mg', route: 'IV', times: [{ hour: '08:00', administered: true, administeredAt: '08:05', administeredBy: 'Dr. Rafael' }, { hour: '14:00', administered: false }, { hour: '20:00', administered: false }] },
      { id: 'ms2', medication: 'Meloxicam 0.1mg/kg', dosage: '3.8mg', route: 'SC', times: [{ hour: '08:00', administered: true, administeredAt: '08:10', administeredBy: 'Dr. Rafael' }, { hour: '20:00', administered: false }] },
    ],
    evolution: [{ id: 'ev1', date: today, time: '08:15', note: 'Pet estável, alimentou-se normalmente. Edema reduzindo.', author: 'Dr. Rafael Souza' }],
    bedCostPerDay: 150,
    lastDailyRateChargedAt: `${today}T11:00:00`
  },
  {
    id: 'h2', petId: 'p9', bedNumber: 3, admissionDate: today, triageLevel: 'urgent', reason: 'Intoxicação alimentar', veterinarianName: 'Dra. Camila Rocha', status: 'active',
    medications: [
      { id: 'ms3', medication: 'Ondansetrona 0.5mg/kg', dosage: '22.5mg', route: 'IV', times: [{ hour: '06:00', administered: true, administeredAt: '06:10', administeredBy: 'Dra. Camila' }, { hour: '12:00', administered: false }, { hour: '18:00', administered: false }] },
      { id: 'ms4', medication: 'Fluidoterapia NaCl 0.9%', dosage: '500ml', route: 'IV contínuo', times: [{ hour: '06:00', administered: true, administeredAt: '06:00', administeredBy: 'Dra. Camila' }] },
    ],
    evolution: [{ id: 'ev2', date: today, time: '06:20', note: 'Vômitos cessaram após medicação. Manter observação.', author: 'Dra. Camila Rocha' }],
    bedCostPerDay: 120,
    lastDailyRateChargedAt: `${today}T11:00:00`
  },
];

// ========== TRANSACTIONS ==========
export const seedTransactions: Transaction[] = [
  { id: 'tr1', type: 'income', category: 'Consulta', description: 'Consulta Thor - Maria Silva', amount: 150, paymentMethod: 'pix', date: today, invoiceStatus: 'issued', invoiceType: 'nfs-e' },
  { id: 'tr2', type: 'income', category: 'Banho e Tosa', description: 'Banho Simba - Ana Oliveira', amount: 80, paymentMethod: 'credit', date: today, invoiceStatus: 'pending', invoiceType: 'nfc-e' },
  { id: 'tr3', type: 'expense', category: 'Fornecedor', description: 'Compra ração Royal Canin', amount: 2520, paymentMethod: 'transfer', date: today },
  { id: 'tr4', type: 'income', category: 'Produto', description: 'Coleira Seresto - Fernanda Costa', amount: 199.90, paymentMethod: 'debit', date: today, invoiceStatus: 'issued', invoiceType: 'nfc-e' },
  { id: 'tr5', type: 'income', category: 'Consulta', description: 'Consulta Bob - Fernanda Costa', amount: 150, paymentMethod: 'pix', date: today },
  { id: 'tr6', type: 'expense', category: 'Despesa Fixa', description: 'Aluguel do estabelecimento', amount: 4500, paymentMethod: 'transfer', date: today },
];

// ========== TRANSPORT ORDERS ==========
export const seedTransportOrders: TransportOrder[] = [
  { id: 'to1', petId: 'p5', tutorId: 't3', status: 'at-shop', pickupAddress: 'Rua Augusta, 789', deliveryAddress: 'Rua Augusta, 789', driverName: 'Pedro Motorista', scheduledDate: today, scheduledTime: '10:00' },
  { id: 'to2', petId: 'p10', tutorId: 't6', status: 'waiting-pickup', pickupAddress: 'Alameda Santos, 1000', deliveryAddress: 'Alameda Santos, 1000', driverName: 'Pedro Motorista', scheduledDate: today, scheduledTime: '10:30' },
  { id: 'to3', petId: 'p1', tutorId: 't1', status: 'delivered', pickupAddress: 'Rua das Flores, 123', deliveryAddress: 'Rua das Flores, 123', driverName: 'Pedro Motorista', scheduledDate: today, scheduledTime: '08:00' },
];

// ========== SUBSCRIPTION PLANS ==========
export const seedSubscriptionPlans: SubscriptionPlan[] = [
  { id: 'sp1', name: 'Plano VIP Gold', description: '4 banhos/mês + 1 consulta + 10% desc. em ração', price: 189.90, services: [{ name: 'Banho', quantity: 4 }, { name: 'Consulta', quantity: 1 }], discount: 10, isActive: true, highlightColor: 'gold' },
  { id: 'sp2', name: 'Plano Saúde Pet', description: '2 consultas/mês + vacinas inclusas', price: 249.90, services: [{ name: 'Consulta', quantity: 2 }, { name: 'Vacina', quantity: 1 }], discount: 15, isActive: true },
  { id: 'sp3', name: 'Plano Básico', description: '2 banhos/mês + 5% desc. em produtos', price: 79.90, services: [{ name: 'Banho', quantity: 2 }], discount: 5, isActive: true },
];

// ========== WEEKLY REVENUE DATA ==========
export const weeklyRevenueData = [
  { day: 'Seg', revenue: 2350, expenses: 800 },
  { day: 'Ter', revenue: 1890, expenses: 450 },
  { day: 'Qua', revenue: 3100, expenses: 1200 },
  { day: 'Qui', revenue: 2780, expenses: 600 },
  { day: 'Sex', revenue: 4200, expenses: 900 },
  { day: 'Sáb', revenue: 5100, expenses: 300 },
  { day: 'Dom', revenue: 890, expenses: 150 },
];

// ========== COMMISSIONS ==========
import type { Commission } from '../types';

const thisMonth = new Date().toISOString().slice(0, 7);
const d = (day: number) => `${thisMonth}-${String(day).padStart(2, '0')}`;

export const seedCommissions: Commission[] = [
  { id: 'c1', employeeName: 'Dra. Camila Rocha', serviceDescription: 'Consulta Thor - Maria Silva', saleAmount: 150, commissionRate: 10, commissionValue: 15, date: d(2), status: 'paid', transactionId: 'tr1' },
  { id: 'c2', employeeName: 'Dr. Rafael Souza', serviceDescription: 'Consulta Rex + Raio-X - João Santos', saleAmount: 270, commissionRate: 10, commissionValue: 27, date: d(3), status: 'paid', transactionId: 'tr5' },
  { id: 'c3', employeeName: 'Tosador Lucas', serviceDescription: 'Banho + Tosa Simba - Ana Oliveira', saleAmount: 80, commissionRate: 40, commissionValue: 32, date: d(5), status: 'pending' },
  { id: 'c4', employeeName: 'Dra. Camila Rocha', serviceDescription: 'Vacina V10 Luna - Ana Oliveira', saleAmount: 90, commissionRate: 10, commissionValue: 9, date: d(5), status: 'pending' },
  { id: 'c5', employeeName: 'Tosadora Juliana', serviceDescription: 'Banho Mia - Roberto Lima', saleAmount: 60, commissionRate: 40, commissionValue: 24, date: d(7), status: 'pending' },
  { id: 'c6', employeeName: 'Dr. Rafael Souza', serviceDescription: 'Consulta Zeus + Hemograma - Roberto Lima', saleAmount: 230, commissionRate: 10, commissionValue: 23, date: d(8), status: 'pending' },
  { id: 'c7', employeeName: 'Dra. Camila Rocha', serviceDescription: 'Consulta Bob - Fernanda Costa', saleAmount: 150, commissionRate: 10, commissionValue: 15, date: d(10), status: 'paid' },
  { id: 'c8', employeeName: 'Tosador Lucas', serviceDescription: 'Banho Thor - Maria Silva', saleAmount: 80, commissionRate: 40, commissionValue: 32, date: d(12), status: 'paid' },
  { id: 'c9', employeeName: 'Dra. Camila Rocha', serviceDescription: 'Cirurgia castração Rex - João Santos', saleAmount: 450, commissionRate: 8, commissionValue: 36, date: d(14), status: 'pending' },
  { id: 'c10', employeeName: 'Dr. Rafael Souza', serviceDescription: 'Consulta Nina - Fernanda Costa', saleAmount: 150, commissionRate: 10, commissionValue: 15, date: d(15), status: 'pending' },
];

// ========== VACCINATIONS ==========
import type { VaccinationRecord } from '../types';

export const seedVaccinations: VaccinationRecord[] = [
  { id: 'v1', petId: 'p1', vaccineName: 'Vacina V10 Nobivac', vaccineType: 'V10', applicationDate: '2026-02-10', nextDoseDate: '2027-02-10', veterinarianName: 'Dra. Camila Rocha', lot: 'LOT-2024-V10', manufacturer: 'MSD Animal Health' },
  { id: 'v2', petId: 'p1', vaccineName: 'Antirrábica', vaccineType: 'Antirrábica', applicationDate: '2026-02-10', nextDoseDate: '2027-02-10', veterinarianName: 'Dra. Camila Rocha', lot: 'LOT-2024-RAB', manufacturer: 'Zoetis' },
  { id: 'v3', petId: 'p1', vaccineName: 'Vermífugo Drontal Plus', vaccineType: 'Vermífugo', applicationDate: '2026-01-15', nextDoseDate: '2026-07-15', veterinarianName: 'Dra. Camila Rocha' },
  { id: 'v4', petId: 'p2', vaccineName: 'Vacina V10 Nobivac', vaccineType: 'V10', applicationDate: '2025-11-05', nextDoseDate: '2026-11-05', veterinarianName: 'Dra. Camila Rocha', lot: 'LOT-2024-V10' },
  { id: 'v5', petId: 'p3', vaccineName: 'Vacina V8', vaccineType: 'V8', applicationDate: '2025-08-20', nextDoseDate: '2026-08-20', veterinarianName: 'Dr. Rafael Souza', lot: 'LOT-2024-V8' },
  { id: 'v6', petId: 'p4', vaccineName: 'Vacina V10 Nobivac', vaccineType: 'V10', applicationDate: '2026-04-15', nextDoseDate: '2027-04-15', veterinarianName: 'Dra. Camila Rocha', lot: 'LOT-2025-V10' },
  { id: 'v7', petId: 'p5', vaccineName: 'Antirrábica', vaccineType: 'Antirrábica', applicationDate: '2026-03-01', nextDoseDate: '2027-03-01', veterinarianName: 'Dra. Camila Rocha' },
  { id: 'v8', petId: 'p7', vaccineName: 'Vacina V10 Nobivac', vaccineType: 'V10', applicationDate: '2025-06-10', nextDoseDate: '2026-06-10', veterinarianName: 'Dr. Rafael Souza', notes: 'Pet com histórico de reação leve — observar por 30min após aplicação' },
  { id: 'v9', petId: 'p9', vaccineName: 'Vacina V8', vaccineType: 'V8', applicationDate: '2026-01-20', nextDoseDate: '2027-01-20', veterinarianName: 'Dr. Rafael Souza', lot: 'LOT-2025-V8' },
];

