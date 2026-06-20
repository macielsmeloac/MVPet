import { useState } from 'react';
import { useDataStore } from '../store/useDataStore';
import type { Tutor, Pet, ComandaItem, TutorFinancialRecord } from '../types';
import {
  Users,
  Search,
  MessageSquare,
  Mail,
  Phone,
  Filter,
  Star,
  AlertTriangle,
  Send,
  ReceiptText,
  Plus,
  Trash2,
  X,
  Gift,
  PlusCircle,
  Wallet,
  Smartphone,
  CheckCircle,
  Lock,
  Building,
  MapPin,
  Clock,
  History,
  ShieldAlert,
  ChevronRight,
  Droplets
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDonorStore } from '../store/useDonorStore';
import { useEffect } from 'react';

const servicePresets = [
  { name: 'Consulta Clínica Veterinária', price: 120.00 },
  { name: 'Consulta Especialista (Cardio/Oftalmo)', price: 180.00 },
  { name: 'Banho Completo (Porte P)', price: 50.00 },
  { name: 'Banho Completo (Porte M/G)', price: 75.00 },
  { name: 'Banho & Tosa Higiênica', price: 80.00 },
  { name: 'Vacina Múltipla V10 (Importada)', price: 90.00 },
  { name: 'Vacina Antirrábica', price: 60.00 },
  { name: 'Exame de Hemograma Completo', price: 80.00 },
  { name: 'Diária de Internação Monitorada', price: 150.00 }
];

const productPresets = [
  { name: 'Antipulgas Bravecto 10 a 20kg', price: 165.00 },
  { name: 'Vermífugo Drontal Plus Caes (4 tabs)', price: 42.00 },
  { name: 'Antibiótico Ceftriaxona 1g', price: 35.00 },
  { name: 'Ração Royal Canin Cães Adultos 2kg', price: 110.05 },
  { name: 'Shampoo Hipoalergênico Dermocanis', price: 75.00 },
  { name: 'Sachê Premier Gourmet Gatos', price: 5.50 }
];

