import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Truck, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { useTutorStore } from '../../store/useTutorStore';

export function TutorAppointmentsPage() {
  const { tutorAuth } = useTutorStore();
  const [step, setStep] = useState<'form' | 'success'>('form');
  
  // Form State
  const [selectedPet, setSelectedPet] = useState('');
  const [serviceType, setServiceType] = useState('Banho e Tosa');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [needsTransport, setNeedsTransport] = useState(false);

  if (!tutorAuth) return null;

  // Mock Pets
  const pets = tutorAuth.petIds.map((id, index) => ({
    id,
    name: index === 0 ? 'Rex' : 'Luna'
  }));

  // Mock Available Times
  const availableTimes = ['09:00', '10:30', '14:00', '15:30', '17:00'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real scenario, this would call an API or useDataStore to create the appointment
    // and if needsTransport is true, create a TransportOrder.
    setStep('success');
  };

  const handleReset = () => {
    setSelectedPet('');
    setSelectedDate('');
    setSelectedTime('');
    setNeedsTransport(false);
    setStep('form');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Agendamento Online</h1>
        <p className="text-surface-500">Agende banhos, tosas e consultas diretamente pela plataforma.</p>
      </div>

      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="space-y-8">
            
            {/* 1. Escolha o Pet e Serviço */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white border-b border-surface-100 dark:border-surface-700 pb-2">
                1. Quem vamos atender?
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Selecione o Pet
                  </label>
                  <select 
                    required
                    value={selectedPet}
                    onChange={(e) => setSelectedPet(e.target.value)}
                    className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-surface-900 dark:text-white transition-all"
                  >
                    <option value="" disabled>Escolha um pet...</option>
                    {pets.map(pet => (
                      <option key={pet.id} value={pet.id}>{pet.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Tipo de Serviço
                  </label>
                  <select 
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-surface-900 dark:text-white transition-all"
                  >
                    <option value="Banho e Tosa">Banho e Tosa</option>
                    <option value="Apenas Banho">Apenas Banho</option>
                    <option value="Consulta Veterinária">Consulta Veterinária</option>
                    <option value="Vacinação">Vacinação</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Data e Hora */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white border-b border-surface-100 dark:border-surface-700 pb-2 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                2. Data e Horário
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Data Desejada
                  </label>
                  <input 
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-surface-900 dark:text-white transition-all"
                  />
                </div>
                
                {selectedDate && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Horários Disponíveis
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.map(time => (
                        <button
                          type="button"
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-1 text-sm text-center rounded-lg border font-medium transition-colors ${
                            selectedTime === time 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:border-indigo-400'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Leva e Traz */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white border-b border-surface-100 dark:border-surface-700 pb-2 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-500" />
                3. Transporte (Leva e Traz)
              </h3>
              
              <label className="flex items-start gap-3 p-4 border border-surface-200 dark:border-surface-700 rounded-xl cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-900/50 transition-colors">
                <div className="flex items-center h-5 mt-0.5">
                  <input 
                    type="checkbox"
                    checked={needsTransport}
                    onChange={(e) => setNeedsTransport(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-surface-300 rounded focus:ring-indigo-500 dark:bg-surface-800 dark:border-surface-600"
                  />
                </div>
                <div>
                  <p className="font-bold text-surface-900 dark:text-white">Solicitar Leva e Traz</p>
                  <p className="text-sm text-surface-500">
                    Buscamos e entregamos o pet na sua casa. Pode haver taxa adicional dependendo da região.
                  </p>
                </div>
              </label>

              {needsTransport && (
                <div className="animate-fade-in p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 mt-4">
                  <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">Endereço de Busca/Entrega cadastrado:</p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    {tutorAuth.address.street}, {tutorAuth.address.number} - {tutorAuth.address.neighborhood} <br/>
                    {tutorAuth.address.city}/{tutorAuth.address.state}
                  </p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-500 mt-2 italic">
                    Para alterar o endereço, entre em contato com a clínica.
                  </p>
                </div>
              )}
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700 flex justify-end">
            <button
              type="submit"
              disabled={!selectedPet || !selectedDate || !selectedTime}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              Confirmar Agendamento
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-8 sm:p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white mb-4">Agendamento Confirmado!</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-2 text-lg">
            Seu agendamento para <strong className="text-surface-900 dark:text-white">{serviceType}</strong> foi realizado com sucesso.
          </p>
          <div className="max-w-md mx-auto bg-surface-50 dark:bg-surface-900 rounded-xl p-4 mt-6 text-left border border-surface-200 dark:border-surface-700">
            <div className="flex items-center gap-3 text-surface-700 dark:text-surface-300 mb-2">
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              <span>{selectedDate.split('-').reverse().join('/')}</span>
            </div>
            <div className="flex items-center gap-3 text-surface-700 dark:text-surface-300 mb-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>{selectedTime}</span>
            </div>
            {needsTransport && (
              <div className="flex items-center gap-3 text-surface-700 dark:text-surface-300">
                <Truck className="w-5 h-5 text-indigo-500" />
                <span>Transporte (Leva e Traz) solicitado</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleReset}
            className="mt-8 px-6 py-3 bg-surface-900 dark:bg-white text-white dark:text-surface-900 font-bold rounded-xl hover:bg-surface-800 dark:hover:bg-surface-100 transition-colors"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      )}
    </div>
  );
}
