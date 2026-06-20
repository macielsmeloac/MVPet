import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useTutorStore } from '../../store/useTutorStore';
import { LayoutDashboard, FileText, Syringe, ClipboardList, ShoppingBag, Store, LogOut, Moon, Sun, Calendar } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function TutorShell() {
  const { tutorAuth, activeClinicId, availableClinics, logout } = useTutorStore();
  const { darkMode, toggleDarkMode } = useAppStore();
  const location = useLocation();

  if (!tutorAuth) {
    return <Navigate to="/tutor/login" replace />;
  }

  if (!activeClinicId) {
    return <Navigate to="/tutor/clinicas" replace />;
  }

  const activeClinic = availableClinics.find(c => c.id === activeClinicId);

  const navItems = [
    { label: 'Painel', path: '/tutor/painel', icon: LayoutDashboard },
    { label: 'Agendar', path: '/tutor/agendamento', icon: Calendar },
    { label: 'Prontuários', path: '/tutor/prontuarios', icon: FileText },
    { label: 'Exames & Receitas', path: '/tutor/exames-receitas', icon: ClipboardList },
    { label: 'Vacinas', path: '/tutor/vacinas', icon: Syringe },
    { label: 'Loja', path: '/tutor/loja', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex flex-col">
      {/* Mobile-friendly Header */}
      <header className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/tutor/clinicas" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-lg hover:text-indigo-500 transition-colors">
                <Store className="w-6 h-6" />
                <span className="hidden sm:inline">{activeClinic?.name}</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                title="Alternar Tema"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                    {tutorAuth.name}
                  </p>
                  <p className="text-xs text-surface-500">Tutor</p>
                </div>
                <button 
                  onClick={logout}
                  className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-600 dark:text-surface-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto scrollbar-hide py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-50 dark:hover:bg-surface-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
