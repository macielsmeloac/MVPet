import { useState } from 'react';
import { useDataStore } from '../store/useDataStore';
import type { TriageLevel } from '../types';
import { AlertTriangle, Plus, Clock } from 'lucide-react';

const triageConfig: Record<TriageLevel, { label: string; bg: string; border: string; text: string; description: string; pulse?: boolean }> = {
  emergency: { label: 'Emergência', bg: 'bg-red-500', border: 'border-red-500', text: 'text-white', description: 'Risco de vida iminente — Atropelamento, parada respiratória', pulse: true },
  'very-urgent': { label: 'Muito Urgente', bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-white', description: 'Dor intensa, hemorragia ativa, convulsão' },
  urgent: { label: 'Urgente', bg: 'bg-yellow-400', border: 'border-yellow-400', text: 'text-yellow-900', description: 'Vômitos persistentes, diarreia com sangue' },
  minor: { label: 'Pouco Urgente', bg: 'bg-green-500', border: 'border-green-500', text: 'text-white', description: 'Claudicação leve, lesão de pele' },
  routine: { label: 'Rotina / Eletivo', bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-white', description: 'Check-up, vacinação, castração eletiva' },
};

const triageLevels: TriageLevel[] = ['emergency', 'very-urgent', 'urgent', 'minor', 'routine'];

interface TriageEntry { id: string; petName: string; breed: string; tutorName: string; level: TriageLevel; symptoms: string; arrivalTime: string; }

export function TriagePage() {
  const { pets, tutors } = useDataStore();
  const [entries, setEntries] = useState<TriageEntry[]>([
    { id: 'tr1', petName: 'Rex', breed: 'Pastor Alemão', tutorName: 'João Santos', level: 'very-urgent', symptoms: 'Fratura exposta na pata dianteira', arrivalTime: '09:45' },
    { id: 'tr2', petName: 'Luna', breed: 'Persa', tutorName: 'Ana Oliveira', level: 'urgent', symptoms: 'Vômitos persistentes há 24h, desidratação', arrivalTime: '10:10' },
    { id: 'tr3', petName: 'Bob', breed: 'Bulldog Francês', tutorName: 'Fernanda Costa', level: 'minor', symptoms: 'Claudicação MPD leve, sem dor à palpação', arrivalTime: '10:30' },
    { id: 'tr4', petName: 'Mia', breed: 'Poodle', tutorName: 'Roberto Lima', level: 'routine', symptoms: 'Vacinação V10 agendada', arrivalTime: '11:00' },
  ]);
  const [showModal, setShowModal] = useState(false);

  const grouped = triageLevels.map((level) => ({
    level,
    config: triageConfig[level],
    entries: entries.filter((e) => e.level === level),
  }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" /> Triagem Manchester
          </h1>
          <p className="text-sm text-surface-500">Classificação de risco na recepção</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-[var(--radius-md)] transition-colors">
          <Plus className="w-4 h-4" /> Nova Triagem
        </button>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-2">
        {triageLevels.map((level) => {
          const cfg = triageConfig[level];
          return (
            <div key={level} className={`${cfg.bg} ${cfg.text} text-xs font-semibold px-3 py-1.5 rounded-full`}>
              {cfg.label}
            </div>
          );
        })}
      </div>

      {/* Triage columns */}
      <div className="space-y-4">
        {grouped.map(({ level, config, entries: levelEntries }) => (
          <div key={level}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${config.bg} ${config.pulse ? 'animate-pulse-emergency' : ''}`} />
              <h2 className="text-sm font-bold text-surface-700 dark:text-surface-300">{config.label}</h2>
              <span className="text-xs text-surface-400">({levelEntries.length})</span>
              <span className="text-[11px] text-surface-400 italic ml-2 hidden sm:inline">{config.description}</span>
            </div>
            {levelEntries.length === 0 ? (
              <div className="text-xs text-surface-400 pl-5 py-2">Nenhum paciente nesta classificação</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {levelEntries.map((entry) => (
                  <div key={entry.id} className={`rounded-[var(--radius-lg)] border-l-4 ${config.border} bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 p-4 transition-all hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 ${config.pulse ? 'animate-pulse-emergency' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-surface-800 dark:text-white">{entry.petName}</span>
                      <div className="flex items-center gap-1 text-xs text-surface-400">
                        <Clock className="w-3 h-3" />{entry.arrivalTime}
                      </div>
                    </div>
                    <p className="text-xs text-surface-500 mb-1">{entry.breed} · Tutor: {entry.tutorName}</p>
                    <p className="text-sm text-surface-700 dark:text-surface-300">{entry.symptoms}</p>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 text-xs font-medium py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-[var(--radius-md)] transition-colors">Iniciar Atendimento</button>
                      <button className="text-xs font-medium py-1.5 px-3 border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 rounded-[var(--radius-md)] hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">Reclassificar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-surface-800 rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] w-full max-w-md p-6 animate-scale-in mx-4">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Nova Triagem</h2>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); setEntries([...entries, { id: `tr-${Date.now()}`, petName: fd.get('petName') as string, breed: fd.get('breed') as string, tutorName: fd.get('tutorName') as string, level: fd.get('level') as TriageLevel, symptoms: fd.get('symptoms') as string, arrivalTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]); setShowModal(false); }} className="space-y-3">
              <input name="petName" required placeholder="Nome do pet" className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder:text-surface-400" />
              <div className="grid grid-cols-2 gap-3">
                <input name="breed" placeholder="Raça" className="text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder:text-surface-400" />
                <input name="tutorName" placeholder="Nome do tutor" className="text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder:text-surface-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">Classificação de Risco</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {triageLevels.map((level) => {
                    const cfg = triageConfig[level];
                    return (
                      <label key={level} className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] hover:bg-surface-50 dark:hover:bg-surface-700/30 cursor-pointer transition-colors">
                        <input type="radio" name="level" value={level} required className="text-primary-500" />
                        <div className={`w-3 h-3 rounded-full ${cfg.bg}`} />
                        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{cfg.label}</span>
                        <span className="text-[10px] text-surface-400 italic">{cfg.description}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <textarea name="symptoms" required rows={2} placeholder="Sintomas observados..." className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 resize-none placeholder:text-surface-400" />
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-[var(--radius-md)] transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-[var(--radius-md)] transition-colors">Classificar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
