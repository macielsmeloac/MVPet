import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { Search, FileText, Clock, Syringe, Stethoscope, Sparkles, ChevronDown, ChevronRight, AlertTriangle, Heart, Plus, Trash2, Pill, Building, Users, CreditCard, Scale, Activity, FlaskConical, Camera, Droplets, FileEdit, MessageSquare, Video, BedSingle } from 'lucide-react';
import type { Pet, SavedMedicalRecord, VaccinationRecord, VaccineType, Prescription } from '../types';

function calculateAge(birthDateStr: string): string {
  if (!birthDateStr) return 'Idade não informada';
  const birthDate = new Date(birthDateStr);
  const now = new Date();
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
}


function PetSummaryCard({ pet, tutorName, onClick, isSelected }: { pet: Pet; tutorName: string; onClick: () => void; isSelected: boolean }) {
  return (
    <button onClick={onClick} className={`w-full text-left p-3 rounded-[var(--radius-md)] border transition-all duration-200 ${isSelected ? 'border-primary-400 bg-primary-50 dark:bg-primary-950/30 dark:border-primary-600' : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-surface-300 dark:hover:border-surface-600'}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-lg font-bold text-primary-700 dark:text-primary-400 shrink-0">
          {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : pet.species === 'bird' ? '🐦' : '🐾'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-surface-800 dark:text-white truncate">{pet.name}</span>
            {pet.isAggressive && <span className="text-[9px] font-bold bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 px-1.5 py-0.5 rounded-full">⚠️ BRAVO</span>}
          </div>
          <p className="text-xs text-surface-500 truncate">{pet.breed} · {pet.weight}kg · {tutorName}</p>
        </div>
      </div>
    </button>
  );
}

function AnamnesisSection({ title, icon: Icon, legend, children, defaultOpen = false }: { title: string; icon: typeof Stethoscope; legend?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-surface-200 dark:border-surface-700 rounded-[var(--radius-lg)] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors text-left">
        <Icon className="w-4 h-4 text-primary-500 shrink-0" />
        <span className="font-semibold text-sm text-surface-800 dark:text-white flex-1">{title}</span>
        {legend && <span className="text-[11px] text-surface-400 italic hidden sm:inline">{legend}</span>}
        {open ? <ChevronDown className="w-4 h-4 text-surface-400" /> : <ChevronRight className="w-4 h-4 text-surface-400" />}
      </button>
      {open && <div className="p-4 space-y-3 bg-white dark:bg-surface-800">{children}</div>}
    </div>
  );
}

function FieldGroup({ label, legend, children }: { label: string; legend?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1 flex items-center gap-2">
        {label}
        {legend && <span className="text-[10px] text-surface-400 italic font-normal">({legend})</span>}
      </label>
      {children}
    </div>
  );
}

function TextArea({ placeholder, rows = 2, value, onChange }: { placeholder?: string; rows?: number; value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) {
  return <textarea rows={rows} placeholder={placeholder} value={value} onChange={onChange} className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder:text-surface-400 resize-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />;
}

function SystemCheckItem({ label, legend }: { label: string; legend: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex items-start gap-3 p-2 rounded-[var(--radius-sm)] hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors">
      <input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} className="mt-0.5 w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500/30" />
      <div className="flex-1">
        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{label}</span>
        <p className="text-[11px] text-surface-400 italic">{legend}</p>
        {checked && <textarea rows={1} placeholder="Observações..." className="mt-1.5 w-full text-xs border border-surface-200 dark:border-surface-700 rounded-[var(--radius-sm)] px-2 py-1.5 bg-surface-50 dark:bg-surface-900 text-surface-700 dark:text-surface-300 resize-none" />}
      </div>
    </div>
  );
}

export function MedicalRecordsPage() {
  const { pets, tutors, medicalRecords, vaccinations, addMedicalRecord, addVaccination, updatePet } = useDataStore();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const [activeTab, setActiveTab] = useState<'nova' | 'historico' | 'prescricoes' | 'vacinas'>('nova');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.selectedPetId) {
      setSelectedPetId(location.state.selectedPetId);
      setActiveTab('historico');
    }
  }, [location.state]);

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [conduct, setConduct] = useState('');
  const [observations, setObservations] = useState('');
  const [nextReturn, setNextReturn] = useState('');
  const [prescriptions, setPrescriptions] = useState<Omit<Prescription, 'id'>[]>([]);

  // Stage 2 States
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [showObsModal, setShowObsModal] = useState(false);
  const [newObsText, setNewObsText] = useState('');

  // Stage 3 States
  const [showPathologyModal, setShowPathologyModal] = useState(false);
  const [newPathology, setNewPathology] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [showExamModal, setShowExamModal] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaType, setMediaType] = useState<'Fotos' | 'Vídeo'>('Fotos');
  const [mediaUrl, setMediaUrl] = useState('');

  const handleActionClick = (label: string) => {
    if (label === 'Atendimento') {
      setActiveTab('nova');
    } else if (label === 'Vacina') {
      setActiveTab('vacinas');
      setShowNewVaccine(true);
    } else if (label === 'Receita') {
      setActiveTab('nova');
      // Scroll to prescriptions section if possible, or just open the tab
    } else if (label === 'Peso') {
      setNewWeight(selectedPet?.weight?.toString() || '');
      setShowWeightModal(true);
    } else if (label === 'Observações') {
      setNewObsText('');
      setShowObsModal(true);
    } else if (label === 'Patologia') {
      setNewPathology('');
      setShowPathologyModal(true);
    } else if (label === 'Documento') {
      setNewDocName('');
      setShowDocModal(true);
    } else if (label === 'Exame') {
      setNewExamName('');
      setShowExamModal(true);
    } else if (label === 'Fotos' || label === 'Vídeo') {
      setMediaType(label);
      setMediaUrl('');
      setShowMediaModal(true);
    } else if (label === 'Internação') {
      if (selectedPet) {
        navigate('/internacao', { state: { selectedPetId: selectedPet.id } });
      }
    }
  };

  const handleSaveWeight = () => {
    if (!selectedPet || !newWeight) return;
    updatePet(selectedPet.id, { weight: parseFloat(newWeight) });
    setShowWeightModal(false);
    
    // Opcional: Adicionar um registro no histórico
    const record: SavedMedicalRecord = {
      id: crypto.randomUUID(),
      petId: selectedPet.id,
      date: new Date().toISOString(),
      veterinarianName: 'Sistema',
      chiefComplaint: 'Atualização de Peso',
      conduct: `Peso atualizado para ${newWeight} kg`,
      observations: '',
      prescriptions: [],
      createdAt: new Date().toISOString(),
    };
    addMedicalRecord(record);
  };

  const handleSaveObs = () => {
    if (!selectedPet || !newObsText) return;
    const record: SavedMedicalRecord = {
      id: crypto.randomUUID(),
      petId: selectedPet.id,
      date: new Date().toISOString(),
      veterinarianName: 'Sistema',
      chiefComplaint: 'Observação Rápida',
      conduct: newObsText,
      observations: '',
      prescriptions: [],
      createdAt: new Date().toISOString(),
    };
    addMedicalRecord(record);
    setShowObsModal(false);
  };

  const handleSaveGenericAction = (title: string, desc: string, closeModal: () => void) => {
    if (!selectedPet) return;
    const record: SavedMedicalRecord = {
      id: crypto.randomUUID(),
      petId: selectedPet.id,
      date: new Date().toISOString(),
      veterinarianName: 'Sistema',
      chiefComplaint: title,
      conduct: desc,
      observations: '',
      prescriptions: [],
      createdAt: new Date().toISOString(),
    };
    addMedicalRecord(record);
    closeModal();
  };

  const [showNewVaccine, setShowNewVaccine] = useState(false);
  const [newVaccine, setNewVaccine] = useState<Partial<VaccinationRecord>>({});

  const filteredPets = pets.filter((p) => {
    const tutor = tutors.find((t) => t.id === p.tutorId);
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q) || (tutor?.name ?? '').toLowerCase().includes(q);
  });

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const selectedTutor = selectedPet ? tutors.find((t) => t.id === selectedPet.tutorId) : null;

  useEffect(() => {
    setChiefComplaint('');
    setConduct('');
    setObservations('');
    setNextReturn('');
    setPrescriptions([]);
    setActiveTab('nova');
    setShowNewVaccine(false);
    setShowAiPanel(false);
  }, [selectedPetId]);

  const handleAiSummary = () => {
    setShowAiPanel(true);
    setAiResponse('');
    const pet = selectedPet;
    if (!pet) return;
    const summary = `📋 **Resumo Clínico — ${pet.name}**\n\n🐾 ${pet.breed}, ${pet.sex === 'male' ? 'Macho' : 'Fêmea'}, ${pet.weight}kg${pet.neutered ? ', castrado(a)' : ''}\n${pet.allergies.length > 0 ? `⚠️ Alergias: ${pet.allergies.join(', ')}` : '✅ Sem alergias conhecidas'}\n${pet.isAggressive ? '🔴 ALERTA: Animal agressivo - usar contenção' : ''}\n\n📅 Últimos 3 meses:\n• Check-up de rotina realizado (sem alterações)\n• Vacinação V10 aplicada em dia\n• Peso estável\n\n💊 Sugestão de dosagem (baseado no peso ${pet.weight}kg):\n• Amoxicilina: ${(pet.weight * 22).toFixed(0)}mg VO BID\n• Meloxicam: ${(pet.weight * 0.1).toFixed(1)}mg SC SID\n• Dipirona: ${(pet.weight * 25).toFixed(0)}mg VO TID`;

    let i = 0;
    const interval = setInterval(() => {
      setAiResponse(summary.slice(0, i));
      i += 3;
      if (i > summary.length) { setAiResponse(summary); clearInterval(interval); }
    }, 15);
  };

  const handleSaveRecord = () => {
    if (!selectedPet) return;
    const record: SavedMedicalRecord = {
      id: `record-${Date.now()}`,
      petId: selectedPet.id,
      date: new Date().toISOString().split('T')[0] || '',
      veterinarianName: 'Dra. Silva', // Placeholder until auth is connected
      chiefComplaint,
      conduct,
      observations,
      nextReturn,
      prescriptions: prescriptions.map(p => ({ ...p, id: `presc-${Date.now()}-${Math.random()}` })),
      createdAt: new Date().toISOString(),
    };
    addMedicalRecord(record);
    
    // Reset form and switch tab
    setChiefComplaint('');
    setConduct('');
    setObservations('');
    setNextReturn('');
    setPrescriptions([]);
    setActiveTab('historico');
  };

  const handleSaveVaccine = () => {
    if (!selectedPet || !newVaccine.vaccineName || !newVaccine.vaccineType || !newVaccine.applicationDate) return;
    addVaccination({
      id: `vac-${Date.now()}`,
      petId: selectedPet.id,
      vaccineName: newVaccine.vaccineName,
      vaccineType: newVaccine.vaccineType as VaccineType,
      applicationDate: newVaccine.applicationDate,
      nextDoseDate: newVaccine.nextDoseDate,
      veterinarianName: 'Dra. Silva',
      lot: newVaccine.lot,
      manufacturer: newVaccine.manufacturer,
      notes: newVaccine.notes,
    });
    setShowNewVaccine(false);
    setNewVaccine({});
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medication: '', dosage: '', route: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof Omit<Prescription, 'id'>, value: string) => {
    const newP = [...prescriptions];
    const item = { ...newP[index] } as any;
    item[field] = value;
    newP[index] = item;
    setPrescriptions(newP);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Prontuários</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Pet list */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input type="text" placeholder="Buscar pet ou tutor..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
          </div>
          <div className="space-y-1.5 max-h-[calc(100vh-240px)] overflow-y-auto">
            {filteredPets.map((pet) => {
              const tutor = tutors.find((t) => t.id === pet.tutorId);
              return <PetSummaryCard key={pet.id} pet={pet} tutorName={tutor?.name ?? ''} onClick={() => setSelectedPetId(pet.id)} isSelected={selectedPetId === pet.id} />;
            })}
          </div>
        </div>

        {/* Record area */}
        <div className="min-w-0">
          {!selectedPet ? (
            <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-16 text-center">
              <FileText className="w-12 h-12 text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500 text-sm">Selecione um pet para visualizar o prontuário</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* NOVO TOP BAR INSPIRADO NA IMAGEM */}
              <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-4 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:divide-x divide-surface-200 dark:divide-surface-700">
                  {/* Informações do Tutor */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-lg font-bold text-primary-700 dark:text-primary-400 shrink-0">
                      👤
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-surface-900 dark:text-white">{selectedTutor?.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">★ 5.0</span>
                      </div>
                      <p className="text-xs text-surface-500">{selectedTutor?.email} • {selectedTutor?.phone}</p>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Saldo credor: R$ {(selectedTutor?.credits ?? 150).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Informações do Pet */}
                  <div className="flex items-center justify-between gap-3 lg:pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-lg shrink-0">
                        {selectedPet.species === 'dog' ? '🐕' : selectedPet.species === 'cat' ? '🐈' : '🐾'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-surface-900 dark:text-white">{selectedPet.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 animate-pulse">
                            Animal Internado
                          </span>
                        </div>
                        <p className="text-xs text-surface-500">
                          {selectedPet.breed} • {selectedPet.sex === 'male' ? 'Macho' : 'Fêmea'} • {selectedPet.neutered ? 'Castrado' : 'Fértil'}
                        </p>
                        <p className="text-xs text-surface-500">
                          Peso: {selectedPet.weight ? `${selectedPet.weight} kg` : 'Não informado'} • {calculateAge(selectedPet.birthDate)}
                        </p>
                      </div>
                    </div>
                    {/* Botão Copilot Clínico */}
                    <button onClick={handleAiSummary} className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 text-white text-xs font-medium rounded-[var(--radius-md)] transition-all shadow-sm shrink-0">
                      <Sparkles className="w-3.5 h-3.5" /> Copilot IA
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Panel */}
              {showAiPanel && (
                <div className="bg-gradient-to-br from-primary-50 to-teal-50 dark:from-primary-950/30 dark:to-teal-950/30 rounded-[var(--radius-lg)] border border-primary-200 dark:border-primary-800 p-4 animate-scale-in">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">Copilot Clínico</span>
                    <button onClick={() => setShowAiPanel(false)} className="ml-auto text-xs text-surface-400 hover:text-surface-600">Fechar</button>
                  </div>
                  <pre className="text-xs text-surface-700 dark:text-surface-300 whitespace-pre-wrap font-sans leading-relaxed">{aiResponse || '⏳ Gerando resumo...'}</pre>
                </div>
              )}

              {/* GRID PRINCIPAL DE 3 COLUNAS */}
              <div className="grid grid-cols-1 xl:grid-cols-[250px_1fr_260px] gap-4 items-start">
                
                {/* Coluna 1: Venda & Orçamentos (Esquerda) */}
                <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-4 shadow-sm flex flex-col min-h-[300px]">
                  <div className="flex gap-2 border-b border-surface-200 dark:border-surface-700 pb-2 mb-3">
                    <button className="flex-1 text-center py-1 text-xs font-bold border-b-2 border-primary-500 text-primary-600 dark:text-primary-400">Venda</button>
                    <button className="flex-1 text-center py-1 text-xs font-bold text-surface-400 hover:text-surface-600">Orçamentos</button>
                  </div>
                  <button className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-[var(--radius-md)] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors mb-4">
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <FileText className="w-8 h-8 text-surface-300 mb-2" />
                    <p className="text-[11px] text-surface-400">Nenhum item cadastrado</p>
                  </div>
                </div>

                {/* Coluna 2: Prontuário / Linha do Tempo Central */}
                <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-4 shadow-sm space-y-4">
                  {/* Abas da timeline central */}
                  <div className="flex items-center gap-2 border-b border-surface-200 dark:border-surface-700 pb-2 mb-1 overflow-x-auto">
                    {(['Histórico', 'Protocolos', 'Linha de tempo', 'Agenda', 'Vendas'] as const).map((tab, idx) => {
                      // Vamos mapear as abas da timeline com os modos de exibição que já temos
                      const isTimelineActive = activeTab === 'historico' && idx === 2;
                      const isNovaActive = activeTab === 'nova' && idx === 0;
                      const isPrescActive = activeTab === 'prescricoes' && idx === 1;
                      const isVacActive = activeTab === 'vacinas' && idx === 3;
                      
                      const isCurrent = isTimelineActive || isNovaActive || isPrescActive || isVacActive || (idx === 4 && activeTab === 'prescricoes'); // fallbacks
                      
                      return (
                        <button 
                          key={tab} 
                          onClick={() => {
                            if (idx === 0) setActiveTab('nova');
                            else if (idx === 1) setActiveTab('prescricoes');
                            else if (idx === 2) setActiveTab('historico');
                            else if (idx === 3) setActiveTab('vacinas');
                          }}
                          className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold whitespace-nowrap transition-colors ${isCurrent ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  {/* Conteúdo dinâmico da consulta / histórico */}
                  <div className="space-y-4">

              {activeTab === 'nova' && (
                <div className="space-y-3 animate-fade-in">
                  <AnamnesisSection title="Queixa Principal (QP)" icon={Stethoscope} legend="Motivo da consulta sob a ótica do tutor" defaultOpen>
                    <FieldGroup label="Queixa Principal" legend="ex: Vômitos frequentes há 3 dias">
                      <TextArea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} placeholder="Descreva a queixa principal do tutor..." />
                    </FieldGroup>
                  </AnamnesisSection>

                  <AnamnesisSection title="História da Moléstia Atual (HMA)" icon={Clock} legend="Detalhamento cronológico dos sintomas">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FieldGroup label="Início" legend="Quando os sintomas começaram"><TextArea placeholder="Há quanto tempo..." /></FieldGroup>
                      <FieldGroup label="Evolução" legend="Melhora ou piora ao longo do tempo"><TextArea placeholder="Progressão dos sintomas..." /></FieldGroup>
                      <FieldGroup label="Intensidade e Frequência"><TextArea placeholder="Leve/moderada/intensa, frequência..." /></FieldGroup>
                      <FieldGroup label="Sintomas Associados"><TextArea placeholder="Outros sintomas observados..." /></FieldGroup>
                      <FieldGroup label="Fatores de Melhora/Piora"><TextArea placeholder="O que melhora ou piora..." /></FieldGroup>
                      <FieldGroup label="Tratamentos Anteriores"><TextArea placeholder="Medicamentos já utilizados e resposta..." /></FieldGroup>
                    </div>
                    <FieldGroup label="Impacto no Comportamento" legend="Alterações na rotina ou comportamento do paciente">
                      <TextArea placeholder="Mudanças no apetite, atividade, humor..." />
                    </FieldGroup>
                  </AnamnesisSection>

                  <AnamnesisSection title="Alimentação e Hábitos" icon={Heart} legend="Dieta, água, fezes e urina">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FieldGroup label="Tipo de Alimentação" legend="Ração seca, úmida, dieta natural"><TextArea placeholder="Tipo e marca da alimentação..." /></FieldGroup>
                      <FieldGroup label="Quantidade e Frequência"><TextArea placeholder="Quantidade por refeição, vezes ao dia..." /></FieldGroup>
                      <FieldGroup label="Consumo de Água"><TextArea placeholder="Normal, aumentado, diminuído..." /></FieldGroup>
                      <FieldGroup label="Alterações em Fezes/Urina" legend="Cor, volume, odor"><TextArea placeholder="Descreva as alterações observadas..." /></FieldGroup>
                    </div>
                  </AnamnesisSection>

                  <AnamnesisSection title="Antecedentes Médicos e Vacinação" icon={Syringe}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FieldGroup label="Doenças Prévias"><TextArea placeholder="Doenças anteriores..." /></FieldGroup>
                      <FieldGroup label="Cirurgias/Procedimentos"><TextArea placeholder="Cirurgias realizadas..." /></FieldGroup>
                      <FieldGroup label="Medicamentos em Uso" legend="dose e horários"><TextArea placeholder="Medicamentos contínuos..." /></FieldGroup>
                      <FieldGroup label="Alergias Conhecidas"><TextArea placeholder={selectedPet.allergies.length > 0 ? selectedPet.allergies.join(', ') : 'Nenhuma conhecida'} /></FieldGroup>
                    </div>
                    <FieldGroup label="Status Vacinal">
                      <div className="flex gap-3">
                        {(['Em dia', 'Pendente', 'Atrasada'] as const).map((s) => (
                          <label key={s} className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
                            <input type="radio" name="vacStatus" value={s} className="text-primary-500 focus:ring-primary-500/30" />{s}
                          </label>
                        ))}
                      </div>
                    </FieldGroup>
                  </AnamnesisSection>

                  <AnamnesisSection title="Revisão por Sistemas" icon={AlertTriangle} legend="Checklist clínico com legendas sugestivas">
                    <div className="space-y-1">
                      <SystemCheckItem label="Sistema Respiratório" legend="tosse, espirros, dificuldades respiratórias, secreção nasal" />
                      <SystemCheckItem label="Sistema Cardiovascular" legend="cansaço, desmaios, palpitações, intolerância ao exercício" />
                      <SystemCheckItem label="Sistema Gastrointestinal" legend="náuseas, diarreia, vômitos, constipação, flatulência" />
                      <SystemCheckItem label="Sistema Neurológico" legend="convulsões, síncope, alterações motoras, desorientação" />
                      <SystemCheckItem label="Sistema Dermatológico" legend="prurido, lesões, alopecia, descamação" />
                      <SystemCheckItem label="Sistema Oftálmico" legend="secreção ocular, vermelhidão, opacidade, lacrimejamento" />
                      <SystemCheckItem label="Sistema Musculoesquelético" legend="claudicação, dor articular, rigidez, atrofia" />
                      <SystemCheckItem label="Sistema Urogenital" legend="alterações na micção, secreções, poliúria, polidipsia" />
                    </div>
                  </AnamnesisSection>

                  <AnamnesisSection title="Conduta e Prescrição Digital" icon={FileText} defaultOpen>
                    <div className="space-y-4">
                      <FieldGroup label="Conduta Clínica">
                        <TextArea value={conduct} onChange={e => setConduct(e.target.value)} placeholder="Descreva a conduta clínica e tratamentos..." rows={3} />
                      </FieldGroup>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-surface-600 dark:text-surface-400">Prescrição Medicamentosa</label>
                          <button onClick={addPrescription} className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Adicionar Medicamento
                          </button>
                        </div>
                        
                        {prescriptions.length === 0 ? (
                          <div className="text-center py-4 bg-surface-50 dark:bg-surface-800/50 border border-dashed border-surface-300 dark:border-surface-600 rounded-[var(--radius-md)] text-xs text-surface-500">
                            Nenhum medicamento prescrito.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {prescriptions.map((p, idx) => (
                              <div key={idx} className="p-3 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] flex gap-2 items-start">
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <input type="text" placeholder="Medicamento" className="text-xs px-2 py-1.5 border border-surface-200 dark:border-surface-700 rounded bg-white dark:bg-surface-900" value={p.medication} onChange={e => updatePrescription(idx, 'medication', e.target.value)} />
                                  <input type="text" placeholder="Dose (ex: 1/2 comp)" className="text-xs px-2 py-1.5 border border-surface-200 dark:border-surface-700 rounded bg-white dark:bg-surface-900" value={p.dosage} onChange={e => updatePrescription(idx, 'dosage', e.target.value)} />
                                  <input type="text" placeholder="Via (ex: Oral)" className="text-xs px-2 py-1.5 border border-surface-200 dark:border-surface-700 rounded bg-white dark:bg-surface-900" value={p.route} onChange={e => updatePrescription(idx, 'route', e.target.value)} />
                                  <input type="text" placeholder="Frequência (ex: 12/12h)" className="text-xs px-2 py-1.5 border border-surface-200 dark:border-surface-700 rounded bg-white dark:bg-surface-900" value={p.frequency} onChange={e => updatePrescription(idx, 'frequency', e.target.value)} />
                                  <input type="text" placeholder="Duração (ex: 7 dias)" className="col-span-2 text-xs px-2 py-1.5 border border-surface-200 dark:border-surface-700 rounded bg-white dark:bg-surface-900" value={p.duration} onChange={e => updatePrescription(idx, 'duration', e.target.value)} />
                                  <input type="text" placeholder="Instruções adicionais..." className="col-span-2 text-xs px-2 py-1.5 border border-surface-200 dark:border-surface-700 rounded bg-white dark:bg-surface-900" value={p.instructions || ''} onChange={e => updatePrescription(idx, 'instructions', e.target.value)} />
                                </div>
                                <button onClick={() => removePrescription(idx)} className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <FieldGroup label="Observações Gerais">
                          <TextArea value={observations} onChange={e => setObservations(e.target.value)} placeholder="Observações adicionais..." />
                        </FieldGroup>
                        <FieldGroup label="Próximo Retorno Programado">
                          <input type="date" value={nextReturn} onChange={e => setNextReturn(e.target.value)} className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200" />
                        </FieldGroup>
                      </div>
                    </div>
                  </AnamnesisSection>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={handleSaveRecord} className="px-6 py-2.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-[var(--radius-md)] transition-colors shadow-sm">
                      💾 Salvar Prontuário
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'historico' && (
                <div className="space-y-6 animate-fade-in pl-2">
                  {medicalRecords.filter(r => r.petId === selectedPet.id).length === 0 ? (
                    <div className="text-center py-12 text-surface-500 bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700">
                      Nenhum histórico encontrado para este paciente.
                    </div>
                  ) : (
                    (() => {
                      const petRecords = medicalRecords.filter(r => r.petId === selectedPet.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      const recordsByYear = petRecords.reduce((acc, record) => {
                        const year = new Date(record.date).getFullYear();
                        if (!acc[year]) acc[year] = [];
                        acc[year].push(record);
                        return acc;
                      }, {} as Record<number, typeof petRecords>);
                      const years = Object.keys(recordsByYear).map(Number).sort((a, b) => b - a) as number[];

                      return years.map((year, yearIdx) => (
                        <div key={year} className="relative">
                          <h4 className="text-sm font-semibold text-surface-500 mb-4">{year}</h4>
                          <div className="space-y-6">
                            {(recordsByYear[year] ?? []).map((record, idx) => {
                              const dateObj = new Date(record.date);
                              const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')} às ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                              
                              let initials = 'RG';
                              let colorClass = 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300';
                              
                              const type = record.chiefComplaint?.toLowerCase() || '';
                              if (type.includes('peso')) { initials = 'PE'; colorClass = 'bg-[#a19e34] text-white'; }
                              else if (type.includes('patologia')) { initials = 'PA'; colorClass = 'bg-[#4a1c40] text-white'; }
                              else if (type.includes('documento')) { initials = 'DO'; colorClass = 'bg-emerald-500 text-white'; }
                              else if (type.includes('exame')) { initials = 'EX'; colorClass = 'bg-red-500 text-white'; }
                              else if (type.includes('mídia') || type.includes('foto') || type.includes('vídeo')) { initials = 'MD'; colorClass = 'bg-[#1e3a8a] text-white'; }
                              else if (type.includes('vacina')) { initials = 'VA'; colorClass = 'bg-orange-500 text-white'; }
                              else if (type.includes('receita') || type.includes('prescrição')) { initials = 'RE'; colorClass = 'bg-purple-600 text-white'; }
                              else if (type.includes('observação')) { initials = 'OB'; colorClass = 'bg-slate-700 text-white'; }
                              else if (type.includes('internação')) { initials = 'IN'; colorClass = 'bg-red-800 text-white'; }
                              else { initials = 'AT'; colorClass = 'bg-blue-500 text-white'; }

                              // Se não for o último item geral, desenha a linha para baixo
                              const isLastOverall = yearIdx === years.length - 1 && idx === (recordsByYear[year]?.length ?? 0) - 1;

                              return (
                                <div key={record.id} className="relative flex gap-4">
                                  {!isLastOverall && (
                                    <div className="absolute left-[19px] top-10 bottom-[-24px] w-px bg-surface-200 dark:bg-surface-700"></div>
                                  )}
                                  
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold z-10 ${colorClass}`}>
                                    {initials}
                                  </div>
                                  
                                  <div className="flex-1 pb-2">
                                    <p className="text-xs text-surface-500">{dateStr}</p>
                                    <p className="text-sm font-semibold text-surface-900 dark:text-white mt-0.5">{record.chiefComplaint || 'Atendimento'}</p>
                                    {record.conduct && <p className="text-sm text-surface-600 dark:text-surface-400 mt-1 line-clamp-2" title={record.conduct}>{record.conduct}</p>}
                                    {record.observations && <p className="text-xs text-surface-500 italic mt-1 border-l-2 border-surface-200 dark:border-surface-700 pl-2">{record.observations}</p>}
                                    {record.prescriptions && record.prescriptions.length > 0 && (
                                      <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1"><Pill className="w-3 h-3" /> {record.prescriptions.length} Medicamento(s) prescrito(s)</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()
                  )}
                </div>
              )}

              {activeTab === 'prescricoes' && (
                <div className="space-y-4 animate-fade-in">
                  {medicalRecords.filter(r => r.petId === selectedPet.id && r.prescriptions.length > 0).flatMap(r => r.prescriptions.map(p => ({ ...p, date: r.date, vet: r.veterinarianName }))).length === 0 ? (
                    <div className="text-center py-12 text-surface-500 bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700">
                      Nenhuma prescrição encontrada.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {medicalRecords.filter(r => r.petId === selectedPet.id).flatMap(r => r.prescriptions.map(p => ({ ...p, date: r.date, vet: r.veterinarianName }))).map((presc, idx) => (
                        <div key={idx} className="p-4 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-lg)] flex items-start gap-3 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                            <Pill className="w-5 h-5 text-primary-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-surface-900 dark:text-white truncate">{presc.medication}</p>
                            <p className="text-sm text-surface-600 dark:text-surface-400 font-medium">{presc.dosage}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                              <span className="text-[10px] bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 px-1.5 py-0.5 rounded">Via {presc.route}</span>
                              <span className="text-[10px] bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 px-1.5 py-0.5 rounded">{presc.frequency}</span>
                              <span className="text-[10px] bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 px-1.5 py-0.5 rounded">{presc.duration}</span>
                            </div>
                            {presc.instructions && <p className="text-xs text-surface-500 italic border-l-2 border-surface-200 dark:border-surface-700 pl-2 mb-2">{presc.instructions}</p>}
                            <p className="text-[10px] text-surface-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(presc.date).toLocaleDateString('pt-BR')} • {presc.vet}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'vacinas' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                        <Syringe className="w-5 h-5 text-teal-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-surface-900 dark:text-white">Carteira de Vacinação</h3>
                        <p className="text-xs text-surface-500">Controle imunológico do paciente</p>
                      </div>
                    </div>
                    <button onClick={() => setShowNewVaccine(!showNewVaccine)} className="px-3 py-1.5 text-sm font-medium bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors flex items-center gap-1">
                      {showNewVaccine ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nova Vacina</>}
                    </button>
                  </div>
                  
                  {showNewVaccine && (
                    <div className="p-4 bg-teal-50/50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800/50 rounded-[var(--radius-lg)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
                      <div className="lg:col-span-2">
                        <FieldGroup label="Nome da Vacina"><input type="text" className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900" value={newVaccine.vaccineName || ''} onChange={e => setNewVaccine({...newVaccine, vaccineName: e.target.value})} placeholder="Ex: V10 Importada" /></FieldGroup>
                      </div>
                      <div className="lg:col-span-2">
                        <FieldGroup label="Tipo">
                          <select className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900" value={newVaccine.vaccineType || ''} onChange={e => setNewVaccine({...newVaccine, vaccineType: e.target.value as VaccineType})}>
                            <option value="">Selecione...</option>
                            <option value="V8">V8</option><option value="V10">V10</option><option value="Raiva">Raiva</option><option value="Gripe">Gripe</option><option value="Giardia">Giardia</option><option value="Outro">Outro</option>
                          </select>
                        </FieldGroup>
                      </div>
                      <div className="lg:col-span-1">
                        <FieldGroup label="Lote"><input type="text" className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900" value={newVaccine.lot || ''} onChange={e => setNewVaccine({...newVaccine, lot: e.target.value})} placeholder="0001A" /></FieldGroup>
                      </div>
                      <div className="lg:col-span-1">
                        <FieldGroup label="Fabricante"><input type="text" className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900" value={newVaccine.manufacturer || ''} onChange={e => setNewVaccine({...newVaccine, manufacturer: e.target.value})} placeholder="Ex: Zoetis" /></FieldGroup>
                      </div>
                      <div className="lg:col-span-1">
                        <FieldGroup label="Data Aplicação"><input type="date" className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900" value={newVaccine.applicationDate || ''} onChange={e => setNewVaccine({...newVaccine, applicationDate: e.target.value})} /></FieldGroup>
                      </div>
                      <div className="lg:col-span-1">
                        <FieldGroup label="Próxima Dose"><input type="date" className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900" value={newVaccine.nextDoseDate || ''} onChange={e => setNewVaccine({...newVaccine, nextDoseDate: e.target.value})} /></FieldGroup>
                      </div>
                      <div className="col-span-full">
                        <FieldGroup label="Observações"><TextArea value={newVaccine.notes || ''} onChange={e => setNewVaccine({...newVaccine, notes: e.target.value})} placeholder="Reações, local da aplicação..." /></FieldGroup>
                      </div>
                      <div className="col-span-full flex justify-end">
                        <button onClick={handleSaveVaccine} disabled={!newVaccine.vaccineName || !newVaccine.vaccineType || !newVaccine.applicationDate} className="px-5 py-2 text-sm font-medium bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors shadow-sm">
                          Salvar Vacina
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vaccinations.filter(v => v.petId === selectedPet.id).length === 0 ? (
                      <div className="col-span-full text-center py-8 text-surface-500 border border-dashed border-surface-300 dark:border-surface-700 rounded-[var(--radius-lg)]">
                        Nenhuma vacina registrada para este pet.
                      </div>
                    ) : (
                      vaccinations.filter(v => v.petId === selectedPet.id).sort((a,b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()).map(v => {
                        const isOverdue = v.nextDoseDate && new Date(v.nextDoseDate) < new Date();
                        const isSoon = v.nextDoseDate && new Date(v.nextDoseDate) >= new Date() && new Date(v.nextDoseDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000;
                        
                        return (
                          <div key={v.id} className={`p-4 border rounded-[var(--radius-lg)] bg-white dark:bg-surface-800 ${isOverdue ? 'border-red-300 dark:border-red-800' : isSoon ? 'border-amber-300 dark:border-amber-800' : 'border-surface-200 dark:border-surface-700'}`}>
                            <div className="flex items-start gap-3 mb-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-50 text-red-500 dark:bg-red-900/30' : isSoon ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/30' : 'bg-teal-50 text-teal-500 dark:bg-teal-900/30'}`}>
                                <Syringe className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-surface-900 dark:text-white truncate" title={v.vaccineName}>{v.vaccineName}</p>
                                <p className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 inline-block mt-1">{v.vaccineType}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-1 mt-3 pt-3 border-t border-surface-100 dark:border-surface-700/50 text-xs">
                              <p className="flex justify-between text-surface-600 dark:text-surface-400">
                                <span>Aplicada:</span> 
                                <span className="text-surface-900 dark:text-surface-100">{new Date(v.applicationDate).toLocaleDateString('pt-BR')}</span>
                              </p>
                              {v.nextDoseDate && (
                                <p className="flex justify-between font-medium">
                                  <span className={isOverdue ? 'text-red-600 dark:text-red-400' : isSoon ? 'text-amber-600 dark:text-amber-400' : 'text-surface-600 dark:text-surface-400'}>Próxima dose:</span> 
                                  <span className={isOverdue ? 'text-red-600 dark:text-red-400' : isSoon ? 'text-amber-600 dark:text-amber-400' : 'text-surface-900 dark:text-surface-100'}>{new Date(v.nextDoseDate).toLocaleDateString('pt-BR')}</span>
                                </p>
                              )}
                            </div>
                            
                            {(v.lot || v.manufacturer) && (
                              <p className="text-[10px] text-surface-400 mt-3 pt-2 border-t border-dashed border-surface-100 dark:border-surface-700/50">
                                Lote: {v.lot || '-'} | Fab: {v.manufacturer || '-'}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Coluna 3: Ações Rápidas (Direita) */}
          <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-4 shadow-sm flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3 border-b border-surface-200 dark:border-surface-700 pb-2">Adicionar</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Atendimento', icon: Stethoscope, bg: 'bg-blue-500 hover:bg-blue-600' },
                { label: 'Peso', icon: Scale, bg: 'bg-[#a19e34] hover:bg-[#8c892b]' },
                { label: 'Patologia', icon: Activity, bg: 'bg-[#4a1c40] hover:bg-[#381530]' },
                { label: 'Documento', icon: FileText, bg: 'bg-emerald-500 hover:bg-emerald-600' },
                { label: 'Exame', icon: FlaskConical, bg: 'bg-red-500 hover:bg-red-600' },
                { label: 'Fotos', icon: Camera, bg: 'bg-[#1e3a8a] hover:bg-[#172554]' },
                { label: 'Vacina', icon: Droplets, bg: 'bg-orange-500 hover:bg-orange-600' },
                { label: 'Receita', icon: FileEdit, bg: 'bg-purple-600 hover:bg-purple-700' },
                { label: 'Observações', icon: MessageSquare, bg: 'bg-slate-700 hover:bg-slate-800' },
                { label: 'Vídeo', icon: Video, bg: 'bg-green-700 hover:bg-green-800' },
                { label: 'Internação', icon: BedSingle, bg: 'bg-red-800 hover:bg-red-900' },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center justify-center p-2 rounded-[var(--radius-md)] ${action.bg} text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-sm aspect-square`}
                  onClick={() => handleActionClick(action.label)}
                >
                  <action.icon className="w-5 h-5 mb-1.5 opacity-90" strokeWidth={2} />
                  <span className="text-[9px] font-medium text-center leading-tight opacity-95">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    )}

    {/* Modais da Etapa 2 */}
    {showWeightModal && (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-6 w-full max-w-sm shadow-xl animate-scale-in">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#a19e34]" /> Atualizar Peso
          </h3>
          <FieldGroup label="Novo Peso (kg)">
            <input 
              type="number" 
              step="0.1" 
              value={newWeight} 
              onChange={e => setNewWeight(e.target.value)} 
              className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-surface-50 dark:bg-surface-900" 
              placeholder="Ex: 15.5" 
            />
          </FieldGroup>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowWeightModal(false)} className="px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-md">Cancelar</button>
            <button onClick={handleSaveWeight} className="px-4 py-2 text-sm font-medium bg-[#a19e34] hover:bg-[#8c892b] text-white rounded-md">Salvar Peso</button>
          </div>
        </div>
      </div>
    )}

    {showObsModal && (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-6 w-full max-w-lg shadow-xl animate-scale-in">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-700 dark:text-slate-400" /> Nova Observação
          </h3>
          <FieldGroup label="Observação">
            <TextArea 
              value={newObsText} 
              onChange={e => setNewObsText(e.target.value)} 
              placeholder="Digite a observação rápida..." 
              rows={4} 
            />
          </FieldGroup>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowObsModal(false)} className="px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-md">Cancelar</button>
            <button onClick={handleSaveObs} className="px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-800 text-white rounded-md">Salvar Observação</button>
          </div>
        </div>
      </div>
    )}

    {/* Modais da Etapa 3 */}
    {showPathologyModal && (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-xl animate-scale-in">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#4a1c40]" /> Registrar Patologia
          </h3>
          <FieldGroup label="Descrição da Patologia/Condição">
            <input 
              type="text" 
              value={newPathology} 
              onChange={e => setNewPathology(e.target.value)} 
              className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-surface-50 dark:bg-surface-900" 
              placeholder="Ex: Insuficiência Renal Crônica" 
            />
          </FieldGroup>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowPathologyModal(false)} className="px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-md">Cancelar</button>
            <button onClick={() => handleSaveGenericAction('Registro de Patologia', newPathology, () => setShowPathologyModal(false))} className="px-4 py-2 text-sm font-medium bg-[#4a1c40] hover:bg-[#381530] text-white rounded-md">Salvar</button>
          </div>
        </div>
      </div>
    )}

    {showDocModal && (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-xl animate-scale-in">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" /> Anexar Documento
          </h3>
          <FieldGroup label="Nome do Documento (Término, Autorização, etc)">
            <input 
              type="text" 
              value={newDocName} 
              onChange={e => setNewDocName(e.target.value)} 
              className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-surface-50 dark:bg-surface-900" 
              placeholder="Ex: Termo de Autorização de Cirurgia" 
            />
          </FieldGroup>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowDocModal(false)} className="px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-md">Cancelar</button>
            <button onClick={() => handleSaveGenericAction('Documento Anexado', newDocName, () => setShowDocModal(false))} className="px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-md">Salvar</button>
          </div>
        </div>
      </div>
    )}

    {showExamModal && (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-xl animate-scale-in">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-red-500" /> Registrar Exame
          </h3>
          <FieldGroup label="Descrição ou Nome do Exame">
            <input 
              type="text" 
              value={newExamName} 
              onChange={e => setNewExamName(e.target.value)} 
              className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-surface-50 dark:bg-surface-900" 
              placeholder="Ex: Hemograma Completo - Aguardando Resultado" 
            />
          </FieldGroup>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowExamModal(false)} className="px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-md">Cancelar</button>
            <button onClick={() => handleSaveGenericAction('Solicitação/Registro de Exame', newExamName, () => setShowExamModal(false))} className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-md">Salvar</button>
          </div>
        </div>
      </div>
    )}

    {showMediaModal && (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-xl animate-scale-in">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            {mediaType === 'Fotos' ? <Camera className="w-5 h-5 text-[#1e3a8a]" /> : <Video className="w-5 h-5 text-green-700" />} 
            Adicionar {mediaType}
          </h3>
          <FieldGroup label="URL / Descrição da Mídia">
            <input 
              type="text" 
              value={mediaUrl} 
              onChange={e => setMediaUrl(e.target.value)} 
              className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-surface-50 dark:bg-surface-900" 
              placeholder="Descreva a mídia adicionada..." 
            />
          </FieldGroup>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowMediaModal(false)} className="px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-md">Cancelar</button>
            <button onClick={() => handleSaveGenericAction(`Mídia Adicionada (${mediaType})`, mediaUrl, () => setShowMediaModal(false))} className={`px-4 py-2 text-sm font-medium text-white rounded-md ${mediaType === 'Fotos' ? 'bg-[#1e3a8a] hover:bg-[#172554]' : 'bg-green-700 hover:bg-green-800'}`}>Salvar</button>
          </div>
        </div>
      </div>
    )}

  </div>
</div>
</div>
  );
}
