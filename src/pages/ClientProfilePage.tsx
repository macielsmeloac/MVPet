import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import type { ComandaItem, Pet } from '../types';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Star, AlertTriangle, Edit3, Save, X,
  PawPrint, Plus, ShoppingCart, ClipboardList, Syringe, Calendar,
  Wallet, History, Bed, ChevronRight, ReceiptText, Trash2, Lock,
  PlusCircle, CheckCircle, ShieldAlert, DollarSign
} from 'lucide-react';

const servicePresets = [
  { name: 'Consulta Clínica Veterinária', price: 120.00 },
  { name: 'Consulta Especialista', price: 180.00 },
  { name: 'Banho Completo (Porte P)', price: 50.00 },
  { name: 'Banho & Tosa Higiênica', price: 80.00 },
  { name: 'Vacina Múltipla V10', price: 90.00 },
  { name: 'Vacina Antirrábica', price: 60.00 },
  { name: 'Exame Hemograma', price: 80.00 },
  { name: 'Diária de Internação', price: 150.00 },
];

const productPresets = [
  { name: 'Antipulgas Bravecto 10-20kg', price: 165.00 },
  { name: 'Vermífugo Drontal Plus', price: 42.00 },
  { name: 'Ração Royal Canin 2kg', price: 110.05 },
  { name: 'Shampoo Hipoalergênico', price: 75.00 },
];

type Tab = 'overview' | 'pets' | 'comanda' | 'history' | 'appointments';

