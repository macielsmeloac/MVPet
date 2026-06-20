import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { 
  Bed, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  ShieldAlert, 
  ArrowRight, 
  UserCheck, 
  LogOut, 
  Activity, 
  FileText, 
  Calendar,
  Wallet,
  Play,
  Check
} from 'lucide-react';
import type { TriageLevel, Hospitalization } from '../types';

const triageLabel: Record<TriageLevel, string> = {
  emergency: '🔴 Emergência', 
  'very-urgent': '🟠 Muito Urgente', 
  urgent: '🟡 Urgente', 
  minor: '🟢 Pouco Urgente', 
  routine: '🔵 Rotina',
};

const triageColorClass: Record<TriageLevel, string> = {
  emergency: 'border-l-4 border-l-red-650 bg-red-500/5 dark:bg-red-950/15',
  'very-urgent': 'border-l-4 border-l-orange-500 bg-orange-500/5 dark:bg-orange-950/15',
  urgent: 'border-l-4 border-l-yellow-500 bg-yellow-500/5 dark:bg-yellow-950/15',
  minor: 'border-l-4 border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/15',
  routine: 'border-l-4 border-l-blue-500 bg-blue-500/5 dark:bg-blue-950/15',
};

const triageBadgeClass: Record<TriageLevel, string> = {
  emergency: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'very-urgent': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-yellow-100 text-yellow-750 dark:bg-yellow-900/30 dark:text-yellow-400',
  minor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  routine: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export function HospitalizationPage() {
  const { 
    hospitalizations, 
    pets, 
    tutors, 
    comandas, 
    appointments,
    vaccinations,
    medicalRecords,
    administerMedication, 
    dischargePatient, 
    processDailyBedRates 
  } = useDataStore();

  const navigate = useNavigate();

  const active = hospitalizations.filter((h) => h.status === 'active');
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [selectedSlot, setSelectedSlot] = useState<{ hospId: string; hour: string } | null>(null);
  
  // Estados locais para Alta Médica
  const [selectedHospForDischarge, setSelectedHospForDischarge] = useState<Hospitalization | null>(null);
  const [dischargeRecs, setDischargeRecs] = useState('');
  const [dischargeRep, setDischargeRep] = useState('');

  // Estado local para Ações e Nova Prescrição
  const [selectedHospIdForActions, setSelectedHospIdForActions] = useState<string | null>(null);
  const selectedHospForActions = hospitalizations.find(h => h.id === selectedHospIdForActions) || null;
  const [selectedHospForPrescription, setSelectedHospForPrescription] = useState<Hospitalization | null>(null);
  const [medicationToEdit, setMedicationToEdit] = useState<any | null>(null);
  const [activeFichaTab, setActiveFichaTab] = useState<'clinical' | 'timeline' | 'history'>('clinical');
  const [selectedPeriodHospId, setSelectedPeriodHospId] = useState<string>('');

  useEffect(() => {
    if (selectedHospIdForActions) {
      setActiveFichaTab('clinical');
      setSelectedPeriodHospId('');
    }
  }, [selectedHospIdForActions]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminister = (hospId: string, medId: string, hour: string, justification?: string, exactDateTime?: string) => {
    administerMedication(hospId, medId, hour, 'Dr. Plantonista', justification, exactDateTime);
  };

  // Simular Alta Médica (Congela conta)
  const handleConfirmDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospForDischarge || !dischargeRecs || !dischargeRep) return;

    dischargePatient(selectedHospForDischarge.id, dischargeRecs, dischargeRep);
    
    alert('🩺 ALTA MÉDICA CONFIRMADA!\nO prontuário foi atualizado, a comanda virtual de internação foi CONGELADA contra edições acidentais, e os dados financeiros foram enviados em lote para o PDV para cobrança e split de pagamento.');
    
    setSelectedHospForDischarge(null);
    setDischargeRecs('');
    setDischargeRep('');
  };

  // Executar simulação de cobrança diária às 12:00
  const handleTriggerDailyCharges = () => {
    processDailyBedRates();
    alert('⏳ SIMULAÇÃO DO RELÓGIO (12:00):\nA passagem do meio-dia foi simulada no sistema. Diárias de internação foram geradas e debitadas no saldo de calção dos tutores correspondentes com sucesso!');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-650/5 to-transparent p-6 rounded-[var(--radius-xl)] border border-emerald-500/20 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
              Módulo de Internação & Leitos
            </h1>
            <p className="text-sm text-surface-500 mt-0.5">
              Mapa de leitos coloridos, tripla ação de checagem clínica, gestão diária dura (12:00), e auditoria calção ativo.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTriggerDailyCharges}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-550 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-[var(--radius-md)] transition-all shadow-sm cursor-pointer hover:scale-102 transform active:scale-98"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Simular Diárias (12:00)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 1: MAPA DE LEITOS DINÂMICO E COLORIDO */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 flex items-center gap-1.5">
          <Bed className="w-4.5 h-4.5 text-indigo-500" /> Mapa de Leitos Clínicos (Tempo Real)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {active.map((hosp) => {
            const pet = pets.find((p) => p.id === hosp.petId);
            if (!pet) return null;
            const tutor = tutors.find((t) => t.id === pet.tutorId);

            // Cálculos da comanda acumulada vs calção
            const tutorComanda = comandas[tutor?.id || ''] || [];
            const grandComandaTotal = tutorComanda.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const activeCredits = tutor?.credits || 0;
            const isCalcaoExceeded = grandComandaTotal > activeCredits;

            return (
              <div 
                key={hosp.id} 
                className={`p-4 rounded-xl border border-surface-200 dark:border-surface-700/60 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-md ${triageColorClass[hosp.triageLevel]}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] bg-surface-150 dark:bg-surface-800 text-surface-650 dark:text-surface-300 font-bold px-2 py-0.5 rounded">
                      Leito {hosp.bedNumber}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${triageBadgeClass[hosp.triageLevel]}`}>
                      {triageLabel[hosp.triageLevel].split(' ')[1]}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-surface-900 dark:text-white truncate">
                    {pet.name}
                  </h4>
                  <p className="text-[11px] text-surface-500">{pet.breed} • {pet.weight}kg</p>
                  
                  {tutor && (
                    <p className="text-[10.5px] text-surface-450 mt-1 truncate">
                      Tutor: <strong className="text-surface-700 dark:text-surface-300">{tutor.name}</strong>
                    </p>
                  )}

                  {/* Informações e Warnings de Calção Antecipado */}
                  <div className="mt-3 pt-2.5 border-t border-dashed border-surface-200 dark:border-surface-700/60 space-y-1.5 text-[10.5px]">
                    <div className="flex justify-between text-surface-500">
                      <span>Débitos Acumulados</span>
                      <span className="font-bold text-surface-800 dark:text-white">R$ {grandComandaTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-surface-500">
                      <span>Crédito Calção Ativo</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">R$ {activeCredits.toFixed(2)}</span>
                    </div>

                    {isCalcaoExceeded ? (
                      <div className="p-2 bg-red-500/10 border border-red-500/35 rounded-lg flex items-start gap-1.5 text-red-700 dark:text-red-400 animate-pulse mt-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                        <div>
                          <strong className="block font-bold">⚠️ Calção Estourado!</strong>
                          <span>Débito excede depósito. Solicite complemento de calção.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full bg-surface-100 dark:bg-surface-850 h-1.5 rounded-full overflow-hidden mt-2">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (grandComandaTotal / (activeCredits || 1)) * 100)}%` }} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões removidos daqui para a grade de timeline */}
              </div>
            );
          })}

          {/* Vagas Livres Fictícias para Estética Premium */}
          {Array.from({ length: Math.max(1, 4 - active.length) }).map((_, idx) => (
            <div key={idx} className="border-2 border-dashed border-surface-200 dark:border-surface-700 p-4 rounded-xl flex flex-col items-center justify-center text-center bg-surface-50/50 dark:bg-surface-900/10 min-h-[170px]">
              <Bed className="w-8 h-8 text-surface-300 dark:text-surface-700 mb-2" />
              <span className="text-xs font-bold text-surface-450 uppercase">Leito Disponível</span>
              <span className="text-[10px] text-surface-400 mt-1">Pronto para novas hospitalizações</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 2: GRADE HORÁRIA DE ADMINISTRAÇÃO E CHECAGEM CLÍNICA */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">
          Grade Horária de Checagem Clínica & Prescrições (24h)
        </h3>
        
        <div className="bg-white/90 dark:bg-surface-800/80 backdrop-blur-md rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700/50 shadow-sm overflow-hidden flex flex-col relative">
          <div className="overflow-auto flex" ref={scrollContainerRef}>
            {/* Pacientes Column */}
            <div className="w-[280px] flex-shrink-0 border-r border-surface-200 dark:border-surface-700 bg-surface-50/95 dark:bg-surface-800/95 backdrop-blur-md z-10 sticky left-0 flex flex-col">
              <div className="h-12 border-b border-surface-200 dark:border-surface-700 flex items-center px-4 font-bold text-surface-650 dark:text-surface-300 text-xs uppercase bg-surface-100/50 dark:bg-surface-800/50">
                Pacientes Internados
              </div>
              {active.map(hosp => {
                const pet = pets.find(p => p.id === hosp.petId);
                if (!pet) return null;
                const regNumber = `#P${pet.id.replace(/\D/g, '').padStart(3, '0')}`;
                
                return (
                  <div key={hosp.id} className="h-24 border-b border-surface-200 dark:border-surface-700/50 flex flex-col justify-center px-4">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setSelectedHospIdForActions(hosp.id)}
                        className="font-bold text-surface-800 dark:text-white truncate pr-2 hover:text-primary-500 transition-colors text-left cursor-pointer underline decoration-dashed decoration-primary-500/30 underline-offset-4"
                      >
                        {pet.name}
                      </button>
                      <span className="text-[10px] font-mono text-surface-500 bg-surface-200 dark:bg-surface-700 px-1.5 py-0.5 rounded">{regNumber}</span>
                    </div>
                    <div className="text-xs text-surface-500 mt-1">
                      {pet.breed} · {pet.weight}kg
                    </div>
                    <div className="text-[10px] mt-1 font-semibold flex items-center gap-1">
                      <span className="bg-white dark:bg-surface-900 px-1.5 py-0.5 rounded text-surface-600 dark:text-surface-400">Leito {hosp.bedNumber}</span>
                      <span>{triageLabel[hosp.triageLevel]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Columns */}
            <div className="flex flex-col flex-1 min-w-max">
              <div className="flex border-b border-surface-200 dark:border-surface-700 h-12">
                {hours.map((hour, idx) => {
                  const isCurrentHour = idx === currentHour;
                  return (
                    <div key={hour} className={`w-[60px] flex-shrink-0 flex items-center justify-center text-xs font-semibold border-r border-surface-200 dark:border-surface-700/50 ${isCurrentHour ? 'bg-surface-800 text-white dark:bg-primary-500/20 dark:text-primary-400' : 'text-surface-500 bg-transparent'}`}>
                      {hour}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex flex-col relative">
                {active.map(hosp => (
                  <div key={hosp.id} 
                    onClick={() => setSelectedHospIdForActions(hosp.id)}
                    className="flex h-24 border-b border-surface-200 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/20 transition-colors cursor-pointer"
                  >
                    {hours.map((hour, idx) => {
                      const isCurrentHour = idx === currentHour;
                      
                      const medsThisHour = hosp.medications.filter(m => m.status !== 'suspended').map(m => {
                        const time = m.times.find(t => t.hour === hour);
                        return time ? { med: m, time } : null;
                      }).filter(Boolean);

                      let circleContent = null;
                      if (medsThisHour.length > 0) {
                        const total = medsThisHour.length;
                        const allAdministered = medsThisHour.every(m => m!.time.administered);
                        const isDelayed = !allAdministered && idx < currentHour;

                        let circleColor = 'bg-orange-500 text-white';
                        if (allAdministered) circleColor = 'bg-emerald-500 text-white';
                        else if (isDelayed) circleColor = 'bg-red-500 text-white animate-pulse';

                        circleContent = (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedSlot({ hospId: hosp.id, hour }); }}
                            className={`w-8 h-8 rounded-full ${circleColor} flex items-center justify-center text-xs font-bold shadow-sm hover:scale-110 transition-transform cursor-pointer`}
                          >
                            {total}
                          </button>
                        );
                      }

                      return (
                        <div key={hour} className={`w-[60px] flex-shrink-0 flex items-center justify-center border-r border-surface-200 dark:border-surface-700/50 ${isCurrentHour ? 'bg-surface-100/50 dark:bg-surface-700/30' : ''}`}>
                          {circleContent}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADMINISTRAÇÃO E TRI-AÇÃO CLINICA SIMULTÂNEA */}
      {/* ========================================================================= */}
      {selectedSlot && (
        <ExecutionModal 
          hospId={selectedSlot.hospId} 
          hour={selectedSlot.hour} 
          onClose={() => setSelectedSlot(null)} 
          onAdminister={handleAdminister}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: ALTA MÉDICA COM CONGELAMENTO DE COMANDA */}
      {/* ========================================================================= */}
      {selectedHospForDischarge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-850 w-full max-w-lg rounded-[var(--radius-xl)] border border-surface-200 dark:border-surface-700 shadow-modal animate-scale-in overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/20">
              <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <LogOut className="w-5 h-5 text-indigo-500" /> Executar Alta Médica
              </h3>
              <button 
                onClick={() => setSelectedHospForDischarge(null)} 
                className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDischarge} className="p-5 space-y-4">
              <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/20 rounded-lg text-xs space-y-1">
                <p className="font-extrabold text-indigo-850 dark:text-indigo-455">⚡ Como funciona o fechamento?</p>
                <p className="text-surface-550 leading-tight">
                  Ao confirmar a alta, o prontuário deste pet será finalizado e o faturamento acumulado será <strong>congelado</strong> para liquidação final na recepção via PDV.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-650 dark:text-surface-400 mb-1.5">
                  Termo de Recomendações Clínicas Domiciliares *
                </label>
                <textarea
                  required
                  rows={3}
                  value={dischargeRecs}
                  onChange={(e) => setDischargeRecs(e.target.value)}
                  placeholder="Ex: Medicamento X a cada 12h por 5 dias, repouso e retorno em 7 dias."
                  className="w-full p-2.5 text-xs bg-surface-50 dark:bg-surface-900 border border-surface-250 dark:border-surface-700 rounded focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-650 dark:text-surface-400 mb-1.5">
                  Relatório Clínico de Alta *
                </label>
                <textarea
                  required
                  rows={3}
                  value={dischargeRep}
                  onChange={(e) => setDischargeRep(e.target.value)}
                  placeholder="Ex: Paciente apresentou remissão completa dos sintomas, estável para alta."
                  className="w-full p-2.5 text-xs bg-surface-50 dark:bg-surface-900 border border-surface-250 dark:border-surface-700 rounded focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-200 dark:border-surface-700">
                <button
                  type="button"
                  onClick={() => setSelectedHospForDischarge(null)}
                  className="px-4 py-2 border border-surface-200 dark:border-surface-700 hover:bg-surface-100 rounded text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs font-bold shadow"
                >
                  Confirmar Alta & Congelar Faturamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FICHA DE INTERNAÇÃO DO PACIENTE */}
      {/* ========================================================================= */}
      {selectedHospForActions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-[var(--radius-xl)] shadow-2xl w-full max-w-2xl overflow-hidden border border-surface-200 dark:border-surface-700">
            {/* Header com a cor de Triagem */}
            <div className={`p-4 border-b flex justify-between items-center ${
              selectedHospForActions.triageLevel === 'very-urgent' ? 'bg-red-500/10 border-red-200 dark:border-red-800' :
              selectedHospForActions.triageLevel === 'urgent' ? 'bg-orange-500/10 border-orange-200 dark:border-orange-800' :
              selectedHospForActions.triageLevel === 'minor' ? 'bg-yellow-500/10 border-yellow-200 dark:border-yellow-800' :
              'bg-blue-500/10 border-blue-200 dark:border-blue-800'
            }`}>
              <div>
                <h3 className="text-lg font-bold text-surface-800 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Ficha de Internação
                </h3>
                <span className="text-xs font-semibold opacity-80 uppercase tracking-wider mt-1 block">
                  Leito {selectedHospForActions.bedNumber} — {triageLabel[selectedHospForActions.triageLevel]}
                </span>
              </div>
              <button 
                onClick={() => setSelectedHospIdForActions(null)}
                className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-full text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
              >
                <X className="w-5 h-5 text-surface-600 dark:text-surface-300" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-surface-200 dark:border-surface-700/50 bg-surface-50/50 dark:bg-surface-800/30 px-6">
              <button 
                onClick={() => setActiveFichaTab('clinical')}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                  activeFichaTab === 'clinical' 
                    ? 'border-primary-500 text-primary-500' 
                    : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                <Activity className="w-4 h-4" /> Internação Atual
              </button>
              <button 
                onClick={() => setActiveFichaTab('timeline')}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                  activeFichaTab === 'timeline' 
                    ? 'border-primary-500 text-primary-500' 
                    : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                <Clock className="w-4 h-4" /> Linha do Tempo Geral
              </button>
              <button 
                onClick={() => setActiveFichaTab('history')}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                  activeFichaTab === 'history' 
                    ? 'border-primary-500 text-primary-500' 
                    : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                <FileText className="w-4 h-4" /> Histórico de Internações
              </button>
            </div>

            {/* Conteúdo da Ficha */}
            <div className="p-6">
              {(() => {
                const pet = pets.find(p => p.id === selectedHospForActions.petId);
                if (!pet) return null;
                const regNumber = `#P${pet.id.replace(/\D/g, '').padStart(3, '0')}`;

                if (activeFichaTab === 'clinical') {
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-6">
                        {/* Coluna 1: Dados do Pet */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-3 border-b border-surface-200 dark:border-surface-700 pb-1">
                            Informações do Paciente
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {/* Ao clicar no nome, redireciona para a página do prontuário do cliente/paciente */}
                              <button 
                                onClick={() => navigate('/prontuarios', { state: { selectedPetId: pet.id } })}
                                className="text-2xl font-bold text-surface-800 dark:text-white hover:text-primary-500 transition-colors text-left cursor-pointer underline decoration-dashed decoration-primary-500/30 underline-offset-4"
                                title="Abrir Histórico Completo no Prontuário"
                              >
                                {pet.name}
                              </button>
                              <span className="text-xs bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded font-mono text-surface-500">{regNumber}</span>
                            </div>
                            <p className="text-sm text-surface-600 dark:text-surface-300">
                              {pet.species === 'dog' ? 'Cão' : pet.species === 'cat' ? 'Gato' : 'Outro'} • {pet.breed}
                            </p>
                            <div className="flex gap-4 text-xs text-surface-500">
                              <span><strong>Sexo:</strong> {pet.sex === 'male' ? 'Macho' : 'Fêmea'}</span>
                              <span><strong>Peso:</strong> {pet.weight}kg</span>
                            </div>

                            {/* Caixa / Financeiro do Tutor */}
                            {(() => {
                              const tutor = tutors.find(t => t.id === pet.tutorId);
                              const tutorName = tutor ? tutor.name : 'Não informado';
                              const tutorComanda = comandas[pet.tutorId] || [];
                              const outstandingAmount = tutorComanda.reduce((total, item) => total + (item.price * item.quantity), 0);

                              return (
                                <div className="mt-4 p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-[var(--radius-lg)]">
                                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                                    <Wallet className="w-3.5 h-3.5" /> Controle de Caixa (Tutor)
                                  </h5>
                                  <div className="space-y-1">
                                    <div className="text-xs text-surface-600 dark:text-surface-300">
                                      <strong>Tutor:</strong> <span className="font-semibold text-surface-800 dark:text-white">{tutorName}</span>
                                    </div>
                                    <div className="text-xs text-surface-600 dark:text-surface-300 flex items-center justify-between mt-1.5">
                                      <span><strong>Valor em Aberto:</strong></span>
                                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                                        outstandingAmount > 0 
                                          ? 'text-amber-600 bg-amber-500/10 dark:text-amber-400' 
                                          : outstandingAmount < 0
                                            ? 'text-green-600 bg-green-500/10 dark:text-green-400'
                                            : 'text-surface-500 bg-surface-500/10'
                                      }`}>
                                        {outstandingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {pet.allergies && pet.allergies.length > 0 && (
                              <div className="mt-3 p-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800/50 rounded flex gap-2 items-start">
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-xs text-red-700 dark:text-red-400 block">Alergias Registradas:</strong>
                                  <span className="text-xs text-red-600 dark:text-red-300">{pet.allergies.join(', ')}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Coluna 2: Dados Clínicos */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-3 border-b border-surface-200 dark:border-surface-700 pb-1">
                            Quadro Clínico
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <strong className="block text-xs text-surface-500">Motivo da Internação:</strong>
                              <p className="text-sm font-semibold text-surface-800 dark:text-white mt-0.5">
                                {selectedHospForActions.reason}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <strong className="block text-xs text-surface-500">Data de Admissão:</strong>
                                <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 mt-0.5 block">
                                  {new Date(selectedHospForActions.admissionDate).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <div>
                                <strong className="block text-xs text-surface-500">Veterinário(a) Responsável:</strong>
                                <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 mt-0.5 block">
                                  {selectedHospForActions.veterinarianName}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lista de Prescrições Ativas */}
                      <div className="mt-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-3 border-b border-surface-200 dark:border-surface-700 pb-1">
                          Prescrições Ativas
                        </h4>
                        {selectedHospForActions.medications.length > 0 ? (
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                            {selectedHospForActions.medications.map(med => {
                              const unadministeredCount = med.times.filter(t => !t.administered).length;
                              const hasPending = unadministeredCount > 0;
                              const isSuspended = med.status === 'suspended';
                              
                              return (
                                <div key={med.id} className={`flex items-center justify-between p-3 border rounded-lg ${isSuspended ? 'bg-surface-100 dark:bg-surface-800 border-surface-300 dark:border-surface-600 opacity-60' : 'bg-surface-50 dark:bg-surface-800/50 border-surface-200 dark:border-surface-700'}`}>
                                  <div>
                                    <strong className="block text-sm text-surface-800 dark:text-white line-clamp-1">{med.medication} {isSuspended && '(Suspenso)'}</strong>
                                    <span className="text-xs text-surface-500">
                                      Via {med.route} — {isSuspended ? `Pausado com ${med.pendingDoses || 0} pendentes` : `Restam ${unadministeredCount} pendentes`}
                                    </span>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    {isSuspended ? (
                                      <button
                                        onClick={() => {
                                          if (window.confirm(`Deseja RETOMAR esta prescrição?\nNovos horários serão gerados e faturados.`)) {
                                            useDataStore.getState().resumeHospitalizationPrescription(selectedHospForActions.id, med.id);
                                          }
                                        }}
                                        className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-bold rounded hover:bg-blue-200 dark:hover:bg-blue-500/20 transition-colors cursor-pointer"
                                      >
                                        Retomar
                                      </button>
                                    ) : hasPending ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            setMedicationToEdit(med);
                                            setSelectedHospForPrescription(selectedHospForActions);
                                          }}
                                          className="px-3 py-1.5 bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300 text-xs font-bold rounded hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors cursor-pointer"
                                        >
                                          Editar
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (window.confirm(`Tem certeza que deseja SUSPENDER esta prescrição?\nAs ${unadministeredCount} aplicações restantes serão congeladas e o valor estornado.`)) {
                                              useDataStore.getState().suspendHospitalizationPrescription(selectedHospForActions.id, med.id);
                                            }
                                          }}
                                          className="px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 text-xs font-bold rounded hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors cursor-pointer"
                                        >
                                          Suspender
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded">
                                        Concluído
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-surface-500 italic">Nenhuma prescrição ativa.</p>
                        )}
                      </div>

                      {/* Botões de Ação na Ficha */}
                      <div className="mt-6 pt-4 border-t border-surface-200 dark:border-surface-700 flex gap-3">
                        <button 
                          onClick={() => {
                            setMedicationToEdit(null);
                            setSelectedHospForPrescription(selectedHospForActions);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer font-bold shadow-sm shadow-emerald-500/20 text-sm"
                        >
                          <FileText className="w-4 h-4" /> Nova Prescrição
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedHospForDischarge(selectedHospForActions);
                            setSelectedHospIdForActions(null); // Fecha a ficha ao dar alta
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors cursor-pointer font-bold shadow-sm shadow-indigo-500/20 text-sm"
                        >
                          <LogOut className="w-4 h-4" /> Dar Alta Médica
                        </button>
                      </div>
                    </>
                  );
                }

                if (activeFichaTab === 'timeline') {
                  const events: Array<{
                    date: Date;
                    type: 'registration' | 'consultation' | 'exam' | 'vaccine' | 'hospitalization';
                    title: string;
                    description: string;
                    details?: React.ReactNode;
                  }> = [];

                  // 1. Cadastro
                  events.push({
                    date: new Date(pet.createdAt || '2026-01-01'),
                    type: 'registration',
                    title: 'Paciente Cadastrado',
                    description: `Entrada oficial de ${pet.name} no MVPet. Espécie: ${pet.species === 'dog' ? 'Cão' : 'Gato'} • Raça: ${pet.breed} • Peso Inicial: ${pet.weight}kg.`
                  });

                  // 2. Prontuários
                  medicalRecords.filter(r => r.petId === pet.id).forEach(r => {
                    events.push({
                      date: new Date(r.date || r.createdAt),
                      type: 'consultation',
                      title: 'Prontuário Médico & Consulta',
                      description: `Consulta clínica realizada pelo Dr(a). ${r.veterinarianName}.`,
                      details: (
                        <div className="mt-2 text-xs space-y-1 bg-surface-50 dark:bg-surface-850 p-2.5 rounded border border-surface-200 dark:border-surface-700/50">
                          <div><strong>Queixa Principal:</strong> {r.chiefComplaint}</div>
                          {r.observations && <div><strong>Laudo / Clínico:</strong> {r.observations}</div>}
                          {r.conduct && <div><strong>Conduta Recomendada:</strong> {r.conduct}</div>}
                          {r.prescriptions && r.prescriptions.length > 0 && (
                            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Prescrição: {r.prescriptions.join(', ')}
                            </div>
                          )}
                        </div>
                      )
                    });
                  });

                  // 3. Agendamentos
                  appointments.filter(a => a.petId === pet.id).forEach(a => {
                    const typeLabels: Record<string, string> = { 
                      consultation: 'Consulta', 
                      surgery: 'Cirurgia', 
                      grooming: 'Banho e Tosa', 
                      vaccine: 'Vacina', 
                      exam: 'Exame', 
                      return: 'Retorno' 
                    };
                    const apptTitle = a.services.map(s => s.name).join(', ') || typeLabels[a.type] || a.type;
                    const statusLabels: Record<string, string> = {
                      scheduled: 'Agendado',
                      waiting: 'Em Espera',
                      'in-progress': 'Em Atendimento',
                      completed: 'Concluído',
                      cancelled: 'Cancelado'
                    };
                    events.push({
                      date: new Date(a.date),
                      type: 'exam',
                      title: `Agendamento: ${apptTitle}`,
                      description: `Status: ${statusLabels[a.status] || a.status}.`,
                      details: a.notes ? <div className="mt-1 text-xs text-surface-500 italic">"Obs: {a.notes}"</div> : undefined
                    });
                  });

                  // 4. Vacinas
                  vaccinations.filter(v => v.petId === pet.id).forEach(v => {
                    events.push({
                      date: new Date(v.applicationDate),
                      type: 'vaccine',
                      title: `Vacinação: ${v.vaccineName}`,
                      description: `Lote: ${v.lot || 'Não informado'} · Aplicador: Dr(a). ${v.veterinarianName}.`,
                      details: v.nextDoseDate ? (
                        <div className="mt-1 text-[11px] text-indigo-500 font-semibold">
                          Reforço programado: {new Date(v.nextDoseDate).toLocaleDateString('pt-BR')}
                        </div>
                      ) : undefined
                    });
                  });

                  // 5. Internações
                  hospitalizations.filter(h => h.petId === pet.id).forEach(h => {
                    events.push({
                      date: new Date(h.admissionDate),
                      type: 'hospitalization',
                      title: `Internação Clínico-Hospitalar ${h.status === 'active' ? '(Atual)' : '(Alta)'}`,
                      description: `Admitido no Leito ${h.bedNumber} sob responsabilidade de Dr(a). ${h.veterinarianName}.`,
                      details: (
                        <div className="mt-2 text-xs space-y-1 bg-primary-500/5 p-2.5 rounded border border-primary-500/10">
                          <div><strong>Motivo:</strong> {h.reason}</div>
                          {h.dischargeDate && (
                            <div className="text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                              Alta em: {new Date(h.dischargeDate).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      )
                    });
                  });

                  events.sort((a, b) => b.date.getTime() - a.date.getTime());

                  return (
                    <div className="max-h-[48vh] overflow-y-auto pr-2 py-2">
                      <div className="relative border-l-2 border-surface-200 dark:border-surface-700/60 ml-4 pl-6 space-y-5">
                        {events.map((ev, idx) => {
                          const badgeColors = {
                            registration: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
                            consultation: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
                            exam: 'bg-yellow-100 text-yellow-750 border-yellow-250 dark:bg-yellow-900/30 dark:text-yellow-400',
                            vaccine: 'bg-purple-100 text-purple-700 border-purple-250 dark:bg-purple-900/30 dark:text-purple-400',
                            hospitalization: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
                          }[ev.type];

                          const iconMap = {
                            registration: <UserCheck className="w-3.5 h-3.5" />,
                            consultation: <Activity className="w-3.5 h-3.5" />,
                            exam: <FileText className="w-3.5 h-3.5" />,
                            vaccine: <CheckCircle className="w-3.5 h-3.5" />,
                            hospitalization: <Bed className="w-3.5 h-3.5" />,
                          }[ev.type];

                          return (
                            <div key={idx} className="relative">
                              <span className={`absolute -left-[35px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full border shadow-sm ${badgeColors}`}>
                                {iconMap}
                              </span>
                              <div className="bg-surface-50 dark:bg-surface-800/40 p-3 rounded-xl border border-surface-200 dark:border-surface-700/50 hover:shadow-sm transition-shadow">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                  <h5 className="font-bold text-surface-800 dark:text-white text-xs">{ev.title}</h5>
                                  <span className="text-[9px] font-mono bg-surface-150 dark:bg-surface-750 px-1.5 py-0.5 rounded text-surface-500 dark:text-surface-400">
                                    {ev.date.toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                <p className="text-[11px] text-surface-600 dark:text-surface-300">{ev.description}</p>
                                {ev.details}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (activeFichaTab === 'history') {
                  const petHospList = hospitalizations.filter(h => h.petId === pet.id);
                  const selectedHosp = hospitalizations.find(h => h.id === selectedPeriodHospId);

                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">
                          Selecione o Período de Internação:
                        </label>
                        <select
                          value={selectedPeriodHospId}
                          onChange={(e) => setSelectedPeriodHospId(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-600 rounded-[var(--radius-md)] outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                        >
                          <option value="">Selecione um período...</option>
                          {petHospList.map(h => {
                            const startStr = new Date(h.admissionDate).toLocaleDateString('pt-BR');
                            const endStr = h.dischargeDate ? new Date(h.dischargeDate).toLocaleDateString('pt-BR') : 'Atual / Ativa';
                            return (
                              <option key={h.id} value={h.id}>
                                Internação: {startStr} até {endStr} (Leito {h.bedNumber})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {selectedHosp ? (
                        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                          {/* Resumo da internação selecionada */}
                          <div className="bg-surface-50 dark:bg-surface-800/40 p-4 rounded-xl border border-surface-200 dark:border-surface-700/50 grid grid-cols-2 gap-4">
                            <div>
                              <strong className="block text-xs text-surface-500">Período:</strong>
                              <span className="text-xs font-semibold text-surface-800 dark:text-white">
                                {new Date(selectedHosp.admissionDate).toLocaleDateString('pt-BR')} até {selectedHosp.dischargeDate ? new Date(selectedHosp.dischargeDate).toLocaleDateString('pt-BR') : '(Ativa atualmente)'}
                              </span>
                            </div>
                            <div>
                              <strong className="block text-xs text-surface-500">Leito Clínico:</strong>
                              <span className="text-xs font-semibold text-surface-800 dark:text-white">
                                Leito {selectedHosp.bedNumber}
                              </span>
                            </div>
                            <div>
                              <strong className="block text-xs text-surface-500">Veterinário Admissor:</strong>
                              <span className="text-xs font-semibold text-surface-800 dark:text-white">
                                {selectedHosp.veterinarianName}
                              </span>
                            </div>
                            <div>
                              <strong className="block text-xs text-surface-500">Status Internação:</strong>
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                selectedHosp.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface-500/10 text-surface-500'
                              }`}>
                                {selectedHosp.status === 'active' ? 'Ativa atualmente' : 'Alta Médica Concluída'}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <strong className="block text-xs text-surface-500">Motivo Inicial:</strong>
                              <p className="text-xs font-semibold text-surface-800 dark:text-white mt-0.5">{selectedHosp.reason}</p>
                            </div>
                          </div>

                          {/* Relatório de Alta (se houver) */}
                          {selectedHosp.dischargeDate && (
                            <div className="bg-indigo-500/5 border border-indigo-500/15 p-4 rounded-xl space-y-2">
                              <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                                <FileText className="w-4 h-4" /> Relatório Clínico de Alta Médica
                              </h5>
                              <div className="space-y-1 text-xs">
                                <div>
                                  <strong>Laudo / Relatório Clínico:</strong>
                                  <p className="text-surface-600 dark:text-surface-300 mt-0.5 italic">
                                    "{selectedHosp.dischargeReport || 'Paciente respondeu favoravelmente ao tratamento clínico estipulado, recebendo alta para prosseguir recuperação ambulatorialmente.'}"
                                  </p>
                                </div>
                                <div className="pt-1">
                                  <strong>Recomendações pós-alta:</strong>
                                  <p className="text-surface-600 dark:text-surface-300 mt-0.5 italic">
                                    "{selectedHosp.dischargeRecommendations || 'Repouso absoluto por 48 horas, medicação de suporte prescrita em prontuário de alta médica.'}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Medicações aplicadas neste período */}
                          <div>
                            <h5 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-2 border-b border-surface-200 dark:border-surface-700 pb-1">
                              Medicações e Aplicações do Período
                            </h5>
                            <div className="space-y-3">
                              {selectedHosp.medications.map(med => {
                                const administeredTimes = med.times.filter(t => t.administered);
                                return (
                                  <div key={med.id} className="p-3 bg-surface-50 dark:bg-surface-800/30 border border-surface-200 dark:border-surface-700/50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <strong className="text-sm text-surface-800 dark:text-white block">{med.medication}</strong>
                                        <span className="text-xs text-surface-500">Via {med.route} · Dose: {med.dosage}</span>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        med.status === 'suspended' ? 'bg-red-500/10 text-red-600' : med.status === 'completed' ? 'bg-surface-500/10 text-surface-500' : 'bg-green-500/10 text-green-600'
                                      }`}>
                                        {med.status === 'suspended' ? 'Suspenso' : med.status === 'completed' ? 'Concluído' : 'Ativo'}
                                      </span>
                                    </div>

                                    {/* Histórico das doses */}
                                    <div className="space-y-1.5 pl-2 border-l border-surface-250 dark:border-surface-750">
                                      <span className="text-[10px] font-bold text-surface-400 block uppercase tracking-wide">Doses Administradas ({administeredTimes.length}):</span>
                                      {administeredTimes.length > 0 ? (
                                        administeredTimes.map((time, idx) => (
                                          <div key={idx} className="text-xs flex items-center justify-between text-surface-600 dark:text-surface-300">
                                            <span>
                                              • Dose das <strong>{time.hour}</strong> aplicada em: {time.administeredAt}
                                            </span>
                                            <span className="text-[10px] font-semibold text-surface-450">
                                              por {time.administeredBy}
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-xs text-surface-500 italic block">Nenhuma aplicação registrada.</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-surface-50 dark:bg-surface-800/20 border border-dashed border-surface-200 dark:border-surface-700/60 rounded-xl">
                          <Activity className="w-8 h-8 text-surface-300 mx-auto mb-2" />
                          <p className="text-xs text-surface-500">Selecione um período acima para consultar as informações completas da internação correspondente.</p>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVA PRESCRIÇÃO FRACIONADA E LANÇAMENTO FINANCEIRO */}
      {/* ========================================================================= */}
      {selectedHospForPrescription && (
        <PrescriptionModal
          hosp={selectedHospForPrescription}
          medicationToEdit={medicationToEdit}
          onClose={() => { setSelectedHospForPrescription(null); setMedicationToEdit(null); }}
        />
      )}

    </div>
  );
}

function ExecutionModal({ hospId, hour, onClose, onAdminister }: { hospId: string, hour: string, onClose: () => void, onAdminister: (hospId: string, medId: string, hour: string, justification?: string, exactDateTime?: string) => void }) {
  const { hospitalizations, pets } = useDataStore();
  const hosp = hospitalizations.find(h => h.id === hospId);
  const pet = hosp ? pets.find(p => p.id === hosp.petId) : undefined;
  const currentHour = new Date().getHours();
  const slotHourNum = parseInt(hour.split(':')[0] || '0', 10);
  const isDelayed = slotHourNum < currentHour;

  const [selectedMedDetailId, setSelectedMedDetailId] = useState<string | null>(null);
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [adminDate, setAdminDate] = useState<string>('');
  const [adminTime, setAdminTime] = useState<string>('');

  if (!hosp || !pet) return null;

  const medsThisHour = hosp.medications.map(m => {
    const time = m.times.find(t => t.hour === hour);
    return time ? { med: m, time } : null;
  }).filter(Boolean);

  const detailItem = medsThisHour.find(i => i?.med.id === selectedMedDetailId);

  if (detailItem) {
    const { med, time } = detailItem;
    const delayedNotAdministered = isDelayed && !time.administered;
    const regNumber = `#P${pet.id.replace(/\D/g, '').padStart(3, '0')}`;
    
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white dark:bg-surface-900 rounded-[var(--radius-xl)] shadow-2xl w-full max-w-sm overflow-hidden border border-surface-200 dark:border-surface-700 p-6">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
            {time.administered ? 'Detalhes da Administração' : 'Confirmar Execução'}
          </h3>
          
          <div className="mb-4 bg-surface-50 dark:bg-surface-800 p-4 rounded-lg border border-surface-200 dark:border-surface-700">
            <h4 className="font-bold text-surface-900 dark:text-white text-base">{pet.name} ({regNumber})</h4>
            <p className="text-xs text-surface-500 mb-3">{pet.sex === 'male' ? 'Macho' : 'Fêmea'} · {pet.weight}kg</p>
            
            <div className="space-y-2 text-sm text-surface-700 dark:text-surface-300">
              <div><strong>Medicamento:</strong> {med.medication} ({med.dosage} via {med.route})</div>
              <div><strong>Programado para:</strong> {new Date().toLocaleDateString('pt-BR')} às {hour}</div>
              
              <div className="flex items-center gap-2">
                <strong>Status:</strong> 
                {time.administered ? (
                  <span className="text-green-600 dark:text-green-400 font-bold">Concluído</span>
                ) : delayedNotAdministered ? (
                  <span className="text-red-600 dark:text-red-400 font-bold">Em Atraso</span>
                ) : (
                  <span className="text-orange-600 dark:text-orange-400 font-bold">Pendente</span>
                )}
              </div>

              {time.administered && (
                <div><strong>Administrado em:</strong> {time.administeredAt}</div>
              )}
            </div>
          </div>
          
          {!time.administered && (
            <div className="mb-4 space-y-3 border-t border-surface-200 dark:border-surface-700 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Realizado em
                  </label>
                  <input
                    type="date"
                    value={adminDate}
                    onChange={e => setAdminDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-600 rounded-[var(--radius-md)] focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={adminTime}
                    onChange={e => setAdminTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-600 rounded-[var(--radius-md)] focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  const now = new Date();
                  setAdminDate(now.toISOString().split('T')[0] || '');
                  setAdminTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                }}
                className="w-full py-1.5 text-xs font-semibold bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded border border-surface-300 dark:border-surface-600 transition-colors shadow-sm cursor-pointer"
              >
                Agora
              </button>

              {delayedNotAdministered && (
                <div>
                  <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1 mt-2">
                    Observações / Justificativa do Atraso *
                  </label>
                  <input 
                    type="text" 
                    value={justifications[med.id] || ''}
                    onChange={(e) => setJustifications(prev => ({ ...prev, [med.id]: e.target.value }))}
                    placeholder="Motivo do atraso..."
                    className="w-full px-3 py-2 text-sm bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-600 rounded-[var(--radius-md)] focus:ring-2 focus:ring-primary-550 outline-none"
                  />
                </div>
              )}
              {!delayedNotAdministered && (
                <div>
                  <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1 mt-2">
                    Observações (Opcional)
                  </label>
                  <input 
                    type="text" 
                    value={justifications[med.id] || ''}
                    onChange={(e) => setJustifications(prev => ({ ...prev, [med.id]: e.target.value }))}
                    placeholder="Observações adicionais..."
                    className="w-full px-3 py-2 text-sm bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-600 rounded-[var(--radius-md)] focus:ring-2 focus:ring-primary-550 outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {time.administered && time.delayJustification && (
            <div className="mb-4 p-3 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded text-sm text-surface-600 dark:text-surface-400">
              <strong>Observações:</strong> {time.delayJustification}
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            {time.administered ? (
              <button onClick={() => setSelectedMedDetailId(null)} className="w-full py-2 bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-800 dark:text-white rounded-[var(--radius-md)] text-sm font-semibold transition-colors cursor-pointer">
                Fechar
              </button>
            ) : (
              <>
                <button onClick={() => setSelectedMedDetailId(null)} className="flex-1 py-2 bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-800 dark:text-white rounded-[var(--radius-md)] text-sm font-semibold transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (delayedNotAdministered && (!justifications[med.id] || (justifications[med.id] || '').trim() === '')) {
                      alert('Por favor, preencha a justificativa do atraso.');
                      return;
                    }
                    if (!adminDate || !adminTime) {
                      alert('Por favor, informe a data e hora da administração (ou clique em "Agora").');
                      return;
                    }
                    
                    const [year, month, day] = adminDate.split('-');
                    const exactDateTimeStr = `${day}/${month} às ${adminTime}`;

                    onAdminister(hosp.id, med.id, hour, justifications[med.id], exactDateTimeStr);
                    setSelectedMedDetailId(null);
                    setAdminDate('');
                    setAdminTime('');
                  }}
                  className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-[var(--radius-md)] text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Registrar Execução
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-surface-900 rounded-[var(--radius-xl)] shadow-2xl w-full max-w-2xl overflow-hidden border border-surface-200 dark:border-surface-700">
        <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between bg-surface-50 dark:bg-surface-800">
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" /> Prescrições das {hour}
            </h2>
            <p className="text-sm text-surface-500">{pet.name} · Leito {hosp.bedNumber}</p>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {medsThisHour.map(item => {
            if (!item) return null;
            const { med, time } = item;
            const delayedNotAdministered = isDelayed && !time.administered;

            return (
              <div 
                key={med.id} 
                onClick={() => setSelectedMedDetailId(med.id)}
                className={`p-3 rounded-[var(--radius-lg)] border transition-all flex items-center justify-between cursor-pointer ${
                  time.administered 
                    ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/10 hover:bg-green-100/50 dark:hover:bg-green-900/20' 
                    : delayedNotAdministered 
                      ? 'border-red-500/50 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100/80 dark:hover:bg-red-900/30 hover:scale-[1.01]' 
                      : 'border-orange-200 dark:border-orange-700/50 hover:bg-orange-50 dark:hover:bg-orange-800/20 hover:border-orange-300 dark:hover:border-orange-700 hover:scale-[1.01]'
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-surface-800 dark:text-white text-sm">
                    {med.medication} — {med.dosage} — Via {med.route}
                  </h3>
                  
                  {time.administered && time.delayJustification && (
                    <div className="mt-1 text-xs text-surface-500">
                      <strong>Justificativa:</strong> {time.delayJustification}
                    </div>
                  )}
                  {time.administered && time.administeredBy && (
                    <div className="text-[10px] text-surface-400 mt-1">Por {time.administeredBy}</div>
                  )}
                </div>
                
                <div className="ml-3 flex-shrink-0">
                  {time.administered ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                      <CheckCircle className="w-3 h-3" /> {time.administeredAt}
                    </span>
                  ) : delayedNotAdministered ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                      <AlertTriangle className="w-3 h-3" /> Atrasado
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
                      Pendente
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PrescriptionModal({ hosp, medicationToEdit, onClose }: { hosp: Hospitalization, medicationToEdit?: any, onClose: () => void }) {
  const { pets, products, addHospitalizationPrescription, editHospitalizationPrescription } = useDataStore();
  const pet = pets.find(p => p.id === hosp.petId);

  // Filtra apenas produtos que podem ser medicamentos ou vacinas
  const availableMeds = products.filter(p => p.category === 'medication' || p.category === 'vaccine');

  // Helpers de parsing inteligente para preenchimento no modo Edição
  const getInitialProduct = () => {
    if (medicationToEdit?.productId) return medicationToEdit.productId;
    if (!medicationToEdit) return '';
    const firstWord = medicationToEdit.medication.split(' ')[0]?.toLowerCase() || '';
    const matched = availableMeds.find(p => p.name.toLowerCase().includes(firstWord));
    return matched ? matched.id : '';
  };

  const getInitialDose = () => {
    if (medicationToEdit?.doseValue !== undefined) return medicationToEdit.doseValue.toString();
    if (!medicationToEdit) return '';
    const num = parseFloat(medicationToEdit.dosage);
    return isNaN(num) ? '' : num.toString();
  };

  const getInitialFrequency = () => {
    if (medicationToEdit?.frequencyHours !== undefined) return medicationToEdit.frequencyHours.toString();
    if (!medicationToEdit) return '8';
    const timesCount = medicationToEdit.times?.length || 3;
    return Math.round(24 / timesCount).toString();
  };

  const getInitialDuration = () => {
    if (medicationToEdit?.durationDays !== undefined) return medicationToEdit.durationDays.toString();
    return '1';
  };

  const [selectedProductId, setSelectedProductId] = useState(getInitialProduct());
  const [dose, setDose] = useState(getInitialDose());
  const [frequencyHours, setFrequencyHours] = useState(getInitialFrequency());
  const [durationDays, setDurationDays] = useState(getInitialDuration());
  const [route, setRoute] = useState(medicationToEdit?.route || 'IV');

  const selectedProduct = availableMeds.find(p => p.id === selectedProductId);

  // Cálculos matemáticos em tempo real
  const doseValue = parseFloat(dose) || 0;
  const freqValue = parseInt(frequencyHours, 10) || 24;
  const durValue = parseInt(durationDays, 10) || 1;
  const applicationsPerDay = 24 / freqValue;
  const totalVolume = doseValue * applicationsPerDay * durValue;
  
  const conversionFactor = selectedProduct?.conversionFactor || 1;
  const pricePerUnit = (selectedProduct?.price || 0) / conversionFactor;
  const totalCost = totalVolume * pricePerUnit;

  const handlePrescribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    if (!selectedProduct) {
      alert('⚠️ Por favor, selecione um medicamento válido do estoque para salvar.');
      return;
    }

    // Gerar horários programados
    const times = [];
    let currentHour = new Date().getHours();
    for (let i = 0; i < (applicationsPerDay * durValue); i++) {
      const hourStr = `${String(currentHour).padStart(2, '0')}:00`;
      times.push({ hour: hourStr, administered: false });
      currentHour = (currentHour + freqValue) % 24;
    }

    // Apenas seleciona os do PRIMEIRO DIA na grade horária para simplificar o visual de hoje.
    const timesToday = times.slice(0, applicationsPerDay);
    const billingItemId = `pre-${Date.now()}`;
    const doseCost = doseValue * pricePerUnit;

    const schedule = {
      id: medicationToEdit ? medicationToEdit.id : `ms-${Date.now()}`,
      medication: `${selectedProduct.name} (${dose}${selectedProduct.salesUnit || 'un'})`,
      dosage: `${dose}${selectedProduct.salesUnit || 'un'}`,
      route,
      times: timesToday, // Idealmente seria todos os `times`, mas manteremos `timesToday` como no original, assumindo expansão diária
      billingItemId,
      pricePerUnit: doseCost,
      status: 'active' as const,
      productId: selectedProduct.id,
      frequencyHours: freqValue,
      doseValue: doseValue,
      durationDays: durValue,
      pendingDoses: timesToday.length
    };

    const billingItem = {
      id: billingItemId,
      name: `Prescrição Internação: ${selectedProduct.name} - ${totalVolume.toFixed(1)}${selectedProduct.salesUnit || 'un'}`,
      type: 'product' as const,
      price: totalCost,
      quantity: 1,
    };

    if (medicationToEdit) {
      editHospitalizationPrescription(hosp.id, medicationToEdit.id, schedule, billingItem, pet.tutorId);
      // Alerta de sucesso simplificado ou removido se quiser, mas mantemos para feedback
      alert(`✅ Prescrição atualizada com sucesso!\nA diferença financeira foi estornada/lançada na comanda.`);
    } else {
      addHospitalizationPrescription(hosp.id, schedule, billingItem, pet.tutorId);
      alert(`✅ Prescrição adicionada com sucesso!\nValor de R$ ${totalCost.toFixed(2)} já incluído na fatura.`);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-surface-900 rounded-[var(--radius-xl)] shadow-2xl w-full max-w-md overflow-hidden border border-surface-200 dark:border-surface-700 p-6">
        <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" /> {medicationToEdit ? 'Editar Prescrição' : 'Nova Prescrição (Automática)'}
        </h3>

        <form onSubmit={handlePrescribe} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-650 dark:text-surface-400 mb-1">Medicamento *</label>
            <select
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-600 rounded-[var(--radius-md)] focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Selecione o medicamento...</option>
              {availableMeds.map(p => (
                <option key={p.id} value={p.id}>{p.name} (R$ {p.price.toFixed(2)} {p.conversionFactor && p.salesUnit ? `/ ${p.conversionFactor}${p.salesUnit}` : ''})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-650 dark:text-surface-400 mb-1">Dose p/ aplicação</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  placeholder="Ex: 1.5"
                  className="w-full px-3 py-2 text-sm bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-600 rounded-[var(--radius-md)] focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-surface-500 font-bold">
                  {selectedProduct?.salesUnit || 'un'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-650 dark:text-surface-400 mb-1">Via</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-600 rounded-[var(--radius-md)] focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option>IV</option><option>IM</option><option>SC</option><option>VO</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-650 dark:text-surface-400 mb-1">A cada (Horas)</label>
              <input
                type="number"
                required
                value={frequencyHours}
                onChange={(e) => setFrequencyHours(e.target.value)}
                placeholder="Ex: 8"
                className="w-full px-3 py-2 text-sm bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-600 rounded-[var(--radius-md)] focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-650 dark:text-surface-400 mb-1">Duração (Dias)</label>
              <input
                type="number"
                required
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="Ex: 5"
                className="w-full px-3 py-2 text-sm bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-600 rounded-[var(--radius-md)] focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {selectedProduct && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs">
              <p className="font-bold text-emerald-800 dark:text-emerald-400 mb-2">📊 Resumo do Faturamento</p>
              <div className="space-y-1 text-emerald-700 dark:text-emerald-300">
                <div className="flex justify-between">
                  <span>Aplicações Totais:</span>
                  <span className="font-bold">{applicationsPerDay * durValue} vezes</span>
                </div>
                <div className="flex justify-between">
                  <span>Volume Total Consumido:</span>
                  <span className="font-bold">{totalVolume.toFixed(2)} {selectedProduct.salesUnit || 'un'}</span>
                </div>
                <div className="flex justify-between pt-1 mt-1 border-t border-emerald-200/50 dark:border-emerald-800/50">
                  <span>Custo Proporcional (R$ {pricePerUnit.toFixed(2)} / {selectedProduct.salesUnit || 'un'}):</span>
                  <span className="font-extrabold text-sm text-emerald-900 dark:text-emerald-100">R$ {totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-bold transition-colors flex justify-center items-center gap-2 shadow-sm shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" /> {medicationToEdit ? 'Salvar Alterações' : 'Prescrever'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
