// ============================
// MVPet — Core Types
// ============================

export type BusinessPlan = 'petshop' | 'clinic' | 'office' | 'complete';

export type Species = 'dog' | 'cat' | 'bird' | 'reptile' | 'rodent' | 'exotic';

export type Sex = 'male' | 'female';

export type TriageLevel = 'emergency' | 'very-urgent' | 'urgent' | 'minor' | 'routine';

export type AppointmentStatus = 'scheduled' | 'waiting' | 'in-progress' | 'completed' | 'cancelled';

export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash' | 'transfer' | 'mixed';

export type InvoiceType = 'nfc-e' | 'nf-e' | 'nfs-e';

export type InvoiceStatus = 'pending' | 'issued' | 'cancelled';

export type TransportStatus = 'waiting-pickup' | 'on-the-way-pet' | 'at-shop' | 'ready-delivery' | 'delivered';

export type StockAlertType = 'low-stock' | 'expiring' | 'expired' | 'ok';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  birthDate: string;
  sex: Sex;
  neutered: boolean;
  weight: number;
  color: string;
  microchip?: string;
  photo?: string;
  tutorId: string;
  isAggressive: boolean;
  allergies: string[];
  notes?: string;
  isVolunteer?: boolean;
  createdAt: string;
}

export interface Tutor {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: Address;
  isSubscriber: boolean;
  subscriptionPlanId?: string;
  hasDebt: boolean;
  tags: string[];
  petIds: string[];
  createdAt: string;
  credits?: number;
  blockedByDebt?: boolean;
  financialHistory?: TutorFinancialRecord[];
}

export interface TutorFinancialRecord {
  id: string;
  type: 'invoice' | 'receipt' | 'credit_deposit' | 'debt_alert';
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Appointment {
  id: string;
  petId: string;
  tutorId: string;
  professionalName: string;
  type: 'consultation' | 'surgery' | 'grooming' | 'vaccine' | 'exam' | 'return';
  sector: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: AppointmentStatus;
  triageLevel?: TriageLevel;
  notes?: string;
  services: ServiceItem[];
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  appointmentId: string;
  veterinarianName: string;
  date: string;
  chiefComplaint: string;
  hma: HistoryOfPresentIllness;
  feeding: FeedingHabits;
  medicalHistory: MedicalHistory;
  systemReview: SystemReview;
  conduct: string;
  observations: string;
  nextReturn?: string;
  prescriptions: Prescription[];
  createdAt: string;
}

export interface HistoryOfPresentIllness {
  onset: string;
  evolution: string;
  intensity: string;
  frequency: string;
  associatedSymptoms: string;
  aggravatingFactors: string;
  relievingFactors: string;
  previousTreatments: string;
  behaviorImpact: string;
}

export interface FeedingHabits {
  foodType: string;
  mealFrequency: string;
  waterIntake: string;
  fecesChanges: string;
  urineChanges: string;
}

export interface MedicalHistory {
  previousDiseases: string;
  previousSurgeries: string;
  currentMedications: string;
  vaccinationStatus: 'up-to-date' | 'pending' | 'overdue';
  knownAllergies: string;
}

export interface SystemReview {
  respiratory: { checked: boolean; notes: string };
  cardiovascular: { checked: boolean; notes: string };
  gastrointestinal: { checked: boolean; notes: string };
  neurological: { checked: boolean; notes: string };
  dermatological: { checked: boolean; notes: string };
  ophthalmic: { checked: boolean; notes: string };
  musculoskeletal: { checked: boolean; notes: string };
  urogenital: { checked: boolean; notes: string };
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Hospitalization {
  id: string;
  petId: string;
  bedNumber: number;
  admissionDate: string;
  dischargeDate?: string;
  triageLevel: TriageLevel;
  reason: string;
  veterinarianName: string;
  status: 'active' | 'discharged' | 'transferred';
  medications: MedicationSchedule[];
  evolution: EvolutionNote[];
  bedCostPerDay?: number;
  lastDailyRateChargedAt?: string;
  dischargeRecommendations?: string;
  dischargeReport?: string;
  isAccountFrozen?: boolean;
}

export interface MedicationSchedule {
  id: string;
  medication: string;
  dosage: string;
  route: string;
  times: MedicationTime[];
  billingItemId?: string;
  pricePerUnit?: number;
  status?: 'active' | 'suspended' | 'completed';
  productId?: string;
  frequencyHours?: number;
  doseValue?: number;
  durationDays?: number;
  pendingDoses?: number;
}

export interface MedicationTime {
  hour: string;
  administered: boolean;
  administeredAt?: string;
  administeredBy?: string;
  delayJustification?: string;
}

export interface EvolutionNote {
  id: string;
  date: string;
  time: string;
  note: string;
  author: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'medication' | 'food' | 'hygiene' | 'accessory' | 'surgical' | 'vaccine';
  sku: string;
  price: number;
  costPrice: number;
  quantity: number;
  minQuantity: number;
  expiryDate?: string;
  supplier?: string;
  alertType: StockAlertType;
  salesUnit?: string; // ex: 'ml', 'un', 'comprimido'
  conversionFactor?: number; // ex: 50 (50ml por frasco)
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  invoiceStatus?: InvoiceStatus;
  invoiceType?: InvoiceType;
  relatedAppointmentId?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  services: { name: string; quantity: number }[];
  discount: number;
  isActive: boolean;
  isFeatured?: boolean;
  highlightColor?: string;
}

export interface TransportOrder {
  id: string;
  petId: string;
  tutorId: string;
  status: TransportStatus;
  pickupAddress: string;
  deliveryAddress: string;
  driverName: string;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
}

export interface CommunicationMessage {
  id: string;
  tutorId: string;
  type: 'welcome' | 'vaccine-reminder' | 'return-reminder' | 'birthday' | 'promotion' | 'custom';
  channel: 'whatsapp' | 'email' | 'sms';
  message: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface SaaSClient {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  plan: BusinessPlan;
  status: 'active' | 'suspended' | 'trial';
  monthlyFee: number;
  registrationDate: string;
  nextBillingDate: string;
}

export interface SaaSInvoice {
  id: string;
  clientId: string;
  clientName: string;
  plan: BusinessPlan;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: PaymentMethod;
  paidAt?: string;
}

export interface ComandaItem {
  id: string;
  name: string;
  type: 'product' | 'service';
  price: number;
  quantity: number;
}

export interface Commission {
  id: string;
  employeeName: string;
  transactionId?: string;
  serviceDescription: string;
  saleAmount: number;
  commissionRate: number; // percentage 0-100
  commissionValue: number;
  date: string;
  status: 'pending' | 'paid';
}

export type VaccineType = 'V8' | 'V10' | 'Raiva' | 'Gripe' | 'Giardia' | 'Antirrábica' | 'Vermífugo' | 'Outro';

export interface VaccinationRecord {
  id: string;
  petId: string;
  vaccineName: string;
  vaccineType: VaccineType;
  applicationDate: string;
  nextDoseDate?: string;
  veterinarianName: string;
  lot?: string;
  manufacturer?: string;
  notes?: string;
}

export interface SavedMedicalRecord {
  id: string;
  petId: string;
  date: string;
  veterinarianName: string;
  chiefComplaint: string;
  conduct: string;
  observations: string;
  nextReturn?: string;
  prescriptions: Prescription[];
  createdAt: string;
}