export function ClientProfilePage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const {
    tutors, pets, appointments, vaccinations, medicalRecords, hospitalizations,
    comandas, addItemToComanda, removeItemFromComanda, clearComanda,
    addPet, updatePet, updateTutorDebtStatus, depositTutorCredits, subscriptionPlans
  } = useDataStore();

  const tutor = tutors.find(t => t.id === tutorId);
  const tutorPets = pets.filter(p => p.tutorId === tutorId);
  const tutorAppointments = appointments.filter(a => a.tutorId === tutorId).sort((a, b) => b.date.localeCompare(a.date));
  const activeComanda = tutorId ? (comandas[tutorId] || []) : [];

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Edit client state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editNeigh, setEditNeigh] = useState('');
  const [editCity, setEditCity] = useState('');

  // Add pet state
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'dog' | 'cat' | 'bird' | 'exotic'>('dog');
  const [newPetSex, setNewPetSex] = useState<'male' | 'female'>('male');
  const [newPetBirth, setNewPetBirth] = useState('');
  const [newPetWeight, setNewPetWeight] = useState(5);

  // Edit pet state
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [editPetName, setEditPetName] = useState('');
  const [editPetBreed, setEditPetBreed] = useState('');
  const [editPetWeight, setEditPetWeight] = useState(0);
  const [editPetNotes, setEditPetNotes] = useState('');

  // Comanda state
  const [itemType, setItemType] = useState<'product' | 'service'>('service');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState(0);
  const [itemQty, setItemQty] = useState(1);
  const [presetVal, setPresetVal] = useState('');

  // Deposit state
  const [depositAmount, setDepositAmount] = useState(0);

  if (!tutor) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-surface-500">
        <User className="w-16 h-16 text-surface-300" />
        <p>Cliente não encontrado.</p>
        <Link to="/crm" className="text-indigo-600 font-medium hover:underline">← Voltar para Clientes</Link>
      </div>
    );
  }

  const tutorPlan = tutor.isSubscriber && tutor.subscriptionPlanId
    ? subscriptionPlans.find(p => p.id === tutor.subscriptionPlanId)
    : null;

  const subtotal = activeComanda.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const discount = tutorPlan
    ? activeComanda.filter(i => i.type === 'product').reduce((acc, i) => acc + i.price * i.quantity * (tutorPlan.discount / 100), 0)
    : 0;
  const total = subtotal - discount;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStartEdit = () => {
    setEditName(tutor.name);
    setEditPhone(tutor.phone);
    setEditEmail(tutor.email);
    setEditStreet(tutor.address.street);
    setEditNumber(tutor.address.number);
    setEditNeigh(tutor.address.neighborhood);
    setEditCity(tutor.address.city);
    setIsEditing(true);
  };

  // NOTE: useDataStore doesn't expose updateTutor yet, so we alert
  const handleSaveEdit = () => {
    alert('Edição salva! (Para persistência completa, a função updateTutor pode ser adicionada ao store)');
    setIsEditing(false);
  };

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) return;
    if (tutor.hasDebt) {
      alert('🔒 BLOQUEADO: Regularize os débitos antes de cadastrar novos pets.');
      return;
    }
    const pet: Pet = {
      id: `p-${Date.now()}`,
      name: newPetName,
      species: newPetSpecies,
      breed: newPetBreed || 'SRD',
      birthDate: newPetBirth || '2024-01-01',
      sex: newPetSex,
      neutered: false,
      weight: newPetWeight,
      color: 'Outra',
      tutorId: tutor.id,
      isAggressive: false,
      allergies: [],
      createdAt: new Date().toISOString().split('T')[0]!,
    };
    addPet(pet);
    setShowAddPet(false);
    setNewPetName('');
    setNewPetBreed('');
  };

  const handleStartEditPet = (pet: Pet) => {
    setEditingPetId(pet.id);
    setEditPetName(pet.name);
    setEditPetBreed(pet.breed);
    setEditPetWeight(pet.weight);
    setEditPetNotes(pet.notes || '');
  };

  const handleSavePet = (petId: string) => {
    updatePet(petId, { name: editPetName, breed: editPetBreed, weight: editPetWeight, notes: editPetNotes });
    setEditingPetId(null);
  };

  const handlePresetChange = (val: string) => {
    setPresetVal(val);
    const list = itemType === 'service' ? servicePresets : productPresets;
    const found = list.find(p => p.name === val);
    if (found) { setItemName(found.name); setItemPrice(found.price); }
    else { setItemName(''); setItemPrice(0); }
  };

  const handleAddComandaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || itemPrice < 0) return;
    const item: ComandaItem = {
      id: `cmd-${Date.now()}`,
      name: itemName,
      type: itemType,
      price: Number(itemPrice),
      quantity: Number(itemQty),
    };
    addItemToComanda(tutor.id, item);
    setItemName(''); setItemPrice(0); setItemQty(1); setPresetVal('');
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;
    depositTutorCredits(tutor.id, depositAmount);
    setDepositAmount(0);
    alert(`💰 Depósito de R$ ${depositAmount.toFixed(2)} realizado!`);
  };

  const speciesLabel: Record<string, string> = {
    dog: '🐕 Cão', cat: '🐈 Gato', bird: '🦜 Ave', reptile: '🦎 Réptil',
    rodent: '🐭 Roedor', exotic: '🦜 Exótico'
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-surface-900 dark:text-surface-100';
  const labelCls = 'block text-xs font-semibold text-surface-500 mb-1';

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Dados', icon: <User className="w-4 h-4" /> },
    { id: 'pets', label: 'Pacientes', icon: <PawPrint className="w-4 h-4" />, count: tutorPets.length },
    { id: 'comanda', label: 'Nova Venda', icon: <ShoppingCart className="w-4 h-4" />, count: activeComanda.length || undefined },
    { id: 'history', label: 'Histórico', icon: <History className="w-4 h-4" /> },
    { id: 'appointments', label: 'Agenda', icon: <Calendar className="w-4 h-4" />, count: tutorAppointments.length || undefined },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-surface-500">
        <button onClick={() => navigate('/crm')} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Clientes
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-surface-900 dark:text-white font-semibold">{tutor.name}</span>
      </div>

      {/* Hero Card */}
      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400" />
        <div className="p-6 flex flex-col sm:flex-row gap-5 items-start">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-3xl font-black text-white">{tutor.name.charAt(0)}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-black text-surface-900 dark:text-white flex items-center gap-2">
                  {tutor.name}
                  {tutor.isSubscriber && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                  {tutor.hasDebt && <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />}
                </h1>
                <p className="text-sm text-surface-500 mt-0.5">CPF: {tutor.cpf} · Cliente desde {tutor.createdAt}</p>
              </div>
              <div className="flex items-center gap-2">
                {tutor.hasDebt ? (
                  <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Inadimplente
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Regular
                  </span>
                )}
                {tutorPlan && (
                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                    <Star className="w-3 h-3" /> {tutorPlan.name}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 mt-3">
              <a href={`tel:${tutor.phone}`} className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400 hover:text-indigo-600 transition-colors">
                <Phone className="w-3.5 h-3.5" /> {tutor.phone}
              </a>
              <a href={`mailto:${tutor.email}`} className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400 hover:text-indigo-600 transition-colors">
                <Mail className="w-3.5 h-3.5" /> {tutor.email}
              </a>
              <span className="flex items-center gap-1.5 text-sm text-surface-500">
                <MapPin className="w-3.5 h-3.5" /> {tutor.address.city} – {tutor.address.state}
              </span>
              {(tutor.credits ?? 0) > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-bold">
                  <Wallet className="w-3.5 h-3.5" /> Calção: R$ {(tutor.credits ?? 0).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 rounded-xl transition-colors"
            >
              <Edit3 className="w-4 h-4" /> Editar Cliente
            </button>
            <button
              onClick={() => { setActiveTab('comanda'); }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" /> Iniciar Venda
            </button>
            <button
              onClick={() => updateTutorDebtStatus(tutor.id, !tutor.hasDebt)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                tutor.hasDebt
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              {tutor.hasDebt ? 'Regularizar' : 'Marcar Devedor'}
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="border-t border-surface-200 dark:border-surface-700 px-6 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap relative ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-surface-500 hover:text-surface-800 dark:hover:text-surface-200'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: DADOS ─────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados Pessoais */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-surface-900 dark:text-white flex items-center gap-2"><User className="w-4 h-4 text-indigo-500" /> Dados Pessoais</h2>
              {!isEditing && <button onClick={handleStartEdit} className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1"><Edit3 className="w-3 h-3" /> Editar</button>}
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <div><label className={labelCls}>Nome</label><input className={inputCls} value={editName} onChange={e => setEditName(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Telefone</label><input className={inputCls} value={editPhone} onChange={e => setEditPhone(e.target.value)} /></div>
                  <div><label className={labelCls}>Email</label><input className={inputCls} value={editEmail} onChange={e => setEditEmail(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Rua</label><input className={inputCls} value={editStreet} onChange={e => setEditStreet(e.target.value)} /></div>
                  <div><label className={labelCls}>Número</label><input className={inputCls} value={editNumber} onChange={e => setEditNumber(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Bairro</label><input className={inputCls} value={editNeigh} onChange={e => setEditNeigh(e.target.value)} /></div>
                  <div><label className={labelCls}>Cidade</label><input className={inputCls} value={editCity} onChange={e => setEditCity(e.target.value)} /></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSaveEdit} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">
                    <Save className="w-4 h-4" /> Salvar
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg">Cancelar</button>
                </div>
              </div>
            ) : (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-surface-500">CPF</dt><dd className="font-medium text-surface-900 dark:text-white">{tutor.cpf}</dd></div>
                <div className="flex justify-between"><dt className="text-surface-500">Telefone</dt><dd className="font-medium text-surface-900 dark:text-white">{tutor.phone}</dd></div>
                <div className="flex justify-between"><dt className="text-surface-500">Email</dt><dd className="font-medium text-surface-900 dark:text-white truncate max-w-[200px]">{tutor.email}</dd></div>
                <div className="flex justify-between"><dt className="text-surface-500">Endereço</dt><dd className="font-medium text-surface-900 dark:text-white text-right">{tutor.address.street}, {tutor.address.number}</dd></div>
                <div className="flex justify-between"><dt className="text-surface-500">Bairro / Cidade</dt><dd className="font-medium text-surface-900 dark:text-white">{tutor.address.neighborhood}, {tutor.address.city}</dd></div>
                <div className="flex justify-between"><dt className="text-surface-500">Tags</dt><dd className="flex gap-1 flex-wrap">{tutor.tags.map(t => <span key={t} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full">{t}</span>)}</dd></div>
              </dl>
            )}
          </div>

          {/* Calção / Depósito */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
              <h2 className="font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-4"><Wallet className="w-4 h-4 text-emerald-500" /> Calção / Crédito</h2>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 mb-4 text-center">
                <p className="text-xs text-emerald-600 font-semibold mb-1">Saldo Disponível</p>
                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">R$ {(tutor.credits ?? 0).toFixed(2)}</p>
              </div>
              <form onSubmit={handleDeposit} className="flex gap-2">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={depositAmount || ''}
                  onChange={e => setDepositAmount(Number(e.target.value))}
                  placeholder="Valor do depósito"
                  className={inputCls + ' flex-1'}
                />
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm whitespace-nowrap transition-colors">
                  + Depositar
                </button>
              </form>
            </div>

            {/* Pets resumo rápido */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-surface-900 dark:text-white flex items-center gap-2"><PawPrint className="w-4 h-4 text-indigo-500" /> Pacientes</h2>
                <button onClick={() => setActiveTab('pets')} className="text-xs text-indigo-600 hover:underline">Ver todos</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tutorPets.length === 0 ? (
                  <p className="text-sm text-surface-400 italic">Nenhum paciente cadastrado.</p>
                ) : (
                  tutorPets.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActiveTab('pets')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                    >
                      {p.species === 'dog' ? '🐕' : p.species === 'cat' ? '🐈' : '🦜'} {p.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: PACIENTES ─────────────────────────────────────── */}
      {activeTab === 'pets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-surface-900 dark:text-white">Pacientes de {tutor.name}</h2>
            <button
              onClick={() => setShowAddPet(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Cadastrar Pet
            </button>
          </div>

          {/* Add pet form */}
          {showAddPet && (
            <div className="bg-white dark:bg-surface-800 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6 shadow-sm">
              <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2"><PawPrint className="w-4 h-4 text-indigo-500" /> Novo Paciente</h3>
              <form onSubmit={handleAddPet} className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className={labelCls}>Nome do pet *</label><input required className={inputCls} value={newPetName} onChange={e => setNewPetName(e.target.value)} placeholder="Ex: Rex" /></div>
                <div><label className={labelCls}>Espécie</label>
                  <select className={inputCls} value={newPetSpecies} onChange={e => setNewPetSpecies(e.target.value as any)}>
                    <option value="dog">Cão</option><option value="cat">Gato</option>
                    <option value="bird">Ave</option><option value="exotic">Exótico</option>
                  </select>
                </div>
                <div><label className={labelCls}>Sexo</label>
                  <select className={inputCls} value={newPetSex} onChange={e => setNewPetSex(e.target.value as any)}>
                    <option value="male">Macho</option><option value="female">Fêmea</option>
                  </select>
                </div>
                <div><label className={labelCls}>Raça</label><input className={inputCls} value={newPetBreed} onChange={e => setNewPetBreed(e.target.value)} placeholder="SRD" /></div>
                <div><label className={labelCls}>Data de Nascimento</label><input type="date" className={inputCls} value={newPetBirth} onChange={e => setNewPetBirth(e.target.value)} /></div>
                <div><label className={labelCls}>Peso (kg)</label><input type="number" step="0.1" min="0" className={inputCls} value={newPetWeight} onChange={e => setNewPetWeight(Number(e.target.value))} /></div>
                <div className="col-span-2 flex gap-2 pt-2">
                  <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">
                    <Save className="w-4 h-4" /> Salvar Pet
                  </button>
                  <button type="button" onClick={() => setShowAddPet(false)} className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg">Cancelar</button>
                </div>
              </form>
            </div>
          )}

          {tutorPets.length === 0 && !showAddPet && (
            <div className="text-center py-16 text-surface-400">
              <PawPrint className="w-16 h-16 mx-auto mb-3 text-surface-200 dark:text-surface-700" />
              <p>Nenhum paciente cadastrado ainda.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorPets.map(pet => {
              const petVaccines = vaccinations.filter(v => v.petId === pet.id);
              const petRecords = medicalRecords.filter(r => r.petId === pet.id);
              const petAppts = appointments.filter(a => a.petId === pet.id);
              const petHosp = hospitalizations.find(h => h.petId === pet.id && h.status === 'active');
              const isEdPet = editingPetId === pet.id;

              return (
                <div key={pet.id} className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm">
                  {/* Pet header */}
                  <div className={`p-4 flex items-center gap-4 ${petHosp ? 'bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800' : 'bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-700'}`}>
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-2xl shrink-0">
                      {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🦜'}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEdPet ? (
                        <input className="font-bold text-lg bg-transparent border-b border-indigo-500 outline-none w-full text-surface-900 dark:text-white" value={editPetName} onChange={e => setEditPetName(e.target.value)} />
                      ) : (
                        <h3 className="font-bold text-lg text-surface-900 dark:text-white">{pet.name}</h3>
                      )}
                      <p className="text-xs text-surface-500">{speciesLabel[pet.species]} · {pet.sex === 'male' ? 'Macho' : 'Fêmea'} · {pet.neutered ? 'Castrado' : 'Não castrado'}</p>
                      {petHosp && <span className="text-xs font-bold text-amber-600 flex items-center gap-1 mt-0.5"><Bed className="w-3 h-3" /> Internado</span>}
                    </div>
                    <div className="flex gap-1.5">
                      {isEdPet ? (
                        <>
                          <button onClick={() => handleSavePet(pet.id)} className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"><Save className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingPetId(null)} className="p-2 rounded-lg bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-300"><X className="w-3.5 h-3.5" /></button>
                        </>
                      ) : (
                        <button onClick={() => handleStartEditPet(pet)} className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-400 transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pet details */}
                  <div className="p-4 space-y-3">
                    {isEdPet ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div><label className={labelCls}>Raça</label><input className={inputCls} value={editPetBreed} onChange={e => setEditPetBreed(e.target.value)} /></div>
                          <div><label className={labelCls}>Peso (kg)</label><input type="number" step="0.1" className={inputCls} value={editPetWeight} onChange={e => setEditPetWeight(Number(e.target.value))} /></div>
                        </div>
                        <div><label className={labelCls}>Observações / Alergias</label><textarea rows={2} className={inputCls} value={editPetNotes} onChange={e => setEditPetNotes(e.target.value)} /></div>
                      </div>
                    ) : (
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div><dt className="text-surface-400 text-xs">Raça</dt><dd className="font-medium text-surface-800 dark:text-surface-200">{pet.breed}</dd></div>
                        <div><dt className="text-surface-400 text-xs">Peso</dt><dd className="font-medium text-surface-800 dark:text-surface-200">{pet.weight} kg</dd></div>
                        <div><dt className="text-surface-400 text-xs">Nascimento</dt><dd className="font-medium text-surface-800 dark:text-surface-200">{pet.birthDate}</dd></div>
                        <div><dt className="text-surface-400 text-xs">Cor</dt><dd className="font-medium text-surface-800 dark:text-surface-200">{pet.color}</dd></div>
                        {pet.notes && <div className="col-span-2"><dt className="text-surface-400 text-xs">Obs.</dt><dd className="text-surface-700 dark:text-surface-300 text-xs">{pet.notes}</dd></div>}
                      </dl>
                    )}

                    {/* Pet stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-100 dark:border-surface-700">
                      <div className="text-center">
                        <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{petRecords.length}</div>
                        <div className="text-[10px] text-surface-500 font-semibold uppercase tracking-wide">Prontuários</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-black text-amber-600 dark:text-amber-400">{petVaccines.length}</div>
                        <div className="text-[10px] text-surface-500 font-semibold uppercase tracking-wide">Vacinas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{petAppts.length}</div>
                        <div className="text-[10px] text-surface-500 font-semibold uppercase tracking-wide">Consultas</div>
                      </div>
                    </div>

                    {/* Quick links */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => navigate(`/prontuarios?petId=${pet.id}`)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <ClipboardList className="w-3.5 h-3.5" /> Prontuário
                      </button>
                      <button
                        onClick={() => navigate(`/agenda?petId=${pet.id}`)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-lg hover:bg-sky-100 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Agendar
                      </button>
                      <button
                        onClick={() => navigate(`/prontuarios?petId=${pet.id}&tab=vacinas`)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <Syringe className="w-3.5 h-3.5" /> Vacinas
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: COMANDA / VENDA ───────────────────────────────── */}
      {activeTab === 'comanda' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lançar item */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 space-y-4">
            <h2 className="font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-500" /> Lançar Item na Comanda
            </h2>

            {tutor.hasDebt && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                <Lock className="w-4 h-4 shrink-0" />
                <span><strong>Atenção:</strong> Cliente inadimplente. Regularize os débitos antes de lançar novos itens.</span>
              </div>
            )}

            <form onSubmit={handleAddComandaItem} className="space-y-3">
              <div className="flex gap-2">
                {(['service', 'product'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setItemType(type); setItemName(''); setItemPrice(0); setPresetVal(''); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${itemType === type ? 'bg-indigo-600 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'}`}
                  >
                    {type === 'service' ? '🔧 Serviço' : '📦 Produto'}
                  </button>
                ))}
              </div>

              <div>
                <label className={labelCls}>Selecionar Preset</label>
                <select className={inputCls} value={presetVal} onChange={e => handlePresetChange(e.target.value)}>
                  <option value="">— Selecione ou digite abaixo —</option>
                  {(itemType === 'service' ? servicePresets : productPresets).map(p => (
                    <option key={p.name} value={p.name}>{p.name} (R$ {p.price.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div><label className={labelCls}>Descrição</label><input className={inputCls} value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Nome do serviço ou produto" required /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Valor Unitário (R$)</label><input type="number" step="0.01" min="0" className={inputCls} value={itemPrice || ''} onChange={e => setItemPrice(Number(e.target.value))} required /></div>
                <div><label className={labelCls}>Quantidade</label><input type="number" min="1" className={inputCls} value={itemQty} onChange={e => setItemQty(Number(e.target.value))} /></div>
              </div>

              <button
                type="submit"
                disabled={tutor.hasDebt}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar à Comanda
              </button>
            </form>
          </div>

          {/* Comanda atual */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-surface-900 dark:text-white flex items-center gap-2"><ReceiptText className="w-4 h-4 text-amber-500" /> Fatura Aberta</h2>
              {activeComanda.length > 0 && (
                <button onClick={() => clearComanda(tutor.id)} className="text-xs text-red-500 hover:underline">Limpar tudo</button>
              )}
            </div>

            {activeComanda.length === 0 ? (
              <div className="text-center py-12 text-surface-400">
                <ReceiptText className="w-12 h-12 mx-auto mb-2 text-surface-200 dark:text-surface-700" />
                <p className="text-sm">Comanda vazia.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeComanda.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-700 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-xs text-surface-500">{item.quantity}x · R$ {item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-sm font-bold text-surface-900 dark:text-white">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeItemFromComanda(tutor.id, item.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 border-t border-surface-200 dark:border-surface-700 pt-3 text-sm">
                  <div className="flex justify-between text-surface-600 dark:text-surface-400"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Desconto Clube ({tutorPlan?.discount}%)</span><span>– R$ {discount.toFixed(2)}</span></div>}
                  <div className="flex justify-between font-black text-lg text-surface-900 dark:text-white pt-1"><span>Total</span><span className="text-indigo-600 dark:text-indigo-400">R$ {total.toFixed(2)}</span></div>
                </div>

                <button
                  onClick={() => navigate('/caixa')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" /> Finalizar no Caixa
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: HISTÓRICO ─────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
          <div className="p-5 border-b border-surface-200 dark:border-surface-700">
            <h2 className="font-bold text-surface-900 dark:text-white flex items-center gap-2"><History className="w-4 h-4 text-indigo-500" /> Histórico Financeiro</h2>
          </div>
          {(tutor.financialHistory ?? []).length === 0 ? (
            <div className="text-center py-16 text-surface-400">
              <History className="w-12 h-12 mx-auto mb-2 text-surface-200 dark:text-surface-700" />
              <p className="text-sm">Sem histórico financeiro ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              {(tutor.financialHistory ?? []).map(record => (
                <div key={record.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{record.description}</p>
                    <p className="text-xs text-surface-500">{record.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${record.type === 'credit_deposit' ? 'text-emerald-600' : record.status === 'overdue' ? 'text-red-600' : 'text-surface-900 dark:text-white'}`}>
                      {record.type === 'credit_deposit' ? '+' : ''}R$ {record.amount.toFixed(2)}
                    </p>
                    <p className={`text-xs font-semibold ${record.status === 'paid' ? 'text-emerald-600' : record.status === 'overdue' ? 'text-red-500' : 'text-amber-500'}`}>
                      {record.status === 'paid' ? 'Pago' : record.status === 'overdue' ? 'Em atraso' : 'Pendente'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: AGENDA ────────────────────────────────────────── */}
      {activeTab === 'appointments' && (
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
          <div className="p-5 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <h2 className="font-bold text-surface-900 dark:text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500" /> Agendamentos</h2>
            <button onClick={() => navigate('/agenda')} className="text-xs text-indigo-600 hover:underline font-medium">+ Novo Agendamento</button>
          </div>
          {tutorAppointments.length === 0 ? (
            <div className="text-center py-16 text-surface-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-surface-200 dark:text-surface-700" />
              <p className="text-sm">Sem agendamentos encontrados.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              {tutorAppointments.map(appt => {
                const pet = pets.find(p => p.id === appt.petId);
                const statusColors: Record<string, string> = {
                  scheduled: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
                  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                  'in-progress': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
                };
                const statusLabels: Record<string, string> = {
                  scheduled: 'Agendado', completed: 'Concluído', cancelled: 'Cancelado',
                  waiting: 'Aguardando', 'in-progress': 'Em Atendimento',
                };
                return (
                  <div key={appt.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xl shrink-0">
                        {pet?.species === 'dog' ? '🐕' : pet?.species === 'cat' ? '🐈' : '🦜'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">{pet?.name ?? '—'}</p>
                        <p className="text-xs text-surface-500">{appt.type} · {appt.date} às {appt.startTime}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[appt.status] ?? 'bg-surface-100 text-surface-500'}`}>
                      {statusLabels[appt.status] ?? appt.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
