import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { Search, FileText, Clock, Syringe, Stethoscope, Sparkles, ChevronDown, ChevronRight, AlertTriangle, Heart, Plus, Trash2, Pill } from 'lucide-react';
import type { Pet, SavedMedicalRecord, VaccinationRecord, VaccineType, Prescription } from '../types';

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
  const { pets, tutors, medicalRecords, vaccinations, addMedicalRecord, addVaccination } = useDataStore();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const [activeTab, setActiveTab] = useState<'nova' | 'historico' | 'prescricoes' | 'vacinas'>('nova');

  const location = useLocation();

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
        <div>
          {!selectedPet ? (
            <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-16 text-center">
              <FileText className="w-12 h-12 text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500 text-sm">Selecione um pet para visualizar o prontuário</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pet header */}
              <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-2xl">{selectedPet.species === 'dog' ? '🐕' : selectedPet.species === 'cat' ? '🐈' : '🐾'}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-surface-900 dark:text-white">{selectedPet.name}</h2>
                        {selectedPet.isAggressive && <span className="text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-2 py-0.5 rounded-full">⚠️ BRAVO</span>}
                        {selectedPet.allergies.length > 0 && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-0.5 rounded-full">ALERGIAS: {selectedPet.allergies.join(', ')}</span>}
                      </div>
                      <p className="text-sm text-surface-500">{selectedPet.breed} · {selectedPet.sex === 'male' ? '♂ Macho' : '♀ Fêmea'} · {selectedPet.weight}kg · {selectedPet.neutered ? 'Castrado' : 'Não castrado'}</p>
                      <p className="text-xs text-surface-400">Tutor: {selectedTutor?.name} · {selectedTutor?.phone}</p>
                    </div>
                  </div>
                  <button onClick={handleAiSummary} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 text-white text-sm font-medium rounded-[var(--radius-md)] transition-all shadow-sm">
                    <Sparkles className="w-4 h-4" /> Resumir com IA
                  </button>
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

              {/* Tabs */}
              <div className="flex items-center gap-4 border-b border-surface-200 dark:border-surface-700 px-2">
                {(['nova', 'historico', 'prescricoes', 'vacinas'] as const).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px] ${activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
                  >
                    {tab === 'nova' ? 'Nova Consulta' : tab === 'historico' ? 'Histórico' : tab === 'prescricoes' ? 'Prescrições' : 'Vacinas'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
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
                <div className="space-y-4 animate-fade-in">
                  {medicalRecords.filter(r => r.petId === selectedPet.id).length === 0 ? (
                    <div className="text-center py-12 text-surface-500 bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700">
                      Nenhum histórico encontrado para este paciente.
                    </div>
                  ) : (
                    medicalRecords.filter(r => r.petId === selectedPet.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                      <div key={record.id} className="p-5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-lg)]">
                        <div className="flex justify-between items-start mb-4 pb-3 border-b border-surface-100 dark:border-surface-700/50">
                          <div>
                            <p className="font-bold text-surface-900 dark:text-white flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary-500" /> Consulta em {new Date(record.date).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-sm text-surface-500 mt-0.5">Vet: {record.veterinarianName}</p>
                          </div>
                          {record.nextReturn && (
                            <span className="text-xs font-medium bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Retorno: {new Date(record.nextReturn).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                        <div className="space-y-3 text-sm text-surface-700 dark:text-surface-300">
                          <div><strong className="text-surface-900 dark:text-surface-100 block mb-0.5">Queixa Principal:</strong> {record.chiefComplaint || 'Não informada'}</div>
                          <div><strong className="text-surface-900 dark:text-surface-100 block mb-0.5">Conduta:</strong> {record.conduct || 'Não informada'}</div>
                          {record.observations && <div><strong className="text-surface-900 dark:text-surface-100 block mb-0.5">Observações:</strong> {record.observations}</div>}
                          {record.prescriptions && record.prescriptions.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-700/50">
                              <strong className="text-surface-900 dark:text-surface-100 block mb-2 flex items-center gap-1.5"><Pill className="w-4 h-4 text-primary-500" /> Medicamentos Prescritos ({record.prescriptions.length})</strong>
                              <ul className="list-disc pl-5 space-y-1 text-surface-600 dark:text-surface-400">
                                {record.prescriptions.map(p => (
                                  <li key={p.id}>{p.medication} - {p.dosage} ({p.frequency})</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
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
          )}
        </div>
      </div>
    </div>
  );
}
