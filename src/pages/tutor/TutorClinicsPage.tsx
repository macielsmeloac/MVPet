import { Store, ChevronRight, LogOut } from 'lucide-react';
import { useTutorStore } from '../../store/useTutorStore';
import { useNavigate } from 'react-router-dom';

export function TutorClinicsPage() {
  const { tutorAuth, availableClinics, setActiveClinic, logout } = useTutorStore();
  const navigate = useNavigate();

  if (!tutorAuth) return null;

  const handleSelectClinic = (clinicId: string) => {
    setActiveClinic(clinicId);
    navigate('/tutor/painel');
  };

  const handleLogout = () => {
    logout();
    navigate('/tutor/login');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center bg-white dark:bg-surface-800 p-6 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
              Olá, {tutorAuth.name.split(' ')[0]} 👋
            </h1>
            <p className="text-surface-500">
              Selecione a clínica para acessar as informações do seu pet
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-surface-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </header>

        <div className="grid gap-4">
          {availableClinics.map((clinic) => (
            <button
              key={clinic.id}
              onClick={() => handleSelectClinic(clinic.id)}
              className="bg-white dark:bg-surface-800 p-6 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex items-center gap-4 text-left group"
            >
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                <Store className="w-7 h-7 text-indigo-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-surface-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {clinic.name}
                </h3>
                <p className="text-sm text-surface-500">Acessar prontuários, vacinas e compras</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
