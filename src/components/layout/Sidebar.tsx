import { useAppStore } from '../../store/useAppStore';
import { getNavCategories } from '../../utils/plan-config';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, PawPrint, Shield, LayoutDashboard, Users, CreditCard, Building } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function Sidebar() {
  const { currentPlan, sidebarCollapsed, toggleSidebar } = useAppStore();
  const { role } = useAuthStore();
  const location = useLocation();

  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin';

  let categories = isSuperAdmin
    ? [
        {
          category: 'Administração SaaS',
          items: [
            {
              id: 'saas-dashboard',
              label: 'Métricas SaaS',
              icon: LayoutDashboard,
              path: '/super-admin?tab=dashboard',
            },
            {
              id: 'saas-clients',
              label: 'Clínicas Assinantes',
              icon: Users,
              path: '/super-admin?tab=clients',
            },
            {
              id: 'saas-billing',
              label: 'Mensalidades / SaaS',
              icon: CreditCard,
              path: '/super-admin?tab=billing',
            },
          ],
        },
      ]
    : getNavCategories(currentPlan);

  if (isAdmin && !isSuperAdmin) {
    categories.unshift({
      category: 'Gestão & Administração',
      items: [
        {
          id: 'clinic-admin',
          label: 'Painel da Clínica',
          icon: Building,
          path: '/admin',
          plans: ['petshop', 'clinic', 'office', 'complete'],
          category: 'Gestão & Administração',
        },
      ],
    });
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white/70 dark:bg-surface-900/70 backdrop-blur-md border-r border-surface-200/50 dark:border-surface-800/50 transition-all duration-300 ease-out flex flex-col ${
        sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
      style={{ boxShadow: 'var(--shadow-sidebar)' }}
    >
      {/* Logo */}
      <div className="flex flex-col border-b border-surface-200 dark:border-surface-800 shrink-0 justify-center min-h-[64px]">
        <div className="flex items-center gap-3 px-4 h-16 shrink-0">
          <div
            className={`w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 transition-all duration-300 ${
              isSuperAdmin
                ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)] text-white'
                : 'bg-primary-500 text-white'
            }`}
          >
            {isSuperAdmin ? (
              <Shield className="w-5 h-5 text-white animate-pulse" />
            ) : (
              <PawPrint className="w-5 h-5 text-white" />
            )}
          </div>
          {!sidebarCollapsed && (
            <span className="text-lg font-bold text-surface-900 dark:text-white tracking-tight animate-fade-in">
              {isSuperAdmin ? 'MVPet SaaS' : 'MVPet'}
            </span>
          )}
        </div>
        {isSuperAdmin && !sidebarCollapsed && (
          <div className="px-4 pb-2 -mt-2 text-[9px] font-bold text-amber-500 tracking-widest uppercase animate-fade-in">
            Painel Geral
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {categories.map(({ category, items }) => (
          <div key={category} className="mb-3">
            {!sidebarCollapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                {category}
              </p>
            )}
            {items.map((item) => {
              // Verifica se o item está ativo comparando a rota atual + query params
              const currentPath = location.pathname + location.search;
              const isItemActive = isSuperAdmin 
                ? currentPath === item.path || (item.id === 'saas-dashboard' && currentPath === '/super-admin')
                : location.pathname === item.path;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-[13.5px] font-medium transition-all duration-200 mb-0.5 ${
                    isItemActive
                      ? isSuperAdmin
                        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-semibold'
                        : 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  {!sidebarCollapsed && <span className="animate-fade-in">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-12 border-t border-surface-200 dark:border-surface-800 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors shrink-0"
      >
        <ChevronLeft
          className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
        />
      </button>
    </aside>
  );
}