export function CRMPage() {
  const {
    tutors,
    pets,
    comandas,
    addItemToComanda,
    removeItemFromComanda,
    clearComanda,
    subscriptionPlans,
    depositTutorCredits,
    addTutor,
    addPet,
    updateTutorDebtStatus
  } = useDataStore();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { donors } = useDonorStore();

  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  // Estados locais do Cadastro de Tutor
  const [isAddTutorOpen, setIsAddTutorOpen] = useState(false);
  const [newTutorName, setNewTutorName] = useState('');
  const [newTutorCpf, setNewTutorCpf] = useState('');
  const [newTutorEmail, setNewTutorEmail] = useState('');
  const [newTutorPhone, setNewTutorPhone] = useState('');
  const [newTutorStreet, setNewTutorStreet] = useState('');
  const [newTutorNum, setNewTutorNum] = useState('');
  const [newTutorNeigh, setNewTutorNeigh] = useState('');
  const [newTutorCity, setNewTutorCity] = useState('');
  const [newTutorState, setNewTutorState] = useState('SP');
  const [newTutorZip, setNewTutorZip] = useState('');
  const [newTutorDebt, setNewTutorDebt] = useState(false);

  // Estados locais da Ficha Consolidada
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [activeTab, setActiveTab] = useState<'comanda' | 'pets' | 'financial' | 'simplespet'>('comanda');

  // Estados do formulário de novos pets (dentro da aba Pets)
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'dog' | 'cat' | 'bird' | 'exotic'>('dog');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetWeight, setNewPetWeight] = useState(5);
  const [newPetSex, setNewPetSex] = useState<'male' | 'female'>('male');
  const [newPetBirth, setNewPetBirth] = useState('');

  // Estados do depósito de calção
  const [depositAmount, setDepositAmount] = useState<number>(0);

  // Estados locais do formulário de lançamento de Comanda
  const [itemType, setItemType] = useState<'product' | 'service'>('service');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemQty, setItemQty] = useState<number>(1);
  const [presetSelection, setPresetSelection] = useState('');

  const allTags = [...new Set(tutors.flatMap((t) => t.tags))];

  const filtered = tutors
    .filter((t) => filterTag === 'all' || t.tags.includes(filterTag))
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.cpf.includes(search));

  // Abertura do modal do cliente
  const handleOpenFicha = (tutor: Tutor, tab: typeof activeTab = 'comanda') => {
    setSelectedTutor(tutor);
    setActiveTab(tab);
    setItemType('service');
    setItemName('');
    setItemPrice(0);
    setItemQty(1);
    setPresetSelection('');
    setNewPetName('');
    setNewPetBreed('');
    setDepositAmount(0);
  };

  useEffect(() => {
    const tutorId = searchParams.get('tutorId');
    if (tutorId && !selectedTutor) {
      const tutor = tutors.find((t) => t.id === tutorId);
      if (tutor) {
        handleOpenFicha(tutor, 'pets');
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, tutors, selectedTutor, setSearchParams]);

  // Salvar novo tutor
  const handleCreateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTutorName || !newTutorCpf) return;

    const newTutor: Tutor = {
      id: `t-${Date.now()}`,
      name: newTutorName,
      cpf: newTutorCpf,
      email: newTutorEmail || 'cliente@email.com',
      phone: newTutorPhone || '(11) 99999-9999',
      whatsapp: newTutorPhone.replace(/\D/g, '') || '11999999999',
      address: {
        street: newTutorStreet || 'Rua Principal',
        number: newTutorNum || 'S/N',
        neighborhood: newTutorNeigh || 'Centro',
        city: newTutorCity || 'São Paulo',
        state: newTutorState || 'SP',
        zipCode: newTutorZip || '01000-000'
      },
      isSubscriber: false,
      hasDebt: newTutorDebt,
      blockedByDebt: newTutorDebt,
      tags: newTutorDebt ? ['Devedor'] : ['Novo'],
      petIds: [],
      credits: 0,
      financialHistory: [],
      createdAt: new Date().toISOString().split('T')[0] || ''
    };

    addTutor(newTutor);
    setIsAddTutorOpen(false);
    // Limpar campos
    setNewTutorName('');
    setNewTutorCpf('');
    setNewTutorEmail('');
    setNewTutorPhone('');
    setNewTutorStreet('');
    setNewTutorNum('');
    setNewTutorNeigh('');
    setNewTutorCity('');
    setNewTutorZip('');
    setNewTutorDebt(false);
  };

  // Salvar novo pet (com trava de inadimplência ativa)
  const handleCreatePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor || !newPetName) return;

    // Trava rígida/Dura de inadimplência
    if (selectedTutor.hasDebt) {
      alert('🔒 CADASTRO BLOQUEADO: Este tutor possui débitos pendentes em atraso. Regularize a situação financeira antes de prosseguir com novos cadastros.');
      return;
    }

    const newPetRecord: Pet = {
      id: `p-${Date.now()}`,
      name: newPetName,
      species: newPetSpecies,
      breed: newPetBreed || 'SRD',
      birthDate: newPetBirth || '2024-01-01',
      sex: newPetSex,
      neutered: false,
      weight: Number(newPetWeight),
      color: 'Outra',
      tutorId: selectedTutor.id,
      isAggressive: false,
      allergies: [],
      createdAt: new Date().toISOString().split('T')[0] || ''
    };

    addPet(newPetRecord);
    
    // Atualiza o tutor selecionado no estado local para renderizar a lista
    const updatedTutor = {
      ...selectedTutor,
      petIds: [...selectedTutor.petIds, newPetRecord.id]
    };
    setSelectedTutor(updatedTutor);

    // Limpar campos
    setNewPetName('');
    setNewPetBreed('');
    setNewPetWeight(5);
    setNewPetBirth('');
    alert('🐾 Pet cadastrado com sucesso!');
  };

  // Executar Depósito Calção
  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor || depositAmount <= 0) return;

    depositTutorCredits(selectedTutor.id, depositAmount);
    
    // Atualizar no estado local para renderização imediata
    const updatedTutor = {
      ...selectedTutor,
      credits: (selectedTutor.credits || 0) + depositAmount,
      financialHistory: [
        {
          id: `dep-${Date.now()}`,
          type: 'credit_deposit' as const,
          description: 'Depósito Calção Antecipado',
          amount: depositAmount,
          date: new Date().toISOString().split('T')[0] || '',
          status: 'paid' as const
        },
        ...(selectedTutor.financialHistory || [])
      ]
    };
    setSelectedTutor(updatedTutor);
    
    setDepositAmount(0);
    alert(`💰 Depósito de R$ ${depositAmount.toFixed(2)} realizado com sucesso!`);
  };

  // Regularizar ou colocar em debito
  const handleToggleDebt = () => {
    if (!selectedTutor) return;
    const currentDebtStatus = !selectedTutor.hasDebt;
    updateTutorDebtStatus(selectedTutor.id, currentDebtStatus);

    const updatedTutor = {
      ...selectedTutor,
      hasDebt: currentDebtStatus,
      blockedByDebt: currentDebtStatus
    };
    setSelectedTutor(updatedTutor);
  };

  // Selecionar preset na comanda
  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPresetSelection(val);
    if (!val) {
      setItemName('');
      setItemPrice(0);
      return;
    }

    const list = itemType === 'service' ? servicePresets : productPresets;
    const found = list.find((p) => p.name === val);
    if (found) {
      setItemName(found.name);
      setItemPrice(found.price);
    }
  };

  // Alterar tipo na comanda
  const handleTypeChange = (type: 'product' | 'service') => {
    setItemType(type);
    setItemName('');
    setItemPrice(0);
    setPresetSelection('');
  };

  // Adicionar item à comanda
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor || !itemName.trim() || itemPrice < 0 || itemQty < 1) return;

    const newItem: ComandaItem = {
      id: `cmd-${Date.now()}`,
      name: itemName,
      type: itemType,
      price: Number(itemPrice),
      quantity: Number(itemQty)
    };

    addItemToComanda(selectedTutor.id, newItem);
    setItemName('');
    setItemPrice(0);
    setItemQty(1);
    setPresetSelection('');
  };

  // Busca detalhes do plano fidelidade
  const tutorDiscountPercent = selectedTutor && selectedTutor.isSubscriber && selectedTutor.subscriptionPlanId
    ? (subscriptionPlans.find((p) => p.id === selectedTutor.subscriptionPlanId)?.discount || 0)
    : 0;

  const tutorPlanName = selectedTutor && selectedTutor.isSubscriber && selectedTutor.subscriptionPlanId
    ? (subscriptionPlans.find((p) => p.id === selectedTutor.subscriptionPlanId)?.name || 'Assinante')
    : '';

  const activeComandaItems = selectedTutor ? (comandas[selectedTutor.id] || []) : [];
  const subtotal = activeComandaItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const productDiscount = activeComandaItems.reduce((acc, item) => {
    if (item.type === 'product') {
      return acc + (item.price * item.quantity * (tutorDiscountPercent / 100));
    }
    return acc;
  }, 0);

  const grandTotal = subtotal - productDiscount;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-indigo-500/10 via-indigo-650/5 to-transparent p-6 rounded-[var(--radius-xl)] border border-indigo-500/20 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
              CRM & Contas de Clientes
            </h1>
            <p className="text-sm text-surface-500 mt-0.5 animate-pulse">
              Ficha clínica unificada integrada ao SimplesPet Tutor Portal, Comanda, Crédito Calção e trava rígida de inadimplentes.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddTutorOpen(true)}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-[var(--radius-md)] transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" /> Cadastrar Tutor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center font-bold text-lg">
            👥
          </div>
          <div>
            <span className="text-xs text-surface-500 uppercase font-semibold">Tutos Ativos</span>
            <h4 className="text-xl font-bold text-surface-900 dark:text-white">{tutors.length}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4 border-l-4 border-l-pink-500">
          <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-950/20 text-pink-500 flex items-center justify-center">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-xs text-surface-500 uppercase font-semibold">Assinantes Clube Pet</span>
            <h4 className="text-xl font-bold text-pink-600 dark:text-pink-400">
              {tutors.filter((t) => t.isSubscriber).length}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-surface-500 uppercase font-semibold">Comandas Virtuais</span>
            <h4 className="text-xl font-bold text-amber-600 dark:text-amber-500">
              {Object.keys(comandas).filter((k) => comandas[k] && comandas[k]!.length > 0).length}
            </h4>
          </div>
        </div>
      </div>

      {/* Grid de Clientes */}
      <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex flex-wrap items-center justify-between gap-4 bg-surface-50/50 dark:bg-surface-900/10">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-surface-400" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 focus:outline-none"
            >
              <option value="all">Todas as Tags</option>
              {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filtered.map((tutor) => {
            const tutorPets = pets.filter((p) => p.tutorId === tutor.id);
            const activeComanda = comandas[tutor.id] || [];
            
            return (
              <div
                key={tutor.id}
                onClick={() => navigate(`/crm/${tutor.id}`)}
                className="border border-surface-200 dark:border-surface-700 rounded-[var(--radius-lg)] p-4 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all bg-surface-50/50 dark:bg-surface-900/50 relative flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-surface-900 dark:text-white flex items-center gap-2">
                        {tutor.name}
                        {tutor.isSubscriber && <Star className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />}
                      </h3>
                      <p className="text-xs text-surface-500">Cadastrado em {tutor.createdAt}</p>
                    </div>
                    {tutor.hasDebt && (
                      <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200">
                        <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" /> Inadimplente
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <a href={`https://wa.me/55${tutor.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-300 hover:text-emerald-500 transition-colors w-max">
                      <Phone className="w-3.5 h-3.5 text-surface-400" /> {tutor.phone}
                    </a>
                    <a href={`mailto:${tutor.email}`} className="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-300 hover:text-indigo-500 transition-colors w-max">
                      <Mail className="w-3.5 h-3.5 text-surface-400" /> {tutor.email}
                    </a>
                    {tutor.credits && tutor.credits > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded w-max border border-emerald-100 dark:border-emerald-900/30">
                        <Wallet className="w-3.5 h-3.5" /> Calção: R$ {tutor.credits.toFixed(2)}
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-surface-500 mb-1.5 uppercase tracking-wide">Pets ({tutorPets.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {tutorPets.length === 0 ? (
                        <span className="text-[10px] text-surface-400 italic">Nenhum pet vinculado</span>
                      ) : (
                        tutorPets.map((p) => (
                          <span key={p.id} className="text-[10px] bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 px-2 py-0.5 rounded text-surface-700 dark:text-surface-300">
                            {p.name} ({p.species === 'dog' ? '🐕' : '🐈'})
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5 pt-3 border-t border-surface-200 dark:border-surface-700 mt-4">
                  <button
                    onClick={() => handleOpenFicha(tutor, 'pets')}
                    className="flex-1 flex justify-center items-center py-1.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold rounded transition-colors cursor-pointer"
                  >
                    Ficha / Pets
                  </button>

                  <button
                    onClick={() => handleOpenFicha(tutor, 'comanda')}
                    className="flex-1 flex justify-center items-center gap-1 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold rounded transition-colors cursor-pointer relative"
                  >
                    <ReceiptText className="w-3.5 h-3.5" /> Comanda
                    {activeComanda.length > 0 && (
                      <span className="absolute -top-1.5 -right-1 bg-amber-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce shadow">
                        {activeComanda.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CADASTRO DE NOVO TUTOR */}
      {/* ========================================================================= */}
      {isAddTutorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-800 w-full max-w-lg rounded-[var(--radius-xl)] border border-surface-200 dark:border-surface-700 shadow-modal animate-scale-in overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/40">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Cadastrar Novo Tutor
              </h3>
              <button onClick={() => setIsAddTutorOpen(false)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTutor} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={newTutorName}
                    onChange={(e) => setNewTutorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Pedro de Alcântara"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    value={newTutorCpf}
                    onChange={(e) => setNewTutorCpf(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="123.456.789-00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Celular / WhatsApp</label>
                  <input
                    type="text"
                    value={newTutorPhone}
                    onChange={(e) => setNewTutorPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={newTutorEmail}
                    onChange={(e) => setNewTutorEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="email@tutor.com"
                  />
                </div>
              </div>

              <div className="border-t border-surface-200 dark:border-surface-700 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Endereço de Residência</span>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-surface-500 mb-0.5">Rua</label>
                    <input
                      type="text"
                      value={newTutorStreet}
                      onChange={(e) => setNewTutorStreet(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-surface-500 mb-0.5">Número</label>
                    <input
                      type="text"
                      value={newTutorNum}
                      onChange={(e) => setNewTutorNum(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-surface-500 mb-0.5">Bairro</label>
                    <input
                      type="text"
                      value={newTutorNeigh}
                      onChange={(e) => setNewTutorNeigh(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-surface-500 mb-0.5">Cidade</label>
                    <input
                      type="text"
                      value={newTutorCity}
                      onChange={(e) => setNewTutorCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-surface-500 mb-0.5">CEP</label>
                    <input
                      type="text"
                      value={newTutorZip}
                      onChange={(e) => setNewTutorZip(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 rounded outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status Inadimplente Inicial */}
              <div className="p-3 bg-red-500/5 border border-red-550/20 rounded flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-red-750 dark:text-red-400 block">Iniciar com Restrição Financeira?</span>
                  <span className="text-[10px] text-surface-500">Marque se este tutor possuir débitos externos pendentes.</span>
                </div>
                <input
                  type="checkbox"
                  checked={newTutorDebt}
                  onChange={(e) => setNewTutorDebt(e.target.checked)}
                  className="w-4.5 h-4.5 text-indigo-650 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-200 dark:border-surface-700">
                <button
                  type="button"
                  onClick={() => setIsAddTutorOpen(false)}
                  className="px-4 py-2 border border-surface-200 dark:border-surface-700 hover:bg-surface-100 rounded text-xs font-semibold font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs font-bold shadow"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER/MODAL: FICHA MULTI-ABAS CONSOLIDADA DO TUTOR */}
      {/* ========================================================================= */}
      {selectedTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-800 w-full max-w-4xl rounded-[var(--radius-xl)] border border-surface-200 dark:border-surface-700 shadow-modal animate-scale-in overflow-hidden flex flex-col h-[85vh]">
            
            {/* Header com Identificacao e Alerta de Debito */}
            <div className="p-5 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/20 flex flex-wrap justify-between items-center gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
                  👤
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                    {selectedTutor.name}
                    {selectedTutor.isSubscriber && (
                      <span className="text-[10px] bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        Clube {tutorPlanName}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-surface-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>CPF: {selectedTutor.cpf}</span> • 
                    <a href={`https://wa.me/55${selectedTutor.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {selectedTutor.phone}
                    </a> • 
                    <a href={`mailto:${selectedTutor.email}`} className="hover:text-indigo-500 transition-colors flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {selectedTutor.email}
                    </a>
                  </p>
                </div>
              </div>

              {selectedTutor.hasDebt && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/30 rounded-lg p-2 flex items-center gap-2.5 animate-pulse">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-red-700 dark:text-red-400 block leading-tight">🔒 Inadimplência Ativa</span>
                    <span className="text-[10px] text-surface-500">Bloqueio administrativo duro para novos cadastros e agendamentos.</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedTutor(null)}
                className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas Superiores */}
            <div className="flex border-b border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-900/10 shrink-0 px-2">
              <button
                onClick={() => setActiveTab('comanda')}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'comanda'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-surface-800'
                    : 'border-transparent text-surface-500 hover:text-surface-700'
                }`}
              >
                <ReceiptText className="w-4 h-4" /> Comanda Virtual
              </button>
              
              <button
                onClick={() => setActiveTab('pets')}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pets'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-surface-800'
                    : 'border-transparent text-surface-500 hover:text-surface-700'
                }`}
              >
                🐾 Animais & Ficha Clínica
              </button>

              <button
                onClick={() => setActiveTab('financial')}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'financial'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-surface-800'
                    : 'border-transparent text-surface-500 hover:text-surface-700'
                }`}
              >
                <Wallet className="w-4 h-4" /> Histórico Financeiro
              </button>

              <button
                onClick={() => setActiveTab('simplespet')}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'simplespet'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-surface-800'
                    : 'border-transparent text-surface-500 hover:text-surface-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-500 animate-pulse" /> SimplesPet Portal
              </button>
            </div>

            {/* Conteudo das Abas */}
            <div className="flex-1 overflow-y-auto p-5">
              
              {/* ==================== TAB 1: COMANDA VIRTUAL ==================== */}
              {activeTab === 'comanda' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
                  <div className="lg:col-span-7 flex flex-col space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500">
                      Consumo Clínico / Pedidos Pendentes
                    </h4>
                    <div className="flex-1 min-h-[250px] bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-lg)] p-3 overflow-y-auto space-y-2">
                      {activeComandaItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 py-12 text-surface-400 space-y-2">
                          <ReceiptText className="w-10 h-10 opacity-20" />
                          <p className="text-sm font-semibold">Comanda Sem Pendências</p>
                          <p className="text-[11px] text-surface-500">Nenhum consumo klinico em aberto na data corrente.</p>
                        </div>
                      ) : (
                        activeComandaItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded text-xs shadow-sm"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.2 rounded-[3px] text-[8px] font-extrabold uppercase ${
                                  item.type === 'service' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'
                                }`}>
                                  {item.type === 'service' ? 'Serviço' : 'Produto'}
                                </span>
                                <span className="font-bold text-surface-800 dark:text-surface-200">{item.name}</span>
                              </div>
                              <p className="text-[10px] text-surface-450 mt-0.5">{item.quantity}x • R$ {item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-surface-800 dark:text-surface-250">R$ {(item.price * item.quantity).toFixed(2)}</p>
                              <button
                                onClick={() => removeItemFromComanda(selectedTutor.id, item.id)}
                                className="p-1 hover:bg-red-50 text-surface-400 hover:text-red-500 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-4 border border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-900/60 space-y-2">
                      {tutorDiscountPercent > 0 && (
                        <div className="flex justify-between text-xs text-pink-650 font-bold bg-pink-500/10 p-2 rounded">
                          <span>Clube {tutorPlanName} ({tutorDiscountPercent}% Off em Produtos)</span>
                          <span>- R$ {productDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-end border-t border-surface-200 dark:border-surface-700 pt-2 text-xs font-bold text-surface-700">
                        <span>Total Parcial</span>
                        <span className="text-base text-amber-600">R$ {grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500">Adicionar Consumos</h4>
                    <form onSubmit={handleAddItem} className="space-y-3 p-4 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-lg)] bg-white dark:bg-surface-900/20">
                      <div>
                        <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1">Tipo</label>
                        <div className="grid grid-cols-2 gap-1 bg-surface-100 dark:bg-surface-950 p-0.5 rounded border">
                          <button
                            type="button"
                            onClick={() => handleTypeChange('service')}
                            className={`py-1 text-xs font-bold rounded cursor-pointer text-center ${
                              itemType === 'service' ? 'bg-white dark:bg-surface-800 text-indigo-600' : 'text-surface-500'
                            }`}
                          >
                            Procedimento
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTypeChange('product')}
                            className={`py-1 text-xs font-bold rounded cursor-pointer text-center ${
                              itemType === 'product' ? 'bg-white dark:bg-surface-800 text-pink-500' : 'text-surface-500'
                            }`}
                          >
                            Insumo / Loja
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1">Buscar Preset</label>
                        <select
                          value={presetSelection}
                          onChange={handleSelectPreset}
                          className="w-full p-2 text-xs bg-surface-50 dark:bg-surface-900 border rounded"
                        >
                          <option value="">-- Manual --</option>
                          {(itemType === 'service' ? servicePresets : productPresets).map((preset) => (
                            <option key={preset.name} value={preset.name}>{preset.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1">Descrição</label>
                        <input
                          type="text"
                          required
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          className="w-full p-2 text-xs border rounded bg-surface-50 dark:bg-surface-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1">Valor Unitário</label>
                          <input
                            type="number"
                            required
                            step="0.01"
                            value={itemPrice || ''}
                            onChange={(e) => setItemPrice(Number(e.target.value))}
                            className="w-full p-2 text-xs border rounded bg-surface-50 dark:bg-surface-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1">Qtd</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={itemQty}
                            onChange={(e) => setItemQty(Number(e.target.value))}
                            className="w-full p-2 text-xs border rounded bg-surface-50 dark:bg-surface-900"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs font-bold shadow flex justify-center items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" /> Adicionar na Comanda
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ==================== TAB 2: PETS & CADASTRO DE ANIMAIS (COM TRAVA DURA) ==================== */}
              {activeTab === 'pets' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Lista de Animais Existentes */}
                  <div className="lg:col-span-7 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500">Pets Vinculados</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pets.filter((p) => p.tutorId === selectedTutor.id).length === 0 ? (
                        <div className="col-span-2 p-6 border rounded-lg bg-surface-50 text-center text-xs text-surface-400 italic">
                          Nenhum animal cadastrado para este tutor ainda.
                        </div>
                      ) : (
                        pets.filter((p) => p.tutorId === selectedTutor.id).map((pet) => (
                          <div key={pet.id} className="p-4 border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 rounded-lg shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h5 className="font-bold text-surface-850 dark:text-white flex items-center gap-1.5">
                                  <span>{pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐦'}</span>
                                  {pet.name}
                                </h5>
                                <span className="text-[9px] bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded-full font-semibold">{pet.breed}</span>
                              </div>
                              <p className="text-[11px] text-surface-500 mt-1">Peso: {pet.weight} kg • Sexo: {pet.sex === 'male' ? 'Macho' : 'Fêmea'}</p>
                              <p className="text-[11px] text-surface-500">Nascimento: {pet.birthDate}</p>
                            </div>
                            <div className="pt-3 border-t border-surface-100 mt-3 flex justify-between items-center text-[10px] text-surface-400">
                              <span>Microchip: {pet.microchip || 'N/A'}</span>
                              <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                                <CheckCircle className="w-3 h-3" /> Prontuário Ativo
                              </span>
                            </div>
                            <div className="pt-3 border-t border-surface-100 mt-3 flex justify-end">
                              {(() => {
                                const isDonor = donors.some(d => d.petId === pet.id);
                                return isDonor ? (
                                  <button
                                    onClick={() => navigate('/doadores')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded transition-colors cursor-pointer"
                                  >
                                    <Droplets className="w-3.5 h-3.5" /> Ver Doador
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => navigate(`/doadores?newPetId=${pet.id}`)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 rounded transition-colors cursor-pointer"
                                  >
                                    <Droplets className="w-3.5 h-3.5" /> Cadastrar como Doador
                                  </button>
                                );
                              })()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Form de Cadastro de Animal (COM A TRAVA DURA) */}
                  <div className="lg:col-span-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500">Adicionar Novo Animal</h4>
                    <div className="p-4 border border-surface-200 dark:border-surface-700 rounded-lg bg-white dark:bg-surface-900/10 relative overflow-hidden">
                      {selectedTutor.hasDebt ? (
                        <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 z-10">
                          <Lock className="w-10 h-10 text-red-500 mb-2 animate-bounce" />
                          <h5 className="text-sm font-extrabold text-white">CADASTRO BLOQUEADO</h5>
                          <p className="text-xs text-surface-300 mt-2 max-w-[280px]">
                            Este tutor possui pendências financeiras em aberto no estabelecimento.
                          </p>
                          <p className="text-[11px] text-red-400 mt-1 font-semibold">
                            É necessário regularizar a conta corrente na aba "Histórico Financeiro" para liberar novos cadastros.
                          </p>
                        </div>
                      ) : null}

                      <form onSubmit={handleCreatePet} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-surface-500 uppercase mb-0.5">Nome do Pet *</label>
                          <input
                            type="text"
                            required
                            value={newPetName}
                            onChange={(e) => setNewPetName(e.target.value)}
                            placeholder="Ex: Rex, Luna"
                            className="w-full p-2 text-xs border rounded bg-surface-50 dark:bg-surface-900"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-surface-500 uppercase mb-0.5">Espécie *</label>
                            <select
                              value={newPetSpecies}
                              onChange={(e: any) => setNewPetSpecies(e.target.value)}
                              className="w-full p-2 text-xs border rounded bg-surface-50 dark:bg-surface-900 text-surface-700"
                            >
                              <option value="dog">Cão</option>
                              <option value="cat">Gato</option>
                              <option value="bird">Ave</option>
                              <option value="exotic">Exótico</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-surface-500 uppercase mb-0.5">Raça</label>
                            <input
                              type="text"
                              value={newPetBreed}
                              onChange={(e) => setNewPetBreed(e.target.value)}
                              placeholder="Ex: Golden, Siamês"
                              className="w-full p-2 text-xs border rounded bg-surface-50 dark:bg-surface-900"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-surface-500 uppercase mb-0.5">Sexo</label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setNewPetSex('male')}
                                className={`flex-1 py-1 border rounded text-[11px] font-bold text-center cursor-pointer ${
                                  newPetSex === 'male' ? 'bg-indigo-50 border-indigo-300 text-indigo-650' : 'bg-surface-50'
                                }`}
                              >
                                Macho
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewPetSex('female')}
                                className={`flex-1 py-1 border rounded text-[11px] font-bold text-center cursor-pointer ${
                                  newPetSex === 'female' ? 'bg-pink-50 border-pink-300 text-pink-650' : 'bg-surface-50'
                                }`}
                              >
                                Fêmea
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-surface-500 uppercase mb-0.5">Peso (kg)</label>
                            <input
                              type="number"
                              value={newPetWeight}
                              onChange={(e) => setNewPetWeight(Number(e.target.value))}
                              className="w-full p-2 text-xs border rounded bg-surface-50 dark:bg-surface-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-surface-500 uppercase mb-0.5">Data de Nascimento</label>
                          <input
                            type="date"
                            value={newPetBirth}
                            onChange={(e) => setNewPetBirth(e.target.value)}
                            className="w-full p-2 text-xs border rounded bg-surface-50 dark:bg-surface-900 text-surface-700"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs font-bold shadow flex justify-center items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Salvar Pet na Ficha
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB 3: HISTÓRICO FINANCEIRO (DEPÓSITOS & CONTROLE DÉBITOS) ==================== */}
              {activeTab === 'financial' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500">Transações e Notas Fiscais</h4>
                    
                    <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-3 overflow-y-auto space-y-2 min-h-[300px]">
                      {(!selectedTutor.financialHistory || selectedTutor.financialHistory.length === 0) ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-surface-400 space-y-1 py-16">
                          <History className="w-10 h-10 opacity-20" />
                          <p className="text-xs font-bold">Nenhum lançamento no extrato financeiro</p>
                          <p className="text-[10px]">As transações concluídas aparecerão aqui após baixa no PDV.</p>
                        </div>
                      ) : (
                        selectedTutor.financialHistory.map((rec: TutorFinancialRecord) => (
                          <div key={rec.id} className="p-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-750 rounded text-xs flex justify-between items-center shadow-xs">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                rec.type === 'credit_deposit' ? 'bg-emerald-500' : rec.type === 'invoice' ? 'bg-red-500' : 'bg-indigo-500'
                              }`} />
                              <div>
                                <span className="font-bold text-surface-800 dark:text-surface-200 block">{rec.description}</span>
                                <span className="text-[10px] text-surface-400">{rec.date}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`font-bold block ${
                                rec.type === 'credit_deposit' ? 'text-emerald-600' : 'text-surface-800 dark:text-surface-150'
                              }`}>
                                {rec.type === 'credit_deposit' ? '+' : '-'} R$ {rec.amount.toFixed(2)}
                              </span>
                              <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                rec.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {rec.status === 'paid' ? 'Liquidado' : 'Aberto'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Deposito Calção & Limite Inadimplência */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Calcao Balance */}
                    <div className="bg-gradient-to-r from-emerald-550 to-teal-650 p-4 rounded-xl text-white shadow relative overflow-hidden">
                      <div className="absolute right-2 -bottom-2 text-white/10 font-extrabold text-6xl select-none">
                        $
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Saldo Calção Antecipado</span>
                      <h3 className="text-2xl font-extrabold mt-1">R$ {(selectedTutor.credits || 0).toFixed(2)}</h3>
                      <p className="text-[10px] text-emerald-100 mt-2 leading-tight">
                        Este valor é debitado automaticamente pelas doses aplicadas e diárias geradas no Mapa de Internação.
                      </p>
                    </div>

                    {/* Form de Deposito */}
                    <div className="p-4 border border-surface-200 dark:border-surface-700 rounded-lg bg-white dark:bg-surface-900/10 space-y-3">
                      <h5 className="text-xs font-bold text-surface-700 dark:text-white flex items-center gap-1">
                        <span>💰</span> Depositar Créditos
                      </h5>
                      <form onSubmit={handleDeposit} className="space-y-3">
                        <div>
                          <label className="block text-[10px] text-surface-500 mb-0.5">Valor do Depósito (R$)</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-surface-400">R$</span>
                            <input
                              type="number"
                              required
                              min="1"
                              step="0.01"
                              value={depositAmount || ''}
                              onChange={(e) => setDepositAmount(Number(e.target.value))}
                              placeholder="0.00"
                              className="w-full pl-8 pr-2.5 py-1.5 text-xs border rounded bg-surface-50 dark:bg-surface-900 font-bold focus:outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-1.5 bg-emerald-555 hover:bg-emerald-600 text-white font-bold rounded text-xs shadow transition-colors cursor-pointer"
                        >
                          Confirmar Depósito Calção
                        </button>
                      </form>
                    </div>

                    {/* Controle Administrativo de Inadimplência */}
                    <div className="p-4 border border-red-500/25 bg-red-500/5 rounded-lg space-y-3">
                      <h5 className="text-xs font-bold text-red-800 dark:text-red-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" /> Controle de Inadimplência
                      </h5>
                      <p className="text-[10px] text-surface-500 leading-tight">
                        Ao bloquear um tutor, nenhuma consulta poderá ser agendada e nenhum pet poderá ser adicionado.
                      </p>
                      
                      <button
                        type="button"
                        onClick={handleToggleDebt}
                        className={`w-full py-2 rounded text-xs font-bold cursor-pointer transition-colors border ${
                          selectedTutor.hasDebt
                            ? 'bg-emerald-100 hover:bg-emerald-200 border-emerald-350 text-emerald-800'
                            : 'bg-red-100 hover:bg-red-200 border-red-350 text-red-800'
                        }`}
                      >
                        {selectedTutor.hasDebt ? '✅ Regularizar Tutor (Desbloquear)' : '🔒 Bloquear Tutor (Marcar Devedor)'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB 4: PORTAL DO TUTOR (SIMPLESPET RESIDENCIAL MOCK) ==================== */}
              {activeTab === 'simplespet' && (
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="text-center max-w-md mb-6">
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Preview Residencial SimplesPet
                    </span>
                    <h4 className="text-base font-bold mt-2 text-surface-850 dark:text-white">Ficha de Acompanhamento do Tutor</h4>
                    <p className="text-xs text-surface-500 mt-1">
                      Abaixo está a interface que {selectedTutor.name} accesses do próprio celular em casa para monitorar seus animais.
                    </p>
                  </div>

                  {/* Smartphone Frame Mockup */}
                  <div className="w-[320px] h-[580px] rounded-[36px] bg-surface-950 border-[6px] border-surface-800 shadow-modal overflow-hidden flex flex-col relative">
                    
                    {/* Speaker & Camera slot */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-surface-800 rounded-b-xl z-20 flex justify-center items-center">
                      <div className="w-12 h-1 bg-surface-900 rounded-full" />
                      <div className="w-2.5 h-2.5 bg-surface-900 rounded-full ml-3" />
                    </div>

                    {/* Smartphone Screen Content */}
                    <div className="flex-1 bg-[#0A0E1A] text-white p-4 pt-8 overflow-y-auto space-y-4 font-sans select-none">
                      {/* App Navbar */}
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
                        <span className="text-xs font-bold text-emerald-400">SimplesPet 🐾</span>
                        <div className="flex items-center gap-1.5 text-[9px] text-surface-400">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Online
                        </div>
                      </div>

                      {/* Welcome Card */}
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                        <span className="text-[9px] text-surface-450 uppercase block font-semibold">Tutor Responsável</span>
                        <h5 className="text-xs font-bold">{selectedTutor.name}</h5>
                        <div className="flex justify-between items-center pt-2 text-[9px] text-surface-400 border-t border-white/5">
                          <span>Plano: {tutorPlanName || 'Padrão'}</span>
                          <span>Atendimentos: {pets.filter((p) => p.tutorId === selectedTutor.id).length} Pets</span>
                        </div>
                      </div>

                      {/* Pets List Section */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-surface-450 font-bold uppercase block tracking-wider">Meus Animais</span>
                        {pets.filter((p) => p.tutorId === selectedTutor.id).map((pet) => (
                          <div key={pet.id} className="p-2.5 bg-white/5 rounded-lg border border-white/5 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold flex items-center gap-1">
                                🐕 {pet.name}
                              </span>
                              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.2 rounded-full font-bold">
                                Clínico Ok
                              </span>
                            </div>

                            {/* Prontuario Resumido */}
                            <div className="space-y-1 border-t border-white/5 pt-2 text-[9px] text-surface-350">
                              <div className="flex justify-between">
                                <span>Espécie / Raça</span>
                                <span className="font-semibold text-white">{pet.species === 'dog' ? 'Cão' : 'Gato'} • {pet.breed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Última Receita</span>
                                <span className="font-semibold text-emerald-400 flex items-center gap-0.5">Ceftriaxona IV</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Peso Acompanhado</span>
                                <span className="font-semibold text-white">{pet.weight} kg</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Notificacoes / Avisos */}
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1.5">
                        <span className="text-[10px] text-indigo-400 font-bold block flex items-center gap-1">
                          <span>🔔</span> Lembrete de Saúde
                        </span>
                        <p className="text-[9px] text-surface-300 leading-tight">
                          A vacina Antirrábica de Thor está agendada para renovação automática no próximo mês. Acompanhe pelo CRM!
                        </p>
                      </div>

                      {/* Calção Preview */}
                      <div className="p-3 bg-emerald-555/10 border border-emerald-500/20 rounded-xl text-center">
                        <span className="text-[9px] text-emerald-400 block font-bold">Saldo de Adiantamento Ativo</span>
                        <h4 className="text-base font-extrabold text-white mt-0.5">R$ {(selectedTutor.credits || 0).toFixed(2)}</h4>
                        <span className="text-[8px] text-surface-450 mt-1 block">Tudo sob controle financeiro</span>
                      </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="h-6 bg-surface-950 shrink-0 flex justify-center items-center">
                      <div className="w-24 h-1 bg-surface-700 rounded-full" />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-5 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/40 flex justify-between items-center shrink-0">
              <span className="text-[10.5px] text-surface-500">
                MVPet Ficha CRM • Rastreamento de Logs Ativo
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTutor(null)}
                  className="px-4 py-2 border border-surface-200 dark:border-surface-700 hover:bg-surface-100 rounded text-xs font-semibold cursor-pointer"
                >
                  Fechar Ficha
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
