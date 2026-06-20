import { HeartPulse, Syringe, Calendar, Bell } from 'lucide-react';
import { useTutorStore } from '../../store/useTutorStore';

export function TutorDashboardPage() {
  const { tutorAuth } = useTutorStore();

  if (!tutorAuth) return null;

  // Mock Pets data
  const pets = [
    {
      id: 'pet-1',
      name: 'Rex',
      breed: 'Golden Retriever',
      photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=150&h=150',
      nextVaccine: '15/10/2026',
      status: 'Saudável'
    },
    {
      id: 'pet-2',
      name: 'Luna',
      breed: 'Gato Persa',
      photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=150&h=150',
      nextVaccine: '02/11/2026',
      status: 'Em tratamento'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Resumo dos Pets</h1>
          <p className="text-surface-500">Acompanhe a saúde e os compromissos dos seus animais.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map(pet => (
          <div key={pet.id} className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={pet.photo} 
                  alt={pet.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900/50"
                />
                <div>
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white">{pet.name}</h3>
                  <p className="text-sm text-surface-500">{pet.breed}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    <span>Status Clínico</span>
                  </div>
                  <span className="font-medium text-surface-900 dark:text-white">{pet.status}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                    <Syringe className="w-4 h-4 text-emerald-500" />
                    <span>Próxima Vacina</span>
                  </div>
                  <span className="font-medium text-surface-900 dark:text-white">{pet.nextVaccine}</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-50 dark:bg-surface-800/50 p-4 border-t border-surface-100 dark:border-surface-700/50 flex justify-end gap-2">
              <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
                Ver Histórico
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          Avisos Recentes
        </h2>
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 divide-y divide-surface-100 dark:divide-surface-700/50">
          <div className="p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Syringe className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">Vacina V10 do Rex vence em breve</p>
              <p className="text-xs text-surface-500">Agende a aplicação até dia 15/10/2026 para manter o pet protegido.</p>
            </div>
          </div>
          <div className="p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">Retorno Consulta - Luna</p>
              <p className="text-xs text-surface-500">Amanhã às 14:00h com o Dr. Marcos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
