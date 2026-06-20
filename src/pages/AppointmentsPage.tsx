import { useState } from 'react';
import { useDataStore } from '../store/useDataStore';
import { Calendar, Clock, Plus, Filter, ChevronLeft, ChevronRight, User, Edit2 } from 'lucide-react';
import type { Appointment, AppointmentStatus } from '../types';

const statusConfig: Record<AppointmentStatus, { label: string; color: string; action?: string; next?: AppointmentStatus }> = {
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', action: 'Chamar', next: 'waiting' },
  waiting: { label: 'Aguardando', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', action: 'Iniciar', next: 'in-progress' },
  'in-progress': { label: 'Em Atendimento', color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400', action: 'Finalizar', next: 'completed' },
  completed: { label: 'Finalizado', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const typeLabels: Record<string, string> = {
  consultation: '🩺 Consulta', surgery: '🔪 Cirurgia', grooming: '✂️ Banho/Tosa', vaccine: '💉 Vacina', exam: '🔬 Exame', return: '🔄 Retorno',
};

const timeSlots = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];

export function AppointmentsPage() {
  const { appointments, pets, tutors, updateAppointmentStatus } = useDataStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]!);
  const [filterSector, setFilterSector] = useState<string>('all');
  const [view, setView] = useState<'list' | 'timeline'>('list');
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const dayAppointments = appointments
    .filter((a) => a.date === selectedDate)
    .filter((a) => filterSector === 'all' || a.sector === filterSector)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const sectors = [...new Set(appointments.map((a) => a.sector))];

  const navigateDay = (dir: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split('T')[0]!);
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Agenda</h1>
          <p className="text-sm text-surface-500 capitalize">{formatDateLabel(selectedDate)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(view === 'list' ? 'timeline' : 'list')} className="px-3 py-2 text-xs font-medium rounded-[var(--radius-md)] border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
            {view === 'list' ? '📊 Timeline' : '📋 Lista'}
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-[var(--radius-md)] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* Date nav + filters */}
      <div className="flex items-center justify-between bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateDay(-1)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            <ChevronLeft className="w-4 h-4 text-surface-500" />
          </button>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-1.5 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300" />
          <button onClick={() => navigateDay(1)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            <ChevronRight className="w-4 h-4 text-surface-500" />
          </button>
          <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0]!)} className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline ml-1">Hoje</button>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-400" />
          <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className="text-xs border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-2 py-1.5 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300">
            <option value="all">Todos os setores</option>
            {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Appointments */}
      {view === 'list' ? (
        <div className="space-y-2 stagger-children">
          {dayAppointments.length === 0 ? (
            <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-12 text-center">
              <Calendar className="w-12 h-12 text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500">Nenhum agendamento para este dia</p>
            </div>
          ) : (
            dayAppointments.map((apt) => {
              const pet = pets.find((p) => p.id === apt.petId);
              const tutor = tutors.find((t) => t.id === apt.tutorId);
              const cfg = statusConfig[apt.status];
              return (
                <div key={apt.id} className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-4 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex flex-col items-center shrink-0 w-14">
                        <Clock className="w-3.5 h-3.5 text-surface-400 mb-0.5" />
                        <span className="text-lg font-bold text-surface-800 dark:text-white">{apt.startTime}</span>
                      </div>
                      <div className="w-px h-12 bg-surface-200 dark:bg-surface-700 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-surface-800 dark:text-white">{pet?.name ?? 'Pet'}</span>
                          {pet?.isAggressive && <span className="text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full">⚠️ Bravo</span>}
                          <span className="text-xs text-surface-500">{pet?.breed}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-surface-500">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{tutor?.name}</span>
                          <span>{typeLabels[apt.type] ?? apt.type}</span>
                          <span className="text-surface-400">·</span>
                          <span>{apt.sector}</span>
                          <span className="text-surface-400">·</span>
                          <span>{apt.professionalName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      <button onClick={() => setEditingAppointment(apt)} className="p-1.5 text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-[var(--radius-md)] transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {cfg.action && cfg.next && (
                        <button onClick={() => updateAppointmentStatus(apt.id, cfg.next!)} className="px-3 py-1.5 text-xs font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-[var(--radius-md)] transition-colors">
                          {cfg.action}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Timeline View */
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 overflow-hidden">
          <div className="grid grid-cols-[80px_1fr] divide-x divide-surface-200 dark:divide-surface-700">
            {timeSlots.map((slot) => {
              const slotApts = dayAppointments.filter((a) => a.startTime === slot);
              return (
                <div key={slot} className="contents">
                  <div className="p-3 text-xs font-medium text-surface-500 text-right border-b border-surface-100 dark:border-surface-800">{slot}</div>
                  <div className="p-2 border-b border-surface-100 dark:border-surface-800 min-h-[44px] flex items-center gap-2 flex-wrap">
                    {slotApts.map((apt) => {
                      const pet = pets.find((p) => p.id === apt.petId);
                      const cfg = statusConfig[apt.status];
                      return (
                        <div 
                          key={apt.id} 
                          onClick={() => setEditingAppointment(apt)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color} cursor-pointer hover:opacity-80 transition-opacity`}
                        >
                          {pet?.name} · {typeLabels[apt.type]?.split(' ')[1] ?? apt.type}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Appointment modal */}
      {(showModal || editingAppointment) && (
        <AppointmentModal 
          appointment={editingAppointment} 
          onClose={() => { setShowModal(false); setEditingAppointment(null); }} 
        />
      )}
    </div>
  );
}

function AppointmentModal({ appointment, onClose }: { appointment?: Appointment | null, onClose: () => void }) {
  const { pets, tutors, addAppointment, updateAppointment } = useDataStore();
  const [form, setForm] = useState({ 
    petId: appointment?.petId || '', 
    tutorId: appointment?.tutorId || '', 
    professionalName: appointment?.professionalName || '', 
    type: appointment?.type || ('consultation' as Appointment['type']), 
    sector: appointment?.sector || 'Consultório 1', 
    date: appointment?.date || new Date().toISOString().split('T')[0]!, 
    startTime: appointment?.startTime || '09:00', 
    notes: appointment?.notes || '' 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPet = pets.find(p => p.id === form.petId);
    const tutorId = selectedPet?.tutorId ?? form.tutorId;
    const petTutor = tutors.find(t => t.id === tutorId);

    if (petTutor?.hasDebt) {
      alert('🔒 BLOQUEIO DE INADIMPLÊNCIA: O tutor deste animal possui pendências financeiras ativas. Novos agendamentos de consultas ou procedimentos estão fisicamente travados até que o saldo devedor seja regularizado no CRM/Financeiro.');
      return;
    }
    
    if (appointment) {
      updateAppointment(appointment.id, {
        ...form,
        tutorId,
      });
    } else {
      addAppointment({
        ...form,
        id: `a-${Date.now()}`,
        tutorId,
        status: 'scheduled',
        services: [{ id: `s-${Date.now()}`, name: form.type === 'consultation' ? 'Consulta' : form.type, price: 150, quantity: 1 }],
        createdAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-surface-800 rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] w-full max-w-lg p-6 animate-scale-in mx-4">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1 block">Pet</label>
              <select required value={form.petId} onChange={(e) => setForm({ ...form, petId: e.target.value })} className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200">
                <option value="">Selecione...</option>
                {pets.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1 block">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Appointment['type'] })} className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200">
                <option value="consultation">Consulta</option>
                <option value="vaccine">Vacina</option>
                <option value="exam">Exame</option>
                <option value="surgery">Cirurgia</option>
                <option value="grooming">Banho/Tosa</option>
                <option value="return">Retorno</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1 block">Data</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200" />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1 block">Horário</label>
              <select value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200">
                {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1 block">Setor</label>
              <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200">
                <option>Consultório 1</option>
                <option>Consultório 2</option>
                <option>Banho e Tosa</option>
                <option>Centro Cirúrgico</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1 block">Profissional</label>
            <input type="text" value={form.professionalName} onChange={(e) => setForm({ ...form, professionalName: e.target.value })} placeholder="Nome do profissional" className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder:text-surface-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1 block">Observações</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-[var(--radius-md)] transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-[var(--radius-md)] transition-colors">Agendar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
