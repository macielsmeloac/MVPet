import { useState } from 'react';
import { Scissors, Check, Clock, User, Phone } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';

export function GroomingPage() {
  const { appointments, pets, tutors } = useDataStore();
  const [activeTab, setActiveTab] = useState<'queue' | 'packages'>('queue');

  // Filter only today's grooming appointments
  const today = new Date().toISOString().split('T')[0];
  const groomingAppointments = appointments
    .filter(a => a.date === today && a.type === 'grooming')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const queued = groomingAppointments.filter(a => a.status === 'scheduled' || a.status === 'waiting');
  const inProgress = groomingAppointments.filter(a => a.status === 'in-progress');
  const completed = groomingAppointments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
          <Scissors className="w-6 h-6 text-pink-500" /> Banho & Tosa
        </h1>
        <p className="text-sm text-surface-500">Controle da agenda de estética de hoje</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-700">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'queue' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          }`}
        >
          Fila de Hoje
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'packages' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          }`}
        >
          Pacotes Ativos
        </button>
      </div>

      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Fila */}
          <div className="space-y-4">
            <h2 className="font-semibold text-surface-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Aguardando ({queued.length})
            </h2>
            <div className="space-y-3">
              {queued.map(apt => {
                const pet = pets.find(p => p.id === apt.petId);
                const tutor = tutors.find(t => t.id === apt.tutorId);
                return (
                  <div key={apt.id} className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-lg)] p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-surface-900 dark:text-white">{pet?.name}</span>
                        {pet?.isAggressive && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Bravo</span>}
                      </div>
                      <span className="text-xs font-semibold text-surface-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.startTime}</span>
                    </div>
                    <p className="text-xs text-surface-500 mb-2">{pet?.breed} · {pet?.weight}kg</p>
                    <div className="bg-surface-50 dark:bg-surface-900/50 rounded-md p-2 text-xs text-surface-600 dark:text-surface-400 mb-3">
                      <strong>Serviço:</strong> {apt.services.map(s => s.name).join(', ')}
                      {apt.notes && <p className="mt-1 italic">Obs: {apt.notes}</p>}
                    </div>
                    <button className="w-full py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-sm font-medium rounded-md transition-colors">
                      Iniciar Serviço
                    </button>
                  </div>
                );
              })}
              {queued.length === 0 && <p className="text-sm text-surface-400 p-4 text-center border border-dashed border-surface-300 dark:border-surface-700 rounded-[var(--radius-lg)]">Fila vazia</p>}
            </div>
          </div>

          {/* Column 2: Em Andamento */}
          <div className="space-y-4">
            <h2 className="font-semibold text-surface-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" /> Em Andamento ({inProgress.length})
            </h2>
            <div className="space-y-3">
              {inProgress.map(apt => {
                const pet = pets.find(p => p.id === apt.petId);
                return (
                  <div key={apt.id} className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/50 rounded-[var(--radius-lg)] p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-primary-900 dark:text-primary-100">{pet?.name}</span>
                      <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1">Iniciado às {apt.startTime}</span>
                    </div>
                    <p className="text-xs text-primary-700 dark:text-primary-300 mb-2">Profissional: {apt.professionalName}</p>
                    <div className="bg-white/50 dark:bg-black/20 rounded-md p-2 text-xs text-primary-800 dark:text-primary-200 mb-3">
                      <strong>Serviço:</strong> {apt.services.map(s => s.name).join(', ')}
                    </div>
                    <button className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Concluir e Avisar Tutor
                    </button>
                  </div>
                );
              })}
              {inProgress.length === 0 && <p className="text-sm text-surface-400 p-4 text-center border border-dashed border-surface-300 dark:border-surface-700 rounded-[var(--radius-lg)]">Nenhum pet no salão</p>}
            </div>
          </div>

          {/* Column 3: Finalizados */}
          <div className="space-y-4">
            <h2 className="font-semibold text-surface-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Prontos para Entrega ({completed.length})
            </h2>
            <div className="space-y-3">
              {completed.map(apt => {
                const pet = pets.find(p => p.id === apt.petId);
                const tutor = tutors.find(t => t.id === apt.tutorId);
                return (
                  <div key={apt.id} className="bg-white dark:bg-surface-800 border-l-4 border-l-green-500 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-lg)] p-4 shadow-sm opacity-80">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-surface-900 dark:text-white">{pet?.name}</span>
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-xs text-surface-500 space-y-1">
                      <p className="flex items-center gap-1.5"><User className="w-3 h-3" /> {tutor?.name}</p>
                      <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {tutor?.phone}</p>
                    </div>
                  </div>
                );
              })}
              {completed.length === 0 && <p className="text-sm text-surface-400 p-4 text-center border border-dashed border-surface-300 dark:border-surface-700 rounded-[var(--radius-lg)]">Nenhum pet aguardando dono</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'packages' && (
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-4">
            <Scissors className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-2">Gestão de Pacotes de Banho</h2>
          <p className="text-surface-500 text-sm max-w-md">Controle de banhos restantes, renovações e histórico de pacotes mensais/quinzenais.</p>
          <button className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-[var(--radius-md)] text-sm transition-colors">
            Ver Planos Ativos
          </button>
        </div>
      )}
    </div>
  );
}
