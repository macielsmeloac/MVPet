import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { PlanSwitcher } from './PlanSwitcher';
import { Search, Bell, Moon, Sun, Menu, Shield, LogOut } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TopBar() {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    darkMode,
    toggleDarkMode,
    searchQuery,
    setSearchQuery,
    toggleSidebar
  } = useAppStore();

  const { role } = useAuthStore();
  const isSuperAdmin = role === 'superadmin';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 lg:px-6 gap-4">
      {/* Left: mobile menu + search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-[var(--radius-md)] text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder={isSuperAdmin ? "Buscar clínica assinante..." : "Buscar pet, tutor, produto..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isSuperAdmin ? (
          <span className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-[var(--radius-md)] border border-amber-500/20">
            👑 Super Admin
          </span>
        ) : (
          <PlanSwitcher />
        )}

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-[var(--radius-md)] text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
          title={darkMode ? 'Modo claro' : 'Modo escuro'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-[var(--radius-md)] text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-lg)] shadow-xl overflow-hidden animate-scale-in z-50">
              <div className="flex items-center justify-between p-3 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <span className="font-semibold text-sm text-surface-900 dark:text-white">Notificações</span>
                {unreadCount > 0 && (
                  <button onClick={() => markAllAsRead()} className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">Marcar todas lidas</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-surface-500">Nenhuma notificação</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-3 border-b border-surface-100 dark:border-surface-700/50 last:border-0 cursor-pointer transition-colors ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : 'hover:bg-surface-50 dark:hover:bg-surface-800/80'}`}>
                      <div className="flex gap-3 items-start">
                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-primary-500' : 'bg-transparent'}`} />
                        <div>
                          <p className={`text-sm ${!n.isRead ? 'font-semibold text-surface-900 dark:text-white' : 'font-medium text-surface-700 dark:text-surface-300'}`}>{n.title}</p>
                          <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-surface-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            import('../../store/useAuthStore').then(({ useAuthStore }) => {
              useAuthStore.getState().signOut();
            });
          }}
          className="p-2 ml-1 rounded-[var(--radius-md)] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Sair do sistema"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
